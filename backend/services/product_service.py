<<<<<<< HEAD
from datetime import datetime

from supabase_client import supabase
from config import SUPABASE_URL
from services.promotion_utils import get_active_promotion_for_product, get_active_promotions_for_products, serialize_promotion, sort_promotions_newest_first
import uuid
import base64

STORAGE_BUCKET = "Product_images"


def _extract_relation_row(value):
    """Return the first dict row from a Supabase relation payload."""
    if isinstance(value, dict):
        return value
    if isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                return item
    return {}


def _get_seller_id_for_user(user_id):
    if not user_id:
        return None

    seller_resp = (
        supabase.table("seller")
        .select("seller_id")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if not seller_resp.data:
        return None

    return seller_resp.data[0].get("seller_id")


def _build_category_map(category_ids):
    category_ids = [category_id for category_id in set(category_ids or []) if category_id is not None]
    if not category_ids:
        return {}

    response = (
        supabase.table("categories")
        .select("category_id, category_name")
        .in_("category_id", category_ids)
        .execute()
    )

    return {
        row.get("category_id"): row.get("category_name", "")
        for row in (response.data or [])
        if row.get("category_id") is not None
    }


def _build_images_map(product_ids):
    product_ids = [product_id for product_id in set(product_ids or []) if product_id is not None]
    if not product_ids:
        return {}

    response = (
        supabase.table("product_image")
        .select("*")
        .in_("product_id", product_ids)
        .execute()
    )

    images_map = {}
    for row in (response.data or []):
        product_id = row.get("product_id")
        if product_id is None:
            continue
        images_map.setdefault(product_id, []).append(row)

    for product_id, images in images_map.items():
        images_map[product_id] = sorted(
            images,
            key=lambda img: (not bool(img.get("is_main")), img.get("image_id") or 0),
        )

    return images_map


def _normalize_product(product, categories_map=None, images_map=None, promotions_map=None):
    product = dict(product or {})

    category_row = _extract_relation_row(product.pop("categories", None))
    seller_row = _extract_relation_row(product.pop("seller", None))

    category_name = category_row.get("category_name")
    if not category_name and categories_map is not None:
        category_name = categories_map.get(product.get("category_id"), "")

    if category_name:
        product["category_name"] = category_name

    if seller_row:
        product["shop_name"] = seller_row.get("shop_name", "")
        product["shop_description"] = seller_row.get("shop_description", "")

    product["stock_quantity"] = product.get("current_stock_level", product.get("stock_quantity", 0)) or 0

    if images_map is not None:
        product["images"] = images_map.get(product.get("product_id"), [])
    else:
        product["images"] = product.get("images", []) or []

    if promotions_map is not None and product.get("product_id") is not None:
        product["promotion"] = promotions_map.get(product.get("product_id"))

    return product


# =========================
# STORAGE HELPERS
# =========================
def upload_image_to_storage(image_data, product_id, filename=None):
    """
    Upload image to Supabase storage.
    image_data: base64 encoded image string or bytes
    Returns the public URL of the uploaded image
    """
    try:
        # Generate unique filename
        if not filename:
            ext = "jpg"  # Default extension
            filename = f"{product_id}/{uuid.uuid4()}.{ext}"
        else:
            filename = f"{product_id}/{filename}"

        # Decode base64 if string
        if isinstance(image_data, str):
            # Remove data URL prefix if present
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]
            file_bytes = base64.b64decode(image_data)
        else:
            file_bytes = image_data

        # Upload to Supabase storage
        print(f"Uploading to bucket: {STORAGE_BUCKET}, path: {filename}")
        result = supabase.storage.from_(STORAGE_BUCKET).upload(
            path=filename,
            file=file_bytes,
            file_options={"content-type": "image/jpeg"}
        )
        print(f"Upload result: {result}")

        # Get public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{filename}"
        print(f"Image URL: {public_url}")
        return public_url, filename

    except Exception as e:
        import traceback
        print(f"Error uploading image: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        return None, None


def delete_image_from_storage(image_url):
    """
    Delete image from Supabase storage using the image URL
    """
    try:
        # Extract file path from URL
        # URL format: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
        if STORAGE_BUCKET in image_url:
            path = image_url.split(f"{STORAGE_BUCKET}/")[1]
            supabase.storage.from_(STORAGE_BUCKET).remove([path])
            return True
    except Exception as e:
        print(f"Error deleting image: {e}")
    return False


# =========================
# CREATE PRODUCT
# =========================
def create_product_service(user, data):
    if user.get("role") != "seller":
        return {"error": "Only sellers can create products"}, 403

    # Find seller
    seller_id = _get_seller_id_for_user(user.get("user_id"))
    if not seller_id:
        return {"error": "Seller profile not found"}, 404

    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    price = data.get("price")
    category_id = data.get("category_id")
    # Support both field names for compatibility
    stock = data.get("current_stock_level") or data.get("stock_quantity", 0)
    images = data.get("images", [])
    specifications = data.get("specifications") or {}

    # Validation
    if not name:
        return {"error": "Product name is required"}, 400
    if price is None or not isinstance(price, (int, float)):
        return {"error": "Valid product price is required"}, 400
    if not isinstance(stock, int) or stock < 0:
        return {"error": "Stock must be a non-negative integer"}, 400
    # Images can have either 'url' (existing) or 'data' (base64 to upload)
    if images and not all("url" in img or "data" in img for img in images):
        return {"error": "All images must have a URL or base64 data"}, 400

    # Insert product
    product_resp = supabase.table("products").insert({
        "seller_id": seller_id,
        "category_id": category_id,
        "name": name,
        "description": description,
        "price": price,
        "status": "active",
        "current_stock_level": stock,
        "specifications": specifications,
    }).execute()

    if not product_resp.data:
        return {"error": "Failed to create product"}, 500

    product_id = product_resp.data[0]["product_id"]

    # Insert images - upload to storage if base64 data provided
    for img in images:
        image_url = img.get("url")
        
        # If base64 data is provided, upload to storage
        if "data" in img and img["data"]:
            uploaded_url, _ = upload_image_to_storage(img["data"], product_id)
            if uploaded_url:
                image_url = uploaded_url
            else:
                continue  # Skip if upload failed
        
        if not image_url:
            continue
            
        supabase.table("product_image").insert({
            "product_id": product_id,
            "image_url": image_url,
            "is_main": img.get("is_main", False)
        }).execute()

    return {"message": "Product created", "product_id": product_id}, 201


# =========================
# UPDATE PRODUCT
# =========================
def update_product_service(user, product_id, data):
    if user.get("role") != "seller":
        return {"error": "Only sellers can update products"}, 403

    seller_id = _get_seller_id_for_user(user.get("user_id"))
    if not seller_id:
        return {"error": "Seller profile not found"}, 404

    updates = {}
    for field in ["name", "description", "price", "category_id", "current_stock_level", "status", "specifications"]:
        if field in data:
            updates[field] = data[field]
    
    # Handle stock_quantity -> current_stock_level mapping
    if "stock_quantity" in data and "current_stock_level" not in data:
        updates["current_stock_level"] = data["stock_quantity"]

    if updates:
        response = supabase.table("products") \
            .update(updates) \
            .eq("product_id", product_id) \
            .eq("seller_id", seller_id) \
            .execute()

        if not response.data:
            return {"error": "Product not found or not yours"}, 404

    # Handle images
    images = data.get("images", [])
    delete_ids = data.get("delete_ids", [])

    # Delete images - also remove from storage
    for image_id in delete_ids:
        # First get the image URL to delete from storage
        img_resp = supabase.table("product_image") \
            .select("image_url") \
            .eq("image_id", image_id) \
            .eq("product_id", product_id) \
            .execute()
        
        if img_resp.data:
            old_url = img_resp.data[0].get("image_url")
            if old_url:
                delete_image_from_storage(old_url)
        
        # Delete from database
        supabase.table("product_image") \
            .delete() \
            .eq("image_id", image_id) \
            .eq("product_id", product_id) \
            .execute()

    for img in images:
        if "image_id" in img:
            # Updating existing image
            image_url = img.get("url")
            
            # If new base64 data is provided, upload new image and delete old
            if "data" in img and img["data"]:
                # Get old image URL to delete from storage
                old_img_resp = supabase.table("product_image") \
                    .select("image_url") \
                    .eq("image_id", img["image_id"]) \
                    .eq("product_id", product_id) \
                    .execute()
                
                if old_img_resp.data:
                    old_url = old_img_resp.data[0].get("image_url")
                    if old_url:
                        delete_image_from_storage(old_url)
                
                # Upload new image
                uploaded_url, _ = upload_image_to_storage(img["data"], product_id)
                if uploaded_url:
                    image_url = uploaded_url
            
            if image_url:
                supabase.table("product_image") \
                    .update({
                        "image_url": image_url,
                        "is_main": img.get("is_main", False)
                    }) \
                    .eq("image_id", img["image_id"]) \
                    .eq("product_id", product_id) \
                    .execute()
        else:
            # Adding new image
            image_url = img.get("url")
            
            # If base64 data is provided, upload to storage
            if "data" in img and img["data"]:
                uploaded_url, _ = upload_image_to_storage(img["data"], product_id)
                if uploaded_url:
                    image_url = uploaded_url
            
            if not image_url:
                continue
                
            supabase.table("product_image").insert({
                "product_id": product_id,
                "image_url": image_url,
                "is_main": img.get("is_main", False)
            }).execute()

    return {"message": "Product updated"}, 200


# =========================
# DELETE PRODUCT
# =========================
def delete_product_service(user, product_id):
    if user.get("role") != "seller":
        return {"error": "Only sellers can delete products"}, 403

    seller_id = _get_seller_id_for_user(user.get("user_id"))
    if not seller_id:
        return {"error": "Seller profile not found"}, 404

    # Verify product belongs to seller
    product_resp = supabase.table("products") \
        .select("product_id") \
        .eq("product_id", product_id) \
        .eq("seller_id", seller_id) \
        .execute()

    if not product_resp.data:
        return {"error": "Product not found or not yours"}, 404

    # Delete all images from storage first
    images_resp = supabase.table("product_image") \
        .select("image_url") \
        .eq("product_id", product_id) \
        .execute()

    for img in images_resp.data or []:
        if img.get("image_url"):
            delete_image_from_storage(img["image_url"])

    # Delete images from database
    supabase.table("product_image") \
        .delete() \
        .eq("product_id", product_id) \
        .execute()

    # Delete product
    supabase.table("products") \
        .delete() \
        .eq("product_id", product_id) \
        .eq("seller_id", seller_id) \
        .execute()

    return {"message": "Product deleted"}, 200


# =========================
# TOGGLE PRODUCT STATUS
# =========================
def toggle_product_status_service(user, product_id):
    if user.get("role") != "seller":
        return {"error": "Only sellers can change product status"}, 403

    seller_id = _get_seller_id_for_user(user.get("user_id"))
    if not seller_id:
        return {"error": "Seller profile not found"}, 404

    # Fetch current status
    product_resp = (
        supabase.table("products")
        .select("product_id, status")
        .eq("product_id", product_id)
        .eq("seller_id", seller_id)
        .execute()
    )

    if not product_resp.data:
        return {"error": "Product not found or not yours"}, 404

    current_status = product_resp.data[0].get("status", "active")
    new_status = "inactive" if current_status == "active" else "active"

    supabase.table("products").update({"status": new_status}).eq("product_id", product_id).eq("seller_id", seller_id).execute()

    return {"message": f"Product is now {new_status}", "status": new_status}, 200


# =========================
# LIST PRODUCTS
# =========================
def list_products_service(category_id=None, search=None):
    query = supabase.table("products").select("*, categories(category_name)").eq("status", "active")

    if category_id:
        query = query.eq("category_id", category_id)

    if search:
        query = query.ilike("name", f"%{search}%")

    response = query.execute()
    raw_products = response.data or []
    product_ids = [product.get("product_id") for product in raw_products if product.get("product_id") is not None]
    promotions_map = get_active_promotions_for_products(product_ids)

    products = [
        _normalize_product(product, promotions_map=promotions_map)
        for product in raw_products
    ]

    return {"products": products}, 200


# =========================
# GET SINGLE PRODUCT
# =========================
def get_product_service(product_id):
    response = (
        supabase.table("products")
        .select("*, categories(category_name), seller(shop_name, shop_description)")
        .eq("product_id", product_id)
        .eq("status", "active")
        .execute()
    )

    if not response.data:
        return {"error": "Product not found"}, 404

    images_map = _build_images_map([product_id])
    product = _normalize_product(response.data[0], images_map=images_map)
    product["promotion"] = get_active_promotion_for_product(product_id)

    return {"product": product}, 200


# =========================
# LIST SELLER PRODUCTS
# =========================
def list_seller_products_service(user, search=None):
    if user.get("role") != "seller":
        return {"error": "Only sellers can view their products"}, 403

    try:
        seller_id = _get_seller_id_for_user(user.get("user_id"))
        if not seller_id:
            return {"error": "Seller profile not found"}, 404

        query = (
            supabase.table("products")
            .select("*")
            .eq("seller_id", seller_id)
            .order("created_at", desc=True)
        )

        if search:
            search = str(search).strip()
            if search:
                query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")

        response = query.execute()
        raw_products = response.data or []

        product_ids = [p.get("product_id") for p in raw_products if p.get("product_id") is not None]
        category_ids = [p.get("category_id") for p in raw_products if p.get("category_id") is not None]

        images_map = _build_images_map(product_ids)
        categories_map = _build_category_map(category_ids)
        promotions_map = get_active_promotions_for_products(product_ids) if product_ids else {}

        products = [
            _normalize_product(
                product,
                categories_map=categories_map,
                images_map=images_map,
                promotions_map=promotions_map,
            )
            for product in raw_products
        ]

        return {"products": products}, 200

    except Exception as e:
        import traceback
        print(f"[list_seller_products_service] ERROR: {e}")
        print(traceback.format_exc())
        return {"error": str(e)}, 500


# =========================
# LIST CATEGORIES
# =========================
def list_categories_service():
    try:
        response = supabase.table("categories").select("*").execute()
        return {"categories": response.data or []}, 200
    except Exception as e:
        return {"error": str(e)}, 500


# =========================
# PROMOTION SERVICES
# =========================

def create_promotion_service(user, product_id, data):
    """
    Create a promotion for a product.
    Discount can be either percentage (disc_pct) or fixed amount (disc_amount).
    """
    if user.get("role") != "seller":
        return {"error": "Only sellers can create promotions"}, 403

    # Verify seller owns the product
    seller_resp = supabase.table("seller").select("seller_id").eq("user_id", user["user_id"]).execute()
    if not seller_resp.data:
        return {"error": "Seller profile not found"}, 404

    seller_id = seller_resp.data[0]["seller_id"]

    product_resp = supabase.table("products") \
        .select("product_id, price") \
        .eq("product_id", product_id) \
        .eq("seller_id", seller_id) \
        .execute()

    if not product_resp.data:
        return {"error": "Product not found or not yours"}, 404

    product_price = float(product_resp.data[0].get("price", 0))

    # Validate promotion data
    promo_name = (data.get("promo_name") or "").strip()
    discount_type = data.get("discount_type")  # 'percentage' or 'fixed'
    discount_value = data.get("discount_value")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not promo_name:
        return {"error": "Promotion name is required"}, 400
    if discount_type not in ["percentage", "fixed"]:
        return {"error": "Discount type must be 'percentage' or 'fixed'"}, 400
    if discount_value is None or not isinstance(discount_value, (int, float)) or discount_value <= 0:
        return {"error": "Discount value must be a positive number"}, 400
    if discount_type == "percentage" and discount_value > 100:
        return {"error": "Percentage discount cannot exceed 100%"}, 400
    if discount_type == "fixed" and discount_value > product_price:
        return {"error": f"Fixed discount cannot exceed product price (${product_price})"}, 400
    if not start_date or not end_date:
        return {"error": "Start date and end date are required"}, 400

    start_date_obj = datetime.strptime(str(start_date), "%Y-%m-%d").date()
    end_date_obj = datetime.strptime(str(end_date), "%Y-%m-%d").date()
    if start_date_obj > end_date_obj:
        return {"error": "Start date cannot be after end date"}, 400

    # Create promotion
    promo_data = {
        "promo_name": promo_name,
        "disc_pct": discount_value if discount_type == "percentage" else None,
        "disc_amount": discount_value if discount_type == "fixed" else None,
        "start_date": start_date,
        "end_date": end_date
    }

    promo_resp = supabase.table("promotions").insert(promo_data).execute()
    if not promo_resp.data:
        return {"error": "Failed to create promotion"}, 500

    promo_id = promo_resp.data[0]["promo_id"]

    # Link promotion to product
    supabase.table("product_promotion").insert({
        "product_id": product_id,
        "promo_id": promo_id
    }).execute()

    return {"message": "Promotion created", "promo_id": promo_id}, 201


def get_product_promotions_service(user, product_id):
    """
    Get all promotions for a product.
    """
    if user.get("role") != "seller":
        return {"error": "Only sellers can view promotions"}, 403

    # Verify seller owns the product
    seller_resp = supabase.table("seller").select("seller_id").eq("user_id", user["user_id"]).execute()
    if not seller_resp.data:
        return {"error": "Seller profile not found"}, 404

    seller_id = seller_resp.data[0]["seller_id"]

    product_resp = supabase.table("products") \
        .select("product_id") \
        .eq("product_id", product_id) \
        .eq("seller_id", seller_id) \
        .execute()

    if not product_resp.data:
        return {"error": "Product not found or not yours"}, 404

    # Get promotions linked to this product
    promo_links = supabase.table("product_promotion") \
        .select("promo_id") \
        .eq("product_id", product_id) \
        .execute()

    if not promo_links.data:
        return {"promotions": []}, 200

    promo_ids = [p["promo_id"] for p in promo_links.data]
    
    promotions_resp = supabase.table("promotions") \
        .select("*") \
        .in_("promo_id", promo_ids) \
        .execute()

    promotions = [serialize_promotion(promotion) for promotion in (promotions_resp.data or [])]

    return {"promotions": sort_promotions_newest_first(promotions)}, 200


def update_promotion_service(user, promo_id, data):
    """
    Update a promotion.
    """
    if user.get("role") != "seller":
        return {"error": "Only sellers can update promotions"}, 403

    # Verify seller owns a product with this promotion
    seller_resp = supabase.table("seller").select("seller_id").eq("user_id", user["user_id"]).execute()
    if not seller_resp.data:
        return {"error": "Seller profile not found"}, 404

    seller_id = seller_resp.data[0]["seller_id"]

    # Check if this promotion is linked to any of this seller's products
    promo_link = supabase.table("product_promotion") \
        .select("product_id") \
        .eq("promo_id", promo_id) \
        .execute()

    if not promo_link.data:
        return {"error": "Promotion not found"}, 404

    product_id = promo_link.data[0]["product_id"]

    product_check = supabase.table("products") \
        .select("product_id, price") \
        .eq("product_id", product_id) \
        .eq("seller_id", seller_id) \
        .execute()

    if not product_check.data:
        return {"error": "Promotion not found or not yours"}, 404

    product_price = float(product_check.data[0].get("price", 0))

    # Build update data
    updates = {}
    if "promo_name" in data:
        updates["promo_name"] = data["promo_name"]
    if "discount_type" in data and "discount_value" in data:
        discount_type = data["discount_type"]
        discount_value = data["discount_value"]
        
        # Validate discount value
        if discount_type == "percentage" and discount_value > 100:
            return {"error": "Percentage discount cannot exceed 100%"}, 400
        if discount_type == "fixed" and discount_value > product_price:
            return {"error": f"Fixed discount cannot exceed product price (${product_price})"}, 400
        
        if discount_type == "percentage":
            updates["disc_pct"] = discount_value
            updates["disc_amount"] = None
        else:
            updates["disc_amount"] = discount_value
            updates["disc_pct"] = None
    if "start_date" in data:
        updates["start_date"] = data["start_date"]
    if "end_date" in data:
        updates["end_date"] = data["end_date"]

    if updates:
        supabase.table("promotions") \
            .update(updates) \
            .eq("promo_id", promo_id) \
            .execute()

    return {"message": "Promotion updated"}, 200


def delete_promotion_service(user, promo_id):
    """
    Delete a promotion.
    """
    if user.get("role") != "seller":
        return {"error": "Only sellers can delete promotions"}, 403

    # Verify seller owns a product with this promotion
    seller_resp = supabase.table("seller").select("seller_id").eq("user_id", user["user_id"]).execute()
    if not seller_resp.data:
        return {"error": "Seller profile not found"}, 404

    seller_id = seller_resp.data[0]["seller_id"]

    # Check if this promotion is linked to any of this seller's products
    promo_link = supabase.table("product_promotion") \
        .select("product_id") \
        .eq("promo_id", promo_id) \
        .execute()

    if not promo_link.data:
        return {"error": "Promotion not found"}, 404

    product_id = promo_link.data[0]["product_id"]

    product_check = supabase.table("products") \
        .select("product_id") \
        .eq("product_id", product_id) \
        .eq("seller_id", seller_id) \
        .execute()

    if not product_check.data:
        return {"error": "Promotion not found or not yours"}, 404

    # Delete the promotion (cascade will remove product_promotion link)
    supabase.table("promotions") \
        .delete() \
        .eq("promo_id", promo_id) \
        .execute()

    return {"message": "Promotion deleted"}, 200
=======
from supabase_client import supabase

def create_product(data):
    result = supabase.table("products").insert({
        "name": data["name"],
        "description": data.get("description"),
        "price": data["price"],
        "seller_id": data["seller_id"],
        "status": "active",
        "current_stock_level": data.get("stock", 0)
    }).execute()

    return result.data
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
