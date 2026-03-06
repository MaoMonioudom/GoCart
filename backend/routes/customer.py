from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required
from services.customer_service import get_product_service as get_customer_product_service, list_products_service as list_customer_products_service
from supabase_client import supabase

customer = Blueprint("customer", __name__, url_prefix="/customer")

# ==============================
# 1. CUSTOMER: LIST PRODUCTS Public
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
# 2. CUSTOMER: GET SINGLE PRODUCT (WITH IMAGES)
# ==========================================
@customer.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        result, status = get_customer_product_service(product_id)
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===========================
# 3. Customer: CREATE ORDER
# ===========================
@customer.route("/orders", methods=["POST"])
@token_required
def create_order():
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can create orders"}), 403

    try:
        data = request.get_json() or {}

        product_id = data.get("product_id")
        quantity = data.get("quantity")
        promo_id = data.get("promo_id") or 1  # Ensure this exists in promotions (e.g., NO_PROMO)

        if not product_id or not quantity:
            return jsonify({"error": "Product and quantity required"}), 400

        product_resp = (
            supabase.table("products")
            .select("*")
            .eq("product_id", product_id)
            .execute()
        )

        if not product_resp.data:
            return jsonify({"error": "Product not found"}), 404

        product = product_resp.data[0]

        if product["current_stock_level"] < quantity:
            return jsonify({"error": "Not enough stock"}), 400

        unit_price = product["price"]
        final_price = unit_price * quantity
        total_amount = final_price

        # Create order
        order_resp = supabase.table("orders").insert({
            "customer_id": user["user_id"],
            "total_amount": total_amount,
            "status": "pending",
            "payment_status": "unpaid"
        }).execute()

        if not order_resp.data:
            return jsonify({"error": "Failed to create order"}), 400

        order_id = order_resp.data[0]["order_id"]

        # Insert order item (FIXED: no "price" column)
        supabase.table("order_item").insert({
            "order_id": order_id,
            "product_id": product_id,
            "quantity": quantity,
            "unit_price": unit_price,
            "final_price": final_price,
            "promo_id": promo_id
        }).execute()

        # Reduce stock
        supabase.table("products").update({
            "current_stock_level": product["current_stock_level"] - quantity
        }).eq("product_id", product_id).execute()

        # The DB trigger will create the seller notification automatically

        return jsonify({
            "message": "Order created",
            "order_id": order_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ==========================
# 4. CUSTOMER: VIEW ORDERS
# ==========================
@customer.route("/orders", methods=["GET"])
@token_required
def list_orders():
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can view orders"}), 403

    try:
        response = supabase.table("orders") \
            .select("*") \
            .eq("customer_id", user["user_id"]) \
            .execute()

        return jsonify({"orders": response.data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================
# 5. CUSTOMER: CANCEL ORDER
# ==========================
@customer.route("/orders/<order_id>", methods=["GET"])
@token_required
def get_order(order_id):
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can view orders"}), 403

    try:
        order_resp = supabase.table("orders") \
            .select("*") \
            .eq("order_id", order_id) \
            .eq("customer_id", user["user_id"]) \
            .execute()

        if not order_resp.data:
            return jsonify({"error": "Order not found"}), 404

        order = order_resp.data[0]

        items_resp = supabase.table("order_item") \
            .select("*") \
            .eq("order_id", order_id) \
            .execute()

        order["items"] = items_resp.data

        return jsonify(order), 200

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
        order_resp = supabase.table("orders") \
            .select("*") \
            .eq("order_id", order_id) \
            .eq("customer_id", user["user_id"]) \
            .execute()

        if not order_resp.data:
            return jsonify({"error": "Order not found"}), 404

        order = order_resp.data[0]

        if order["status"] != "pending":
            return jsonify({"error": "Only pending orders can be cancelled"}), 400

        supabase.table("orders").update({
            "status": "cancelled"
        }).eq("order_id", order_id).execute()

        return jsonify({"message": "Order cancelled"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# 8. ADDRESS MANAGEMENT: Add address
# ===============================
@customer.route("/addresses", methods=["POST"])
@token_required
def add_address():
    user = request.user

    if user.get("role") != "customer":
        return jsonify({"error": "Only customers can add addresses"}), 403

    try:
        data = request.get_json() or {}

        response = supabase.table("address").insert({
            "customer_id": user["user_id"],
            "line1": data.get("line1"),
            "city": data.get("city"),
            "postal_code": data.get("postal_code"),
            "country": data.get("country")
        }).execute()

        return jsonify({"address": response.data}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================================
# 9. ADDRESS MANAGEMENT: List addresses
# ==================================
@customer.route("/addresses", methods=["GET"])
@token_required
def list_addresses():
    user = request.user

    response = supabase.table("address") \
        .select("*") \
        .eq("customer_id", user["user_id"]) \
        .execute()

    return jsonify({"addresses": response.data}), 200

# Add this new route to the customer blueprint:

@customer.route("/promotions", methods=["GET"])
def get_promotions():
    """
    Get active promotions grouped with associated products.
    Optional query params:
        - category_id
        - search
    """
    try:
        category_id = request.args.get("category_id")
        search = request.args.get("search")
        result, status = list_customer_products_service(category_id, search)
        products = [product for product in (result.get("products") or []) if product.get("promotion")]

        promotions_map = {}
        for product in products:
            promotion = product.get("promotion") or {}
            promo_id = promotion.get("promo_id")
            if not promo_id:
                continue

            promo_group = promotions_map.setdefault(
                promo_id,
                {
                    "promo_id": promo_id,
                    "promo_name": promotion.get("promo_name"),
                    "disc_pct": promotion.get("disc_pct", 0),
                    "disc_amount": promotion.get("disc_amount", 0),
                    "start_date": promotion.get("start_date"),
                    "end_date": promotion.get("end_date"),
                    "products": [],
                },
            )
            promo_group["products"].append(product)

        promotions = sorted(promotions_map.values(), key=lambda promo: promo["promo_id"], reverse=True)
        return jsonify({"promotions": promotions}), status

    except Exception as e:
        print(f"Error fetching promotions: {e}")
        return jsonify({"error": str(e)}), 500


@customer.route("/products/promotions", methods=["GET"])
def get_products_with_promotions():
    try:
        category_id = request.args.get("category_id")
        search = request.args.get("search")
        result, status = list_customer_products_service(category_id, search)
        return jsonify(result), status

    except Exception as e:
        print(f"Error fetching products with promotions: {e}")
        return jsonify({"error": str(e)}), 500

