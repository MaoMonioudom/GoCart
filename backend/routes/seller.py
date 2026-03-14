# routes/seller.py
from datetime import datetime
from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required, role_required
from services.seller_service import *
from services.seller_service import get_seller_notifications
from supabase_client import supabase
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
    try:
        seller_id = get_seller_id(request.user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller not found"}), 404
        data = get_products(seller_id, page, limit)
        return jsonify(data), 200
    except Exception as e:
        print("Error fetching seller products:", e)
        return jsonify({"error": "Failed to fetch seller products"}), 500


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
@seller.route("/dashboard", methods=["GET"])
@token_required
@role_required("seller")
def dashboard():
    """Fetch the full seller dashboard in a single response."""
    try:
        return jsonify(get_dashboard_bundle(request.user["user_id"])), 200
    except Exception as e:
        print("Seller dashboard error:", e)
        return jsonify({
            "stats": {
                "total_products": 0,
                "active_products": 0,
                "low_stock": 0,
                "out_of_stock": 0,
                "orders": 0,
                "revenue": 0,
            },
            "alerts": [],
            "sales_trend": [],
            "quantity_analytics": [],
            "products": [],
            "error": str(e),
        }), 200


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
    
# ================= PROMOTIONS =================

@seller.route("/promotions", methods=["GET"])
@token_required
@role_required("seller")
def get_seller_promotions():
    """Get all promotions created by this seller"""
    try:
        seller_id = get_seller_id(request.user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller profile not found"}), 404
        
        # Get seller's products
        products_resp = supabase.table("products") \
            .select("product_id") \
            .eq("seller_id", seller_id) \
            .execute()
        
        product_ids = [p["product_id"] for p in products_resp.data or []]
        
        if not product_ids:
            return jsonify({"promotions": []}), 200
        
        # Get promotions for these products
        product_promo_resp = supabase.table("product_promotion") \
            .select("promo_id") \
            .in_("product_id", product_ids) \
            .execute()
        
        promo_ids = list(set([pp["promo_id"] for pp in product_promo_resp.data or []]))
        
        if not promo_ids:
            return jsonify({"promotions": []}), 200
        
        # Get promotion details
        promos_resp = supabase.table("promotions") \
            .select("*") \
            .in_("promo_id", promo_ids) \
            .execute()
        
        promotions = promos_resp.data or []
        
        # Enrich with product count
        result = []
        for promo in promotions:
            product_count = sum(1 for pp in product_promo_resp.data or [] 
                              if pp["promo_id"] == promo["promo_id"])
            result.append({
                **promo,
                "product_count": product_count,
                "is_active": datetime.strptime(promo["start_date"], "%Y-%m-%d").date() <= datetime.now().date() <= datetime.strptime(promo["end_date"], "%Y-%m-%d").date()
            })
        
        return jsonify({"promotions": result}), 200
        
    except Exception as e:
        print(f"Error fetching promotions: {e}")
        return jsonify({"error": str(e)}), 500


@seller.route("/promotions", methods=["POST"])
@token_required
@role_required("seller")
def create_promotion():
    """Create a new promotion"""
    try:
        seller_id = get_seller_id(request.user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller profile not found"}), 404
        data = request.get_json() or {}
        
        # Validate required fields
        promo_name = data.get("promo_name")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        disc_pct = data.get("disc_pct", 0)
        disc_amount = data.get("disc_amount", 0)
        product_ids = data.get("product_ids", [])
        
        if not promo_name or not start_date or not end_date:
            return jsonify({"error": "promo_name, start_date, and end_date are required"}), 400
        
        if not disc_pct and not disc_amount:
            return jsonify({"error": "Either disc_pct or disc_amount is required"}), 400
        
        if not product_ids:
            return jsonify({"error": "At least one product_id is required"}), 400
        
        # Verify all products belong to this seller
        products_resp = supabase.table("products") \
            .select("product_id") \
            .eq("seller_id", seller_id) \
            .in_("product_id", product_ids) \
            .execute()
        
        valid_product_ids = [p["product_id"] for p in products_resp.data or []]
        
        if len(valid_product_ids) != len(product_ids):
            return jsonify({"error": "Some products do not belong to this seller"}), 403
        
        # Create promotion
        promo_resp = supabase.table("promotions").insert({
            "promo_name": promo_name,
            "disc_pct": float(disc_pct) if disc_pct else None,
            "disc_amount": float(disc_amount) if disc_amount else None,
            "start_date": start_date,
            "end_date": end_date
        }).execute()
        
        if not promo_resp.data:
            return jsonify({"error": "Failed to create promotion"}), 500
        
        promo_id = promo_resp.data[0]["promo_id"]
        
        # Link products to promotion
        product_promotion_data = [
            {"product_id": pid, "promo_id": promo_id}
            for pid in product_ids
        ]
        
        supabase.table("product_promotion").insert(product_promotion_data).execute()
        
        return jsonify({
            "message": "Promotion created successfully",
            "promo_id": promo_id,
            "promo_name": promo_name
        }), 201
        
    except Exception as e:
        print(f"Error creating promotion: {e}")
        return jsonify({"error": str(e)}), 500


@seller.route("/promotions/<int:promo_id>", methods=["PATCH"])
@token_required
@role_required("seller")
def update_promotion(promo_id):
    """Update an existing promotion"""
    try:
        seller_id = get_seller_id(request.user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller profile not found"}), 404
        data = request.get_json() or {}
        
        # Verify seller owns this promotion
        product_promo_resp = supabase.table("product_promotion") \
            .select("product_id") \
            .eq("promo_id", promo_id) \
            .execute()
        
        if not product_promo_resp.data:
            return jsonify({"error": "Promotion not found"}), 404
        
        product_id = product_promo_resp.data[0]["product_id"]
        
        product_resp = supabase.table("products") \
            .select("seller_id") \
            .eq("product_id", product_id) \
            .execute()
        
        if not product_resp.data or product_resp.data[0]["seller_id"] != seller_id:
            return jsonify({"error": "You don't have permission to update this promotion"}), 403
        
        # Update promotion
        update_data = {}
        if "promo_name" in data:
            update_data["promo_name"] = data["promo_name"]
        if "disc_pct" in data:
            update_data["disc_pct"] = data["disc_pct"]
        if "disc_amount" in data:
            update_data["disc_amount"] = data["disc_amount"]
        if "start_date" in data:
            update_data["start_date"] = data["start_date"]
        if "end_date" in data:
            update_data["end_date"] = data["end_date"]
        
        if update_data:
            supabase.table("promotions") \
                .update(update_data) \
                .eq("promo_id", promo_id) \
                .execute()
        
        # Update products if provided
        if "product_ids" in data:
            new_product_ids = data["product_ids"]
            
            # Verify all new products belong to this seller
            products_resp = supabase.table("products") \
                .select("product_id") \
                .eq("seller_id", seller_id) \
                .in_("product_id", new_product_ids) \
                .execute()
            
            valid_product_ids = [p["product_id"] for p in products_resp.data or []]
            
            if len(valid_product_ids) != len(new_product_ids):
                return jsonify({"error": "Some products do not belong to this seller"}), 403
            
            # Delete old product-promotion associations
            supabase.table("product_promotion") \
                .delete() \
                .eq("promo_id", promo_id) \
                .execute()
            
            # Create new associations
            product_promotion_data = [
                {"product_id": pid, "promo_id": promo_id}
                for pid in new_product_ids
            ]
            supabase.table("product_promotion").insert(product_promotion_data).execute()
        
        return jsonify({"message": "Promotion updated successfully"}), 200
        
    except Exception as e:
        print(f"Error updating promotion: {e}")
        return jsonify({"error": str(e)}), 500


@seller.route("/promotions/<int:promo_id>", methods=["DELETE"])
@token_required
@role_required("seller")
def delete_promotion(promo_id):
    """Delete a promotion"""
    try:
        seller_id = get_seller_id(request.user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller profile not found"}), 404
        
        # Verify seller owns this promotion
        product_promo_resp = supabase.table("product_promotion") \
            .select("product_id") \
            .eq("promo_id", promo_id) \
            .execute()
        
        if not product_promo_resp.data:
            return jsonify({"error": "Promotion not found"}), 404
        
        product_id = product_promo_resp.data[0]["product_id"]
        
        product_resp = supabase.table("products") \
            .select("seller_id") \
            .eq("product_id", product_id) \
            .execute()
        
        if not product_resp.data or product_resp.data[0]["seller_id"] != seller_id:
            return jsonify({"error": "You don't have permission to delete this promotion"}), 403
        
        # Delete promotion (cascades to product_promotion)
        supabase.table("promotions") \
            .delete() \
            .eq("promo_id", promo_id) \
            .execute()
        
        return jsonify({"message": "Promotion deleted successfully"}), 200
        
    except Exception as e:
        print(f"Error deleting promotion: {e}")
        return jsonify({"error": str(e)}), 500


@seller.route("/promotions/<int:promo_id>/products", methods=["GET"])
@token_required
@role_required("seller")
def get_promotion_products(promo_id):
    """Get all products in a promotion"""
    try:
        seller_id = get_seller_id(request.user["user_id"])
        if not seller_id:
            return jsonify({"error": "Seller profile not found"}), 404
        
        # Verify seller owns this promotion
        product_promo_resp = supabase.table("product_promotion") \
            .select("product_id") \
            .eq("promo_id", promo_id) \
            .execute()
        
        if not product_promo_resp.data:
            return jsonify({"error": "Promotion not found"}), 404
        
        product_ids = [pp["product_id"] for pp in product_promo_resp.data]
        
        # Get promotion details
        promo_resp = supabase.table("promotions") \
            .select("*") \
            .eq("promo_id", promo_id) \
            .execute()
        
        # Get all products in promotion
        products_resp = supabase.table("products") \
            .select("*") \
            .eq("seller_id", seller_id) \
            .in_("product_id", product_ids) \
            .execute()
        
        return jsonify({
            "promotion": promo_resp.data[0] if promo_resp.data else None,
            "products": products_resp.data or []
        }), 200
        
    except Exception as e:
        print(f"Error fetching promotion products: {e}")
        return jsonify({"error": str(e)}), 500
