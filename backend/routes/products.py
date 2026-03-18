from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required
from services.product_service import (
    create_product_service,
    update_product_service,
    delete_product_service,
    list_products_service,
    get_product_service,
    list_seller_products_service,
    list_categories_service,
    create_promotion_service,
    get_product_promotions_service,
    update_promotion_service,
    delete_promotion_service,
    toggle_product_status_service,
)
from ml.recommend import recommend_products_for_user


# =====================================================
# Blueprint
# =====================================================

products = Blueprint("products", __name__, url_prefix="/products")


# =====================================================
# PUBLIC ENDPOINTS
# =====================================================

@products.route("/", methods=["GET"])
def list_products():
    """
    List all active products
    Optional query params:
        - category_id
        - search
    """
    try:
        category_id = request.args.get("category_id")
        search = request.args.get("search")

        result, status = list_products_service(category_id, search)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to fetch products", "details": str(e)}), 500


@products.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """Get product by ID"""
    try:
        result, status = get_product_service(product_id)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to fetch product", "details": str(e)}), 500


@products.route("/categories", methods=["GET"])
def list_categories():
    """List all product categories"""
    try:
        result, status = list_categories_service()
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to fetch categories", "details": str(e)}), 500


# =====================================================
# SELLER PRODUCT MANAGEMENT
# =====================================================

@products.route("/seller", methods=["GET"])
@token_required
def list_seller_products():
    """
    List products owned by logged-in seller
    Optional query param:
        - search
    """
    try:
        search = request.args.get("search")
        result, status = list_seller_products_service(request.user, search)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to fetch seller products", "details": str(e)}), 500


@products.route("/", methods=["POST"])
@token_required
def create_product():
    """Create new product (seller only — validated in service)"""
    try:
        data = request.get_json(silent=True) or {}
        result, status = create_product_service(request.user, data)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to create product", "details": str(e)}), 500


@products.route("/<int:product_id>", methods=["PUT"])
@token_required
def update_product(product_id):
    """Update product (seller only — validated in service)"""
    try:
        data = request.get_json(silent=True) or {}
        result, status = update_product_service(request.user, product_id, data)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to update product", "details": str(e)}), 500


@products.route("/<int:product_id>", methods=["DELETE"])
@token_required
def delete_product(product_id):
    """Soft delete product (seller only — validated in service)"""
    try:
        result, status = delete_product_service(request.user, product_id)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to delete product", "details": str(e)}), 500


@products.route("/<int:product_id>/toggle-status", methods=["PATCH"])
@token_required
def toggle_product_status(product_id):
    """Toggle product active/inactive (seller only)"""
    try:
        result, status = toggle_product_status_service(request.user, product_id)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to toggle product status", "details": str(e)}), 500


# =====================================================
# PROMOTIONS
# =====================================================

@products.route("/<int:product_id>/promotions", methods=["POST"])
@token_required
def create_promotion(product_id):
    """Create promotion for product"""
    try:
        data = request.get_json(silent=True) or {}
        result, status = create_promotion_service(request.user, product_id, data)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to create promotion", "details": str(e)}), 500


@products.route("/<int:product_id>/promotions", methods=["GET"])
@token_required
def get_product_promotions(product_id):
    """Get promotions for product"""
    try:
        result, status = get_product_promotions_service(request.user, product_id)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to fetch promotions", "details": str(e)}), 500


@products.route("/promotions/<int:promo_id>", methods=["PUT"])
@token_required
def update_promotion(promo_id):
    """Update promotion"""
    try:
        data = request.get_json(silent=True) or {}
        result, status = update_promotion_service(request.user, promo_id, data)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to update promotion", "details": str(e)}), 500


@products.route("/promotions/<int:promo_id>", methods=["DELETE"])
@token_required
def delete_promotion(promo_id):
    """Delete promotion"""
    try:
        result, status = delete_promotion_service(request.user, promo_id)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": "Failed to delete promotion", "details": str(e)}), 500


# =====================================================
# ML RECOMMENDATIONS
# =====================================================

@products.route("/recommend", methods=["GET"])
@token_required
def recommend_products():
    """Recommend products for logged-in user"""
    try:
        if request.user.get("role") != "customer":
            return jsonify({"error": "Only customers can get recommendations"}), 403

        try:
            limit = int(request.args.get("limit", 10))
        except ValueError:
            limit = 10

        recommendations = recommend_products_for_user(
            request.user.get("user_id"),
            limit=limit
        )

        return jsonify(recommendations), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to get recommendations",
            "details": str(e)
        }), 500
