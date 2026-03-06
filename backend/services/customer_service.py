from supabase_client import supabase
from services.promotion_utils import get_active_promotion_for_product, get_active_promotions_for_products

# =========================
# PRODUCTS
# =========================
#  List product public 

def list_products_service(category_id=None, search=None):
    try:
        query = supabase.table("products").select("*").eq("status", "active")

        if category_id:
            query = query.eq("category_id", category_id)
        if search:
            query = query.ilike("name", f"%{search}%")

        response = query.execute()
        products = response.data or []
        product_ids = [product["product_id"] for product in products]

        images_map = {}
        if product_ids:
            try:
                images_resp = (
                    supabase.table("product_image")
                    .select("product_id, image_url, is_main")
                    .in_("product_id", product_ids)
                    .execute()
                )
                for image in (images_resp.data or []):
                    product_id = image["product_id"]
                    if product_id not in images_map or image.get("is_main"):
                        images_map[product_id] = image["image_url"]
            except Exception as error:
                print(f"Error fetching images: {error}")

        categories_map = {}
        category_ids = list({product.get("category_id") for product in products if product.get("category_id")})
        if category_ids:
            try:
                categories_resp = (
                    supabase.table("categories")
                    .select("category_id, category_name")
                    .in_("category_id", category_ids)
                    .execute()
                )
                categories_map = {category["category_id"]: category["category_name"] for category in (categories_resp.data or [])}
            except Exception as error:
                print(f"Error fetching categories: {error}")

        promotions_map = get_active_promotions_for_products(product_ids)

        for product in products:
            product_id = product["product_id"]
            product["image"] = images_map.get(product_id)
            product["category_name"] = categories_map.get(product.get("category_id"))
            product["stock_quantity"] = product.get("current_stock_level", 0)
            product["promotion"] = promotions_map.get(product_id)

        return {"products": products}, 200
    except Exception as error:
        print(f"Error in list_products_service: {error}")
        return {"products": [], "error": str(error)}, 200


def get_product_service(product_id):
    product_resp = (
        supabase.table("products")
        .select("*, categories(category_name), seller(shop_name, shop_description)")
        .eq("product_id", product_id)
        .eq("status", "active")
        .execute()
    )

    if not product_resp.data:
        return {"error": "Product not found"}, 404

    product = product_resp.data[0]

    if product.get("categories"):
        product["category_name"] = product["categories"].get("category_name", "")
        del product["categories"]

    if product.get("seller"):
        product["shop_name"] = product["seller"].get("shop_name", "")
        product["shop_description"] = product["seller"].get("shop_description", "")
        del product["seller"]

    product["stock_quantity"] = product.get("current_stock_level", 0)

    images_resp = supabase.table("product_image").select("*").eq("product_id", product_id).execute()
    product["images"] = images_resp.data or []
    product["promotion"] = get_active_promotion_for_product(product_id)

    return {"product": product}, 200


# =========================
# ORDERS
# =========================
#  create order (supports cart with multiple items)
def create_order_service(user, data):
    if user.get("role") != "customer":
        return {"error": "Only customers can create orders"}, 403

    address_id = data.get("address_id")
    payment_method = data.get("payment_method", "cod")  # cod = Cash on Delivery
    items = data.get("items", [])  # List of {product_id, quantity, price}
    
    # Support legacy single item format
    if not items and data.get("product_id"):
        items = [{"product_id": data.get("product_id"), "quantity": data.get("quantity")}]

    if not items:
        return {"error": "No items in order"}, 400
    
    if not address_id:
        return {"error": "Shipping address required"}, 400

    total_amount = 0
    order_items = []
    
    # Validate all items and calculate total
    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)
        promo_id = item.get("promo_id")  # Optional promo from frontend
        
        product_resp = supabase.table("products").select("*").eq("product_id", product_id).execute()
        if not product_resp.data:
            return {"error": f"Product {product_id} not found"}, 404

        product = product_resp.data[0]

        if product["current_stock_level"] < quantity:
            return {"error": f"Not enough stock for {product['name']}"}, 400

        # Use provided price (discounted) or product price
        unit_price = float(item.get("price", product["price"]))
        item_total = unit_price * quantity
        total_amount += item_total
        
        order_items.append({
            "product_id": product_id,
            "quantity": quantity,
            "unit_price": unit_price,
            "final_price": item_total,
            "promo_id": promo_id,
            "product": product
        })

    # Determine payment status based on payment method
    # COD = unpaid (pay on delivery), bank/aba = paid (already paid online)
    order_payment_status = "unpaid" if payment_method == "cod" else "paid"

    # Get user_id and ensure it's valid
    user_id = user.get("user_id")
    
    if not user_id:
        return {"error": "User ID not found in token"}, 401

    # Create order - using user_id column
    order_data = {
        "user_id": int(user_id),
        "address_id": address_id,
        "total_amount": total_amount,
        "status": "pending",
        "payment_status": order_payment_status
    }
    
    order_resp = supabase.table("orders").insert(order_data).execute()

    order_id = order_resp.data[0]["order_id"]

    # Insert order items and reduce stock
    for item in order_items:
        order_item_data = {
            "order_id": order_id,
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "unit_price": item["unit_price"],
            "final_price": item["final_price"]
        }
        # Only include promo_id if it exists
        if item.get("promo_id"):
            order_item_data["promo_id"] = item["promo_id"]
            
        supabase.table("order_item").insert(order_item_data).execute()

        # Reduce stock
        new_stock = item["product"]["current_stock_level"] - item["quantity"]
        supabase.table("products").update({
            "current_stock_level": new_stock
        }).eq("product_id", item["product_id"]).execute()

    # Create payment record
    import uuid
    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    
    # For demo: COD is pending (pay on delivery), others are completed (paid online)
    payment_record_status = "pending" if payment_method == "cod" else "completed"
    
    supabase.table("payment").insert({
        "order_id": order_id,
        "user_id": int(user["user_id"]),  # Ensure user_id is integer
        "amount": total_amount,
        "payment_method": payment_method,
        "status": payment_record_status,
        "transaction_id": transaction_id
    }).execute()

    return {"message": "Order created successfully", "order_id": order_id, "total": total_amount}, 201

