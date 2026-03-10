from flask import Blueprint, request, jsonify, g
from services.admin_service import *
from services.ml_service import *
from middleware.auth_middleware import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# SELLER
@admin_bp.route("/sellers")
@admin_required
def sellers():
    return jsonify(get_all_sellers())

@admin_bp.route("/seller/stats")
@admin_required
def seller_stats():
    return jsonify(get_seller_dashboard_stats())

@admin_bp.route("/seller/commission-trend")
@admin_required
def commission_trend():
    group = request.args.get("group", "month")
    return jsonify(get_commission_trend(group))


@admin_bp.route("/seller/category-commission")
@admin_required
def category_commission():
    group = request.args.get("group", "month")
    return jsonify(get_commission_by_category(group))


@admin_bp.route("/seller/registration-trend")
@admin_required
def registration_trend():
    return jsonify(get_seller_registration_trend())

@admin_bp.route("/seller/status-overview")
@admin_required
def seller_status():
    return jsonify(get_seller_status_overview())

@admin_bp.route("/seller/top")
@admin_required
def seller_top():
    return jsonify(get_top_sellers())

# SELLER DETAIL
@admin_bp.route("/seller/<int:seller_id>")
@admin_required
def seller_detail(seller_id):
    return jsonify(get_seller_detail(seller_id))


# UPDATE SELLER
@admin_bp.route("/seller/<int:seller_id>", methods=["PUT"])
@admin_required
def seller_update(seller_id):
    return jsonify(update_seller(seller_id, request.json))


# DELETE SELLER
@admin_bp.route("/seller/<int:seller_id>", methods=["DELETE"])
@admin_required
def seller_delete(seller_id):
    return jsonify(delete_seller(seller_id))

# CUSTOMER
@admin_bp.route("/customers/stats")
@admin_required
def customer_stats():
    return jsonify(get_customer_stats())

@admin_bp.route("/customers/overview")
@admin_required
def customer_overview():
    range_type = request.args.get("range", "this_week")
    return jsonify(get_customer_overview(range_type))

# CUSTOMER LIST (pagination)
@admin_bp.route("/customers")
@admin_required
def customers():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    return jsonify(get_all_customers(page, limit))


# CUSTOMER DETAIL
@admin_bp.route("/customer/<int:user_id>")
@admin_required
def customer_detail(user_id):
    return jsonify(get_customer_detail(user_id))


# UPDATE CUSTOMER
@admin_bp.route("/customer/<int:user_id>", methods=["PUT"])
@admin_required
def customer_update(user_id):
    return jsonify(update_customer(user_id, request.json))


# DELETE CUSTOMER
@admin_bp.route("/customer/<int:user_id>", methods=["DELETE"])
@admin_required
def customer_delete(user_id):
    return jsonify(delete_customer(user_id))


# ML INSIGHTS
# ===============================
# ML STAT CARDS
# ===============================

@admin_bp.route("/ml/most-viewed")
@admin_required
def ml_most_viewed():
    return jsonify(get_most_viewed_product())


@admin_bp.route("/ml/most-purchased")
@admin_required
def ml_most_purchased():
    return jsonify(get_most_purchased_product())


@admin_bp.route("/ml/purchase-frequency")
@admin_required
def ml_purchase_frequency():
    return jsonify(get_purchase_frequency())


@admin_bp.route("/ml/conversion-rate")
@admin_required
def ml_conversion_rate():
    return jsonify(get_conversion_rate())

# ===============================
# ML CHARTS
# ===============================

@admin_bp.route("/ml/recommendation-accuracy")
@admin_required
def ml_recommendation_accuracy():
    return jsonify(get_recommendation_accuracy())


@admin_bp.route("/ml/user-behavior")
@admin_required
def ml_user_behavior():
    return jsonify(get_user_behavior())


# ===============================
# ADMIN PROFILE
# ===============================

@admin_bp.route("/profile")
@admin_required
def admin_profile():
    admin_id = g.user["user_id"]
    return jsonify(get_admin_profile(admin_id))


@admin_bp.route("/profile", methods=["PUT"])
@admin_required
def update_profile():
    admin_id = g.user["user_id"]
    return jsonify(update_admin_profile(admin_id, request.json))

# ===============================
# ADMIN SYSTEM STATS
# ===============================
@admin_bp.route("/system-stats")
@admin_required
def admin_system_stats():
    return jsonify(get_admin_system_stats())