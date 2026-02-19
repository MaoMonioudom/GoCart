from flask import Blueprint, request, jsonify
from services.admin_service import *
from services.ml_service import *

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# SELLER
@admin_bp.route("/sellers")
def sellers():
    return jsonify(get_all_sellers())

@admin_bp.route("/seller/stats")
def seller_stats():
    return jsonify(get_seller_dashboard_stats())

@admin_bp.route("/seller/commission-trend")
def commission_trend():
    group = request.args.get("group", "month")
    return jsonify(get_commission_trend(group))


@admin_bp.route("/seller/category-commission")
def category_commission():
    group = request.args.get("group", "month")
    return jsonify(get_commission_by_category(group))


@admin_bp.route("/seller/registration-trend")
def registration_trend():
    return jsonify(get_seller_registration_trend())

@admin_bp.route("/seller/status-overview")
def seller_status():
    return jsonify(get_seller_status_overview())

@admin_bp.route("/seller/top")
def seller_top():
    return jsonify(get_top_sellers())

# SELLER DETAIL
@admin_bp.route("/seller/<int:seller_id>")
def seller_detail(seller_id):
    return jsonify(get_seller_detail(seller_id))


# UPDATE SELLER
@admin_bp.route("/seller/<int:seller_id>", methods=["PUT"])
def seller_update(seller_id):
    return jsonify(update_seller(seller_id, request.json))


# DELETE SELLER
@admin_bp.route("/seller/<int:seller_id>", methods=["DELETE"])
def seller_delete(seller_id):
    return jsonify(delete_seller(seller_id))

# CUSTOMER
@admin_bp.route("/customers/stats")
def customer_stats():
    return jsonify(get_customer_stats())

@admin_bp.route("/customers/overview")
def customer_overview():
    range_type = request.args.get("range", "this_week")
    return jsonify(get_customer_overview(range_type))

# CUSTOMER LIST (pagination)
@admin_bp.route("/customers")
def customers():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    return jsonify(get_all_customers(page, limit))


# CUSTOMER DETAIL
@admin_bp.route("/customer/<int:user_id>")
def customer_detail(user_id):
    return jsonify(get_customer_detail(user_id))


# UPDATE CUSTOMER
@admin_bp.route("/customer/<int:user_id>", methods=["PUT"])
def customer_update(user_id):
    return jsonify(update_customer(user_id, request.json))


# DELETE CUSTOMER
@admin_bp.route("/customer/<int:user_id>", methods=["DELETE"])
def customer_delete(user_id):
    return jsonify(delete_customer(user_id))


# ML INSIGHTS
@admin_bp.route("/ml/top-viewed")
def ml_top_viewed():
    return jsonify(get_top_viewed_products())

@admin_bp.route("/ml/top-purchased")
def ml_top_purchased():
    return jsonify(get_top_purchased_products())

@admin_bp.route("/ml/purchase-frequency")
def ml_purchase_frequency():
    return jsonify(get_purchase_frequency())

@admin_bp.route("/ml/conversion-rate")
def ml_conversion_rate():
    return jsonify(get_conversion_rate())

@admin_bp.route("/ml/recommendation-accuracy")
def ml_recommendation_accuracy():
    return jsonify(get_recommendation_accuracy())

@admin_bp.route("/ml/user-behavior")
def ml_user_behavior():
    return jsonify(get_user_behavior())
