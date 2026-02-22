from flask import Blueprint, request, jsonify
from supabase_client import supabase
from middleware.auth_middleware import token_required, role_required

seller = Blueprint("seller", __name__, url_prefix="/seller")


# ================= HELPERS =================
def get_seller_id(user_id):
    resp = supabase.table("seller").select("seller_id").eq("user_id", user_id).limit(1).execute()
    if not resp.data:
        return None
    return resp.data[0]["seller_id"]


def get_seller_products_ids(seller_id):
    resp = supabase.table("products").select("product_id").eq("seller_id", seller_id).execute()
    return [p["product_id"] for p in resp.data or []]


# ================= SELLER PROFILE =================
@seller.route("/profile", methods=["GET"])
@token_required
@role_required("seller")
def seller_profile():
    user = request.user
    sid = get_seller_id(user["user_id"])
    if not sid:
        return jsonify({"error": "Seller not found"}), 404

    resp = supabase.table("seller").select("*").eq("seller_id", sid).single().execute()
    return jsonify(resp.data), 200


# ================= PRODUCTS CRUD =================
@seller.route("/products", methods=["GET"])
@token_required
@role_required("seller")
def get_products():
    user = request.user
    sid = get_seller_id(user["user_id"])
    if not sid:
        return jsonify({"error": "Seller not found"}), 404

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    start = (page - 1) * limit

    resp = (
        supabase.table("products")
        .select("*")
        .eq("seller_id", sid)
        .range(start, start + limit - 1)
        .order("product_id", desc=True)
        .execute()
    )

    return jsonify(resp.data), 200


@seller.route("/products", methods=["POST"])
@token_required
@role_required("seller")
def create_product():
    user = request.user
    sid = get_seller_id(user["user_id"])
    data = request.json

    data["seller_id"] = sid

    resp = supabase.table("products").insert(data).execute()
    return jsonify(resp.data), 201


@seller.route("/products/<int:pid>", methods=["PATCH"])
@token_required
@role_required("seller")
def update_product(pid):
    data = request.json
    resp = supabase.table("products").update(data).eq("product_id", pid).execute()
    return jsonify(resp.data), 200


@seller.route("/products/<int:pid>", methods=["DELETE"])
@token_required
@role_required("seller")
def delete_product(pid):
    resp = supabase.table("products").delete().eq("product_id", pid).execute()
    return jsonify({"message": "deleted"}), 200


# ================= STOCK UPDATE =================
@seller.route("/products/<int:pid>/stock", methods=["PATCH"])
@token_required
@role_required("seller")
def update_stock(pid):
    qty = request.json.get("stock")
    resp = supabase.table("products").update({"current_stock_level": qty}).eq("product_id", pid).execute()
    return jsonify(resp.data), 200


# ================= ORDERS =================
@seller.route("/orders", methods=["GET"])
@token_required
@role_required("seller")
def seller_orders():
    user = request.user
    sid = get_seller_id(user["user_id"])
    product_ids = get_seller_products_ids(sid)

    oi = supabase.table("order_item").select("*").in_("product_id", product_ids).execute()
    order_ids = list({i["order_id"] for i in oi.data or []})

    orders = supabase.table("orders").select("*").in_("order_id", order_ids).execute()

    return jsonify(orders.data), 200


@seller.route("/orders/<int:oid>/status", methods=["PATCH"])
@token_required
@role_required("seller")
def update_order(oid):
    status = request.json.get("status")

    allowed = ["pending", "shipped", "delivered", "cancelled"]
    if status not in allowed:
        return jsonify({"error": "invalid status"}), 400

    resp = supabase.table("orders").update({"status": status}).eq("order_id", oid).execute()
    return jsonify(resp.data), 200


# ================= DASHBOARD STATS =================
@seller.route("/stats", methods=["GET"])
@token_required
@role_required("seller")
def seller_stats():
    user = request.user
    sid = get_seller_id(user["user_id"])

    products = supabase.table("products").select("*").eq("seller_id", sid).execute().data or []
    pids = [p["product_id"] for p in products]

    order_items = supabase.table("order_item").select("*").in_("product_id", pids).execute().data or []

    revenue = 0
    for i in order_items:
        revenue += float(i.get("quantity", 0)) * float(i.get("final_price", 0))

    return jsonify({
        "products": len(products),
        "low_stock": len([p for p in products if p.get("current_stock_level", 0) < 5]),
        "orders": len(set([i["order_id"] for i in order_items])),
        "revenue": revenue
    }), 200


# ================= LOW STOCK ALERT =================
@seller.route("/alerts/low-stock", methods=["GET"])
@token_required
@role_required("seller")
def low_stock():
    user = request.user
    sid = get_seller_id(user["user_id"])

    resp = supabase.table("products").select("*").eq("seller_id", sid).lt("current_stock_level", 5).execute()
    return jsonify(resp.data), 200