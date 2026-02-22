from flask import Blueprint, request, jsonify
from supabase_client import supabase
from middleware.auth_middleware import token_required, role_required
from ml.recommend import recommend_products_for_user
from services.product_service import create_product  # from second snippet

products_bp = Blueprint("products", __name__, url_prefix="/products")

# -------------------------------------------------------------------
# Helper (from first snippet)
# -------------------------------------------------------------------
def _get_seller_id_for_user(user_id):
    seller_resp = (
        supabase.table("seller")
        .select("seller_id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not seller_resp.data:
        return None
    return seller_resp.data[0]["seller_id"]

# =========================
# Public endpoints
# =========================

@products_bp.route("/", methods=["GET"])
def list_products():
    """Public: list all active products."""
    try:
        resp = (
            supabase.table("products")
            .select("*")
            .eq("status", "active")
            .execute()
        )
        return jsonify(resp.data or []), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch products", "details": str(e)}), 500

@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id: int):
    """Public: get one product by id."""
    try:
        resp = (
            supabase.table("products")
            .select("*")
            .eq("product_id", product_id)
            .limit(1)
            .execute()
        )
        if not resp.data:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(resp.data[0]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch product", "details": str(e)}), 500

# =========================
# Seller-only endpoints
# =========================

@products_bp.route("/mine", methods=["GET"])
@token_required
@role_required("seller")
def list_my_products():
    user = request.user
    try:
        seller_id = _get_seller_id_for_user(user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller profile not found"}), 404

        resp = (
            supabase.table("products")
            .select("*")
            .eq("seller_id", seller_id)
            .execute()
        )
        return jsonify(resp.data or []), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch seller products", "details": str(e)}), 500

@products_bp.route("/", methods=["POST"])
@token_required
@role_required("seller")
def add_product():
    """Create a new product (uses service from second snippet)."""
    user = request.user
    seller_id = _get_seller_id_for_user(user["user_id"])
    if not seller_id:
        return jsonify({"error": "Seller profile not found"}), 404

    # Pass seller_id along with the request data to the service
    data = request.get_json(silent=True) or {}
    data["seller_id"] = seller_id

    try:
        result = create_product(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": "Failed to create product", "details": str(e)}), 500

@products_bp.route("/<int:product_id>", methods=["PUT"])
@token_required
@role_required("seller")
def update_product(product_id: int):
    user = request.user
    seller_id = _get_seller_id_for_user(user["user_id"])
    if not seller_id:
        return jsonify({"error": "Seller profile not found"}), 404

    data = request.get_json(silent=True) or {}
    allowed_fields = {
        "name",
        "description",
        "price",
        "category_id",
        "status",
        "current_stock_level",
        "image_url",
    }
    updates = {k: v for k, v in data.items() if k in allowed_fields}
    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        # Ensure ownership
        existing = (
            supabase.table("products")
            .select("product_id,seller_id")
            .eq("product_id", product_id)
            .limit(1)
            .execute()
        )
        if not existing.data:
            return jsonify({"error": "Product not found"}), 404
        if existing.data[0]["seller_id"] != seller_id:
            return jsonify({"error": "Forbidden"}), 403

        resp = (
            supabase.table("products")
            .update(updates)
            .eq("product_id", product_id)
            .execute()
        )
        return jsonify(resp.data[0] if resp.data else {}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update product", "details": str(e)}), 500

@products_bp.route("/<int:product_id>", methods=["DELETE"])
@token_required
@role_required("seller")
def delete_product(product_id: int):
    user = request.user
    seller_id = _get_seller_id_for_user(user["user_id"])
    if not seller_id:
        return jsonify({"error": "Seller profile not found"}), 404

    try:
        existing = (
            supabase.table("products")
            .select("product_id,seller_id")
            .eq("product_id", product_id)
            .limit(1)
            .execute()
        )
        if not existing.data:
            return jsonify({"error": "Product not found"}), 404
        if existing.data[0]["seller_id"] != seller_id:
            return jsonify({"error": "Forbidden"}), 403

        # Soft delete to preserve order history
        resp = (
            supabase.table("products")
            .update({"status": "inactive"})
            .eq("product_id", product_id)
            .execute()
        )
        return (
            jsonify(
                {
                    "message": "Product deactivated",
                    "product": (resp.data[0] if resp.data else {}),
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to delete product", "details": str(e)}), 500

# =========================
# ML Recommendation
# =========================
@products_bp.route("/recommend", methods=["GET"])
@token_required
def recommend_products():
    """Recommend products for the logged-in user."""
    user = request.user
    try:
        limit = int(request.args.get("limit", "10"))
    except Exception:
        limit = 10
    try:
        recs = recommend_products_for_user(user.get("user_id"), limit=limit)
        return jsonify(recs), 200
    except Exception as e:
        return jsonify({"error": "Failed to get recommendations", "details": str(e)}), 500