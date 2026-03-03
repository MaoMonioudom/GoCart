# routes/seller.py
from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required, role_required
from services.seller_service import *
from services.seller_service import get_seller_notifications

seller = Blueprint("seller", __name__, url_prefix="/seller")


# ================= PROFILE =================
@seller.route("/profile", methods=["GET"])
@token_required
@role_required("seller")
def profile():
    """Get seller profile"""
    data = get_profile(request.user["user_id"])
    if not data:
        return jsonify({"error": "Seller not found"}), 404
    return jsonify(data), 200


@seller.route("/profile", methods=["PATCH"])
@token_required
@role_required("seller")
def update_profile():
    """Update seller profile"""
    return jsonify(update_seller_profile(request.user["user_id"], request.json)), 200


# ================= PRODUCTS =================
@seller.route("/products", methods=["GET"])
@token_required
@role_required("seller")
def products():
    """Get seller products with pagination"""
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    return jsonify(get_products(request.user["user_id"], page, limit)), 200


@seller.route("/products/<int:pid>", methods=["GET"])
@token_required
@role_required("seller")
def product_detail(pid):
    """Get single product detail"""
    return jsonify(get_product_detail(pid)), 200


@seller.route("/products", methods=["POST"])
@token_required
@role_required("seller")
def create():
    """Create product"""
    return jsonify(create_product(request.user["user_id"], request.json)), 201


@seller.route("/products/<int:pid>", methods=["PATCH"])
@token_required
@role_required("seller")
def update(pid):
    """Update product"""
    return jsonify(update_product(pid, request.json)), 200


@seller.route("/products/<int:pid>", methods=["DELETE"])
@token_required
@role_required("seller")
def delete(pid):
    """Delete product"""
    return jsonify(delete_product(pid)), 200


@seller.route("/products/<int:pid>/stock", methods=["PATCH"])
@token_required
@role_required("seller")
def stock(pid):
    """Update product stock"""
    return jsonify(update_stock(pid, request.json.get("stock"))), 200


# ================= ORDERS =================
@seller.route("/orders", methods=["GET"])
@token_required
@role_required("seller")
def orders():
    """Get seller orders"""
    return jsonify(get_orders(request.user["user_id"])), 200


@seller.route("/orders/<int:oid>/status", methods=["PATCH"])
@token_required
@role_required("seller")
def order_status(oid):
    """Update order status"""
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
    """Dashboard KPI stats"""
    return jsonify(get_stats(request.user["user_id"])), 200


@seller.route("/analytics/sales-trend", methods=["GET"])
@token_required
@role_required("seller")
def sales_trend():
    """Sales trend chart data"""
    return jsonify(get_sales_trend(request.user["user_id"])), 200


@seller.route("/analytics/comparison", methods=["GET"])
@token_required
@role_required("seller")
def comparison():
    """Product comparison analytics"""
    return jsonify(get_comparison_data(request.user["user_id"])), 200


@seller.route("/analytics/quantity", methods=["GET"])
@token_required
@role_required("seller")
def quantity():
    """Quantity analytics"""
    return jsonify(get_quantity_data(request.user["user_id"])), 200


@seller.route("/alerts/low-stock", methods=["GET"])
@token_required
@role_required("seller")
def low_stock():
    """Low stock alerts"""
    return jsonify(get_low_stock(request.user["user_id"])), 200


# ================= ML =================
@seller.route("/ml/predict", methods=["POST"])
@token_required
@role_required("seller")
def ml_predict():
    """ML demand prediction"""
    return jsonify(predict_demand(request.user["user_id"], request.json)), 200


# ================= Notification =================
# ================= Notification =================
@seller.route("/notifications", methods=["GET"])
@token_required
@role_required("seller")
def notifications():
    """Get all notifications for the seller with product info"""
    return jsonify(get_seller_notifications(request.user["user_id"])), 200


@seller.route("/notifications/<int:nid>/read", methods=["PATCH"])
@token_required
@role_required("seller")
def mark_notification(nid):
    """Mark a notification as read/unread (only if it belongs to this seller)"""
    is_read = request.json.get("is_read")
    if is_read is None:
        return jsonify({"error": "is_read is required"}), 400

    try:
        seller_id = get_seller_id(request.user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller not found"}), 404

        response = (
            supabase.table("notifications")
            .update({"is_read": is_read})
            .eq("id", nid)
            .eq("seller_id", seller_id)  # IMPORTANT: ownership check
            .execute()
        )

        # If no rows updated, notification not found or not owned by this seller
        if not response.data:
            return jsonify({"error": "Notification not found"}), 404

        return jsonify(response.data), 200

    except Exception as e:
        print("Notification update error:", e)
        return jsonify({"error": "Failed to update notification"}), 500