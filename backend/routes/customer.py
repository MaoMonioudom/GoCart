from flask import Blueprint, request, jsonify

from supabase_client import supabase
from middleware.auth_middleware import token_required, role_required

customer = Blueprint("customer", __name__, url_prefix="/customer")

# ---------- Helpers (unchanged) ----------
def _get_or_create_cart_order(user_id: int):
    resp = (
        supabase.table("orders")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "cart")
        .order("date", desc=True)
        .limit(1)
        .execute()
    )
    if resp.data:
        return resp.data[0]

    created = (
        supabase.table("orders")
        .insert(
            {
                "user_id": user_id,
                "total_amount": 0,
                "status": "cart",
                "payment_status": "unpaid",
            }
        )
        .execute()
    )
    return created.data[0] if created.data else None


def _get_cart_items(order_id: int):
    return (
        supabase.table("order_item")
        .select("*")
        .eq("order_id", order_id)
        .execute()
    ).data or []


def _get_products_by_ids(product_ids):
    if not product_ids:
        return {}
    resp = supabase.table("products").select("*").in_("product_id", product_ids).execute()
    products = resp.data or []
    return {p["product_id"]: p for p in products}


def _recalc_and_update_total(order_id: int):
    items = _get_cart_items(order_id)
    total = 0
    for it in items:
        try:
            total += float(it.get("final_price") or 0)
        except Exception:
            pass
    supabase.table("orders").update({"total_amount": total}).eq("order_id", order_id).execute()
    return total


def _ensure_address(user_id: int, payload: dict):
    address_id = payload.get("address_id")
    if address_id:
        return address_id

    addr = payload.get("address") or {}
    street = addr.get("street_address") or addr.get("street") or payload.get("street_address")
    city = addr.get("city_province") or addr.get("city") or payload.get("city_province")
    if not street and not city:
        return None

    created = (
        supabase.table("addresses")
        .insert({"user_id": user_id, "street_address": street, "city_province": city, "is_default": False})
        .execute()
    )
    return created.data[0]["address_id"] if created.data else None


def _cart_response(order_id: int):
    items = _get_cart_items(order_id)
    product_map = _get_products_by_ids([i["product_id"] for i in items if i.get("product_id") is not None])

    enriched = []
    for it in items:
        p = product_map.get(it.get("product_id")) or {}
        enriched.append(
            {
                "item_id": it.get("item_id"),
                "product_id": it.get("product_id"),
                "quantity": it.get("quantity"),
                "unit_price": it.get("unit_price"),
                "final_price": it.get("final_price"),
                "product": p,
            }
        )

    total = _recalc_and_update_total(order_id)
    return {"order_id": order_id, "items": enriched, "total_amount": total}


# ---------- Cart endpoints ----------
@customer.route("/cart", methods=["GET"])
@token_required
@role_required("customer")
def get_cart():
    user = request.user
    try:
        cart_order = _get_or_create_cart_order(user["user_id"])
        if not cart_order:
            return jsonify({"error": "Failed to create cart"}), 500
        return jsonify(_cart_response(cart_order["order_id"])), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch cart", "details": str(e)}), 500


@customer.route("/cart", methods=["POST"])
@token_required
@role_required("customer")
def set_cart():
    user = request.user
    data = request.get_json(silent=True) or {}
    items = data.get("items")

    if not isinstance(items, list):
        return jsonify({"error": "items must be a list"}), 400

    try:
        cart_order = _get_or_create_cart_order(user["user_id"])
        if not cart_order:
            return jsonify({"error": "Failed to create cart"}), 500

        order_id = cart_order["order_id"]

        supabase.table("order_item").delete().eq("order_id", order_id).execute()

        cleaned = []
        for it in items:
            try:
                pid = int(it.get("product_id"))
                qty = int(it.get("quantity") or 1)
                qty = max(1, qty)
            except Exception:
                continue
            cleaned.append({"product_id": pid, "quantity": qty})

        if cleaned:
            product_map = _get_products_by_ids([c["product_id"] for c in cleaned])
            inserts = []
            for c in cleaned:
                p = product_map.get(c["product_id"])
                if not p:
                    continue
                unit = float(p.get("price") or 0)
                qty = int(c["quantity"])
                inserts.append(
                    {
                        "order_id": order_id,
                        "product_id": c["product_id"],
                        "quantity": qty,
                        "unit_price": unit,
                        "final_price": unit * qty,
                    }
                )
            if inserts:
                supabase.table("order_item").insert(inserts).execute()

        return jsonify(_cart_response(order_id)), 200
    except Exception as e:
        return jsonify({"error": "Failed to update cart", "details": str(e)}), 500


# ---------- Orders endpoints ----------
@customer.route("/order", methods=["POST"])
@token_required
@role_required("customer")
def place_order():
    user = request.user
    data = request.get_json(silent=True) or {}

    try:
        cart_order = (
            supabase.table("orders")
            .select("*")
            .eq("user_id", user["user_id"])
            .eq("status", "cart")
            .order("date", desc=True)
            .limit(1)
            .execute()
        )
        if not cart_order.data:
            return jsonify({"error": "Cart not found"}), 404

        order = cart_order.data[0]
        order_id = order["order_id"]

        items = _get_cart_items(order_id)
        if not items:
            return jsonify({"error": "Cart is empty"}), 400

        product_map = _get_products_by_ids([i["product_id"] for i in items])
        for it in items:
            p = product_map.get(it["product_id"])
            if not p:
                return jsonify({"error": f"Product {it['product_id']} not found"}), 404
            stock = int(p.get("current_stock_level") or 0)
            qty = int(it.get("quantity") or 0)
            if qty <= 0:
                return jsonify({"error": "Invalid quantity"}), 400
            if stock < qty:
                return jsonify(
                    {"error": "Insufficient stock", "product_id": it["product_id"], "available": stock, "requested": qty}
                ), 400

        address_id = _ensure_address(user["user_id"], data)

        for it in items:
            p = product_map[it["product_id"]]
            stock = int(p.get("current_stock_level") or 0)
            qty = int(it.get("quantity") or 0)
            supabase.table("products").update({"current_stock_level": stock - qty}).eq("product_id", it["product_id"]).execute()

        total = 0
        for it in items:
            total += float(it.get("final_price") or 0)

        supabase.table("orders").update(
            {
                "status": "pending",
                "payment_status": "unpaid",
                "total_amount": total,
                "address_id": address_id,
            }
        ).eq("order_id", order_id).execute()

        return jsonify({"message": "Order placed", "order_id": order_id, "total_amount": total}), 201

    except Exception as e:
        return jsonify({"error": "Failed to place order", "details": str(e)}), 500


@customer.route("/orders", methods=["GET"])
@token_required
@role_required("customer")
def list_orders():
    user = request.user
    try:
        resp = (
            supabase.table("orders")
            .select("*")
            .eq("user_id", user["user_id"])
            .neq("status", "cart")
            .order("date", desc=True)
            .execute()
        )
        orders = resp.data or []

        for o in orders:
            items = supabase.table("order_item").select("*").eq("order_id", o["order_id"]).execute().data or []
            o["items"] = items

        return jsonify(orders), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch orders", "details": str(e)}), 500