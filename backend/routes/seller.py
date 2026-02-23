# routes/seller.py
from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required, role_required
from services.seller_service import *

seller = Blueprint("seller", __name__, url_prefix="/seller")


# ================= PROFILE =================
@seller.route("/profile", methods=["GET"])
@token_required
@role_required("seller")
def profile():
    data = get_profile(request.user["user_id"])
    if not data:
        return jsonify({"error": "Seller not found"}), 404
    return jsonify(data), 200


# ================= PRODUCTS =================
@seller.route("/products", methods=["GET"])
@token_required
@role_required("seller")
def products():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    return jsonify(get_products(request.user["user_id"], page, limit)), 200


@seller.route("/products", methods=["POST"])
@token_required
@role_required("seller")
def create():
    return jsonify(create_product(request.user["user_id"], request.json)), 201


@seller.route("/products/<int:pid>", methods=["PATCH"])
@token_required
@role_required("seller")
def update(pid):
    return jsonify(update_product(pid, request.json)), 200


@seller.route("/products/<int:pid>", methods=["DELETE"])
@token_required
@role_required("seller")
def delete(pid):
    return jsonify(delete_product(pid)), 200


@seller.route("/products/<int:pid>/stock", methods=["PATCH"])
@token_required
@role_required("seller")
def stock(pid):
    return jsonify(update_stock(pid, request.json.get("stock"))), 200


# ================= ORDERS =================
@seller.route("/orders", methods=["GET"])
@token_required
@role_required("seller")
def orders():
    return jsonify(get_orders(request.user["user_id"])), 200


@seller.route("/orders/<int:oid>/status", methods=["PATCH"])
@token_required
@role_required("seller")
def order_status(oid):
    status = request.json.get("status")
    allowed = ["pending", "shipped", "delivered", "cancelled"]

    if status not in allowed:
        return jsonify({"error": "invalid status"}), 400

    return jsonify(update_order_status(oid, status)), 200


# ================= DASHBOARD =================
@seller.route("/stats", methods=["GET"])
@token_required
@role_required("seller")
def stats():
    return jsonify(get_stats(request.user["user_id"])), 200


@seller.route("/alerts/low-stock", methods=["GET"])
@token_required
@role_required("seller")
def low_stock():
    return jsonify(get_low_stock(request.user["user_id"])), 200
