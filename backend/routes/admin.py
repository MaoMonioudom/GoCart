from flask import Blueprint, request, jsonify, g
from services.admin_service import *
from services.ml_service import *
from middleware.auth_middleware import role_required

admin = Blueprint("admin", __name__, url_prefix="/admin")

# SELLER
@admin.route("/sellers")
@role_required
def sellers():
    return jsonify(get_all_sellers())

@admin.route("/seller/stats")
@role_required
def seller_stats():
    return jsonify(get_seller_dashboard_stats())

@admin.route("/seller/commission-trend")
@role_required
def commission_trend():
    group = request.args.get("group", "month")
    return jsonify(get_commission_trend(group))


@admin.route("/seller/category-commission")
@role_required
def category_commission():
    group = request.args.get("group", "month")
    return jsonify(get_commission_by_category(group))


@admin.route("/seller/registration-trend")
@role_required
def registration_trend():
    return jsonify(get_seller_registration_trend())

@admin.route("/seller/status-overview")
@role_required
def seller_status():
    return jsonify(get_seller_status_overview())

@admin.route("/seller/top")
@role_required
def seller_top():
    return jsonify(get_top_sellers())

# SELLER DETAIL
@admin.route("/seller/<int:seller_id>")
@role_required
def seller_detail(seller_id):
    return jsonify(get_seller_detail(seller_id))


# UPDATE SELLER
@admin.route("/seller/<int:seller_id>", methods=["PUT"])
@role_required
def seller_update(seller_id):
    return jsonify(update_seller(seller_id, request.json))


# DELETE SELLER
@admin.route("/seller/<int:seller_id>", methods=["DELETE"])
@role_required
def seller_delete(seller_id):
    return jsonify(delete_seller(seller_id))

# CUSTOMER
@admin.route("/customers/stats")
@role_required
def customer_stats():
    return jsonify(get_customer_stats())

@admin.route("/customers/overview")
@role_required
def customer_overview():
    range_type = request.args.get("range", "this_week")
    return jsonify(get_customer_overview(range_type))

# CUSTOMER LIST (pagination)
@admin.route("/customers")
@role_required
def customers():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    return jsonify(get_all_customers(page, limit))


# CUSTOMER DETAIL
@admin.route("/customer/<int:user_id>")
@role_required
def customer_detail(user_id):
    return jsonify(get_customer_detail(user_id))


# UPDATE CUSTOMER
@admin.route("/customer/<int:user_id>", methods=["PUT"])
@role_required
def customer_update(user_id):
    return jsonify(update_customer(user_id, request.json))


# DELETE CUSTOMER
@admin.route("/customer/<int:user_id>", methods=["DELETE"])
@role_required
def customer_delete(user_id):
    return jsonify(delete_customer(user_id))


# ML INSIGHTS
# ===============================
# ML STAT CARDS
# ===============================

@admin.route("/ml/most-viewed")
# @role_required
# def ml_most_viewed():
#     return jsonify(get_most_viewed_product())


# @admin.route("/ml/most-purchased")
# @role_required
# def ml_most_purchased():
#     return jsonify(get_most_purchased_product())


# @admin.route("/ml/purchase-frequency")
# @role_required
# def ml_purchase_frequency():
#     return jsonify(get_purchase_frequency())


# @admin.route("/ml/conversion-rate")
# @role_required
# def ml_conversion_rate():
#     return jsonify(get_conversion_rate())

# # ===============================
# # ML CHARTS
# # ===============================

# @admin.route("/ml/recommendation-accuracy")
# @role_required
# def ml_recommendation_accuracy():
#     return jsonify(get_recommendation_accuracy())


# @admin.route("/ml/user-behavior")
# @role_required
# def ml_user_behavior():
#     return jsonify(get_user_behavior())


# ===============================
# ADMIN PROFILE
# ===============================

@admin.route("/profile")
@role_required
def admin_profile():
    admin_id = g.user["user_id"]
    return jsonify(get_admin_profile(admin_id))


@admin.route("/profile", methods=["PUT"])
@role_required
def update_profile():
    admin_id = g.user["user_id"]
    return jsonify(update_admin_profile(admin_id, request.json))

# ===============================
# ADMIN SYSTEM STATS
# ===============================
@admin.route("/system-stats")
@role_required
def admin_system_stats():
    return jsonify(get_admin_system_stats())
