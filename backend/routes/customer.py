from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required
from services.customer_service import get_product_service as get_customer_product_service, list_products_service as list_customer_products_service
from supabase_client import supabase

customer = Blueprint("customer", __name__, url_prefix="/customer")

# ==============================
# 1. CUSTOMER: LIST PRODUCTS (Public)
# ==============================
@customer.route("/products", methods=["GET"])
def list_products():
    try:
        category_id = request.args.get("category_id")
        search = request.args.get("search")
        result, status = list_customer_products_service(category_id, search)
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# 2. CUSTOMER: GET SINGLE PRODUCT (Public)
# ==========================================
@customer.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        result, status = get_customer_product_service(product_id)
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================
# 3. CUSTOMER: CREATE ORDER
# ===========================
@customer.route("/orders", methods=["POST"])
@token_required
def create_order():
    """
    Create an order from a cart (items array).
    Expected body:
      {
        "address_id": <int>,          # optional if street_address provided
        "street_address": <str>,      # used when no address_id
        "city_province": <str>,
        "payment_method": <str>,
        "items": [
          { "product_id": <int>, "quantity": <int>, "promo_id": <int|null> },
          ...
        ]
      }
    """
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can create orders"}), 403

    try:
        data = request.get_json() or {}
        items = data.get("items", [])
        address_id = data.get("address_id")
        payment_method = data.get("payment_method", "cod")

        if not items:
            return jsonify({"error": "Order must contain at least one item"}), 400

        # ── Resolve address ────────────────────────────────────────────────
        if not address_id:
            street = (data.get("street_address") or "").strip()
            city   = (data.get("city_province") or "").strip()
            if not street or not city:
                return jsonify({"error": "Shipping address is required"}), 400

            addr_resp = supabase.table("addresses").insert({
                "user_id": user["user_id"],
                "street_address": street,
                "city_province": city,
                "is_default": False
            }).execute()

            if not addr_resp.data:
                return jsonify({"error": "Failed to save shipping address"}), 500

            address_id = addr_resp.data[0]["address_id"]

        # ── Validate every product is active and has enough stock ──────────
        product_ids = [item.get("product_id") for item in items if item.get("product_id")]
        if not product_ids:
            return jsonify({"error": "No valid product IDs provided"}), 400

        products_resp = (
            supabase.table("products")
            .select("product_id, name, price, status, current_stock_level")
            .in_("product_id", product_ids)
            .execute()
        )

        products_map = {p["product_id"]: p for p in (products_resp.data or [])}

        total_amount = 0.0
        validated_items = []

        for item in items:
            pid      = item.get("product_id")
            qty      = item.get("quantity", 1)
            promo_id = item.get("promo_id")

            product = products_map.get(pid)
            if not product:
                return jsonify({"error": f"Product {pid} not found"}), 404

            # Block orders for inactive products
            if product.get("status") != "active":
                return jsonify({
                    "error": f'"{product["name"]}" is no longer available. Please remove it from your cart.'
                }), 400

            if product["current_stock_level"] < qty:
                return jsonify({
                    "error": f'Not enough stock for "{product["name"]}". Available: {product["current_stock_level"]}'
                }), 400

            unit_price  = float(product["price"])
            final_price = unit_price * qty
            total_amount += final_price

            validated_items.append({
                "product_id":    pid,
                "quantity":      qty,
                "unit_price":    unit_price,
                "final_price":   final_price,
                "promo_id":      promo_id,
                "current_stock": product["current_stock_level"],
            })

        # ── Create order ───────────────────────────────────────────────────
        order_resp = supabase.table("orders").insert({
            "user_id":        user["user_id"],
            "address_id":     address_id,
            "total_amount":   round(total_amount, 2),
            "status":         "pending",
            "payment_status": "unpaid",
        }).execute()

        if not order_resp.data:
            return jsonify({"error": "Failed to create order"}), 500

        order_id = order_resp.data[0]["order_id"]

        # ── Insert order items and deduct stock ────────────────────────────
        for item in validated_items:
            row = {
                "order_id":    order_id,
                "product_id":  item["product_id"],
                "quantity":    item["quantity"],
                "unit_price":  item["unit_price"],
                "final_price": item["final_price"],
            }
            if item["promo_id"]:
                row["promo_id"] = item["promo_id"]

            supabase.table("order_item").insert(row).execute()

            supabase.table("products").update({
                "current_stock_level": item["current_stock"] - item["quantity"]
            }).eq("product_id", item["product_id"]).execute()

        return jsonify({"message": "Order created", "order_id": order_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================
# 4. CUSTOMER: LIST ORDERS
# ==========================
@customer.route("/orders", methods=["GET"])
@token_required
def list_orders():
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can view orders"}), 403

    try:
        response = (
            supabase.table("orders")
            .select("*")
            .eq("user_id", user["user_id"])
            .order("date", desc=True)
            .execute()
        )
        orders = response.data or []

        # Attach payment_method from payments table
        if orders:
            order_ids = [o["order_id"] for o in orders]
            pay_resp = (
                supabase.table("payment")
                .select("order_id, payment_method, status")
                .in_("order_id", order_ids)
                .execute()
            )
            pay_map = {p["order_id"]: p for p in (pay_resp.data or [])}
            for order in orders:
                pay = pay_map.get(order["order_id"])
                order["payment_method"] = pay["payment_method"] if pay else None

        return jsonify({"orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================
# 5. CUSTOMER: GET ONE ORDER
# ============================
@customer.route("/orders/<order_id>", methods=["GET"])
@token_required
def get_order(order_id):
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can view orders"}), 403

    try:
        order_resp = (
            supabase.table("orders")
            .select("*")
            .eq("order_id", order_id)
            .eq("user_id", user["user_id"])
            .execute()
        )

        if not order_resp.data:
            return jsonify({"error": "Order not found"}), 404

        order = order_resp.data[0]

        # ── Fetch address ──────────────────────────────────────────────────
        if order.get("address_id"):
            addr_resp = (
                supabase.table("addresses")
                .select("*")
                .eq("address_id", order["address_id"])
                .execute()
            )
            order["address"] = addr_resp.data[0] if addr_resp.data else None

        # ── Fetch items with product name + main image ─────────────────────
        items_resp = (
            supabase.table("order_item")
            .select("*, products(name, description, product_image(image_url, is_main))")
            .eq("order_id", order_id)
            .execute()
        )

        normalized_items = []
        for item in (items_resp.data or []):
            product = item.pop("products", {}) or {}
            images = product.get("product_image") or []
            # Pick main image or first available
            main_img = next((img["image_url"] for img in images if img.get("is_main")), None)
            if not main_img and images:
                main_img = images[0].get("image_url")

            item["product_name"]        = product.get("name", f"Product #{item.get('product_id')}")
            item["product_description"] = product.get("description", "")
            item["product_image"]       = main_img
            normalized_items.append(item)

        order["items"] = normalized_items

        # ── Fetch payment info ─────────────────────────────────────────────
        pay_resp = (
            supabase.table("payment")
            .select("*")
            .eq("order_id", order_id)
            .limit(1)
            .execute()
        )
        order["payment"] = pay_resp.data[0] if pay_resp.data else None

        return jsonify({"order": order}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# 6. CUSTOMER: CANCEL ORDER
# =========================
@customer.route("/orders/<order_id>/cancel", methods=["PUT"])
@token_required
def cancel_order(order_id):
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can cancel orders"}), 403

    try:
        order_resp = (
            supabase.table("orders")
            .select("*")
            .eq("order_id", order_id)
            .eq("user_id", user["user_id"])
            .execute()
        )

        if not order_resp.data:
            return jsonify({"error": "Order not found"}), 404

        order = order_resp.data[0]

        if order["status"] != "pending":
            return jsonify({"error": "Only pending orders can be cancelled"}), 400

        supabase.table("orders").update({"status": "cancelled"}).eq("order_id", order_id).execute()

        # Restore stock for each cancelled item
        items_resp = supabase.table("order_item").select("product_id, quantity").eq("order_id", order_id).execute()
        for item in (items_resp.data or []):
            product_resp = supabase.table("products").select("current_stock_level").eq("product_id", item["product_id"]).execute()
            if product_resp.data:
                current = product_resp.data[0]["current_stock_level"]
                supabase.table("products").update({
                    "current_stock_level": current + item["quantity"]
                }).eq("product_id", item["product_id"]).execute()

        return jsonify({"message": "Order cancelled"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===============================
# 7. ADDRESS MANAGEMENT: Add
# ===============================
@customer.route("/addresses", methods=["POST"])
@token_required
def add_address():
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can add addresses"}), 403

    try:
        data = request.get_json() or {}

        # If setting as default, clear existing defaults first
        if data.get("is_default"):
            supabase.table("addresses").update({"is_default": False}).eq("user_id", user["user_id"]).execute()

        response = supabase.table("addresses").insert({
            "user_id":        user["user_id"],
            "street_address": data.get("street_address", ""),
            "city_province":  data.get("city_province", ""),
            "is_default":     data.get("is_default", False),
        }).execute()

        return jsonify({"address": response.data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==================================
# 8. ADDRESS MANAGEMENT: List
# ==================================
@customer.route("/addresses", methods=["GET"])
@token_required
def list_addresses():
    user = request.user

    try:
        response = (
            supabase.table("addresses")
            .select("*")
            .eq("user_id", user["user_id"])
            .order("is_default", desc=True)
            .execute()
        )
        return jsonify({"addresses": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==================================
# 9. ADDRESS MANAGEMENT: Update
# ==================================
@customer.route("/addresses/<int:address_id>", methods=["PUT"])
@token_required
def update_address(address_id):
    user = request.user

    try:
        data = request.get_json() or {}

        check = supabase.table("addresses").select("address_id").eq("address_id", address_id).eq("user_id", user["user_id"]).execute()
        if not check.data:
            return jsonify({"error": "Address not found"}), 404

        if data.get("is_default"):
            supabase.table("addresses").update({"is_default": False}).eq("user_id", user["user_id"]).execute()

        updates = {}
        for field in ["street_address", "city_province", "is_default"]:
            if field in data:
                updates[field] = data[field]

        if updates:
            supabase.table("addresses").update(updates).eq("address_id", address_id).execute()

        return jsonify({"message": "Address updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==================================
# 10. ADDRESS MANAGEMENT: Delete
# ==================================
@customer.route("/addresses/<int:address_id>", methods=["DELETE"])
@token_required
def delete_address(address_id):
    user = request.user

    try:
        check = supabase.table("addresses").select("address_id").eq("address_id", address_id).eq("user_id", user["user_id"]).execute()
        if not check.data:
            return jsonify({"error": "Address not found"}), 404

        supabase.table("addresses").delete().eq("address_id", address_id).execute()
        return jsonify({"message": "Address deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# 11. PROMOTIONS (Public)
# ==============================
@customer.route("/promotions", methods=["GET"])
def get_promotions():
    """Active promotions grouped by promo, only from active products."""
    try:
        category_id = request.args.get("category_id")
        search = request.args.get("search")
        result, status = list_customer_products_service(category_id, search)
        products = [p for p in (result.get("products") or []) if p.get("promotion")]

        promotions_map = {}
        for product in products:
            promotion = product.get("promotion") or {}
            promo_id = promotion.get("promo_id")
            if not promo_id:
                continue
            promo_group = promotions_map.setdefault(
                promo_id,
                {
                    "promo_id":    promo_id,
                    "promo_name":  promotion.get("promo_name"),
                    "disc_pct":    promotion.get("disc_pct", 0),
                    "disc_amount": promotion.get("disc_amount", 0),
                    "start_date":  promotion.get("start_date"),
                    "end_date":    promotion.get("end_date"),
                    "products":    [],
                },
            )
            promo_group["products"].append(product)

        promotions = sorted(promotions_map.values(), key=lambda p: p["promo_id"], reverse=True)
        return jsonify({"promotions": promotions}), status

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@customer.route("/products/promotions", methods=["GET"])
def get_products_with_promotions():
    try:
        category_id = request.args.get("category_id")
        search = request.args.get("search")
        result, status = list_customer_products_service(category_id, search)
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500