#  list orders
def list_orders_service(user):
    if user.get("role") != "customer":
        return {"error": "Only customers can view orders"}, 403

    response = supabase.table("orders").select("*").eq("user_id", user["user_id"]).order("date", desc=True).execute()
    return {"orders": response.data}, 200

#  get specific order
def get_order_service(user, order_id):
    if user.get("role") != "customer":
        return {"error": "Only customers can view orders"}, 403

    order_resp = supabase.table("orders").select("*") \
        .eq("order_id", order_id) \
        .eq("user_id", user["user_id"]) \
        .execute()

    if not order_resp.data:
        return {"error": "Order not found"}, 404

    order = order_resp.data[0]

    # Get order items with product details
    items_resp = supabase.table("order_item").select("*").eq("order_id", order_id).execute()
    items = items_resp.data or []
    
    # Fetch product details for each item
    for item in items:
        if item.get("product_id"):
            product_resp = supabase.table("products").select("name, description").eq("product_id", item["product_id"]).execute()
            if product_resp.data:
                item["product_name"] = product_resp.data[0].get("name")
                item["product_description"] = product_resp.data[0].get("description")
            
            # Get product image
            image_resp = supabase.table("product_image").select("image_url").eq("product_id", item["product_id"]).eq("is_main", True).execute()
            if image_resp.data:
                item["product_image"] = image_resp.data[0].get("image_url")
            else:
                # Fallback to any image
                image_resp = supabase.table("product_image").select("image_url").eq("product_id", item["product_id"]).limit(1).execute()
                if image_resp.data:
                    item["product_image"] = image_resp.data[0].get("image_url")
    
    order["items"] = items
    
    # Get address details
    if order.get("address_id"):
        address_resp = supabase.table("addresses").select("*").eq("address_id", order["address_id"]).execute()
        if address_resp.data:
            order["address"] = address_resp.data[0]
    
    # Get payment details
    payment_resp = supabase.table("payment").select("*").eq("order_id", order_id).execute()
    if payment_resp.data:
        order["payment"] = payment_resp.data[0]
    
    return {"order": order}, 200

#  cancel order
def cancel_order_service(user, order_id):
    if user.get("role") != "customer":
        return {"error": "Only customers can cancel orders"}, 403

    order_resp = supabase.table("orders").select("*") \
        .eq("order_id", order_id) \
        .eq("user_id", user["user_id"]) \
        .execute()

    if not order_resp.data:
        return {"error": "Order not found"}, 404

    order = order_resp.data[0]

    if order["status"] != "pending":
        return {"error": "Only pending orders can be cancelled"}, 400

    supabase.table("orders").update({"status": "cancelled"}).eq("order_id", order_id).execute()
    return {"message": "Order cancelled"}, 200


# =========================
# ADDRESS MANAGEMENT
# =========================
#  add address for customer
def add_address_service(user, data):
    if user.get("role") != "customer":
        return {"error": "Only customers can add addresses"}, 403

    response = supabase.table("addresses").insert({
        "user_id": user["user_id"],
        "street_address": data.get("street_address"),
        "city_province": data.get("city_province"),
        "is_default": data.get("is_default", False)
    }).execute()

    return {"address": response.data}, 201

#  list addresses for customer
def list_addresses_service(user):
    if user.get("role") != "customer":
        return {"error": "Only customers can view addresses"}, 403

    response = supabase.table("addresses").select("*").eq("user_id", user["user_id"]).execute()
    return {"addresses": response.data}, 200


#  update address for customer
def update_address_service(user, address_id, data):
    if user.get("role") != "customer":
        return {"error": "Only customers can update addresses"}, 403

    # Verify address belongs to user
    check = supabase.table("addresses").select("*").eq("address_id", address_id).eq("user_id", user["user_id"]).execute()
    if not check.data:
        return {"error": "Address not found"}, 404

    updates = {}
    if "street_address" in data:
        updates["street_address"] = data["street_address"]
    if "city_province" in data:
        updates["city_province"] = data["city_province"]
    if "is_default" in data:
        # If setting as default, unset other defaults first
        if data["is_default"]:
            supabase.table("addresses").update({"is_default": False}).eq("user_id", user["user_id"]).execute()
        updates["is_default"] = data["is_default"]

    if updates:
        supabase.table("addresses").update(updates).eq("address_id", address_id).execute()

    return {"message": "Address updated"}, 200


#  delete address for customer
def delete_address_service(user, address_id):
    if user.get("role") != "customer":
        return {"error": "Only customers can delete addresses"}, 403

    # Verify address belongs to user
    check = supabase.table("addresses").select("*").eq("address_id", address_id).eq("user_id", user["user_id"]).execute()
    if not check.data:
        return {"error": "Address not found"}, 404

    supabase.table("addresses").delete().eq("address_id", address_id).execute()
    return {"message": "Address deleted"}, 200