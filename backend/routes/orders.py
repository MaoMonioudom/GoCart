from flask import Blueprint, request, jsonify
from supabase_client import supabase
from middleware.auth_middleware import token_required, role_required

orders = Blueprint("orders", __name__, url_prefix="/orders")

@orders.route("/<int:order_id>", methods=["GET"])
@token_required
def get_order(order_id: int):
    user = request.user
    try:
        resp = supabase.table("orders").select("*").eq("order_id", order_id).limit(1).execute()
        order = (resp.data or [None])[0]
        if not order:
            return jsonify({"error": "Order not found"}), 404
        if user.get("role") != "admin" and order.get("user_id") != user.get("user_id"):
            return jsonify({"error": "Forbidden"}), 403
        items = (supabase.table("order_item").select("*").eq("order_id", order_id).execute().data) or []
        order["items"] = items
        return jsonify(order), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch order", "details": str(e)}), 500