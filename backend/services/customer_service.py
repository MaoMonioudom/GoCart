from supabase_client import supabase

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

        # Get all product IDs
        product_ids = [p["product_id"] for p in products]
        
        # Batch fetch images for all products
        images_map = {}
        if product_ids:
            try:
                images_resp = supabase.table("product_image").select("product_id, image_url, is_main").in_("product_id", product_ids).execute()
                for img in (images_resp.data or []):
                    pid = img["product_id"]
                    if pid not in images_map or img.get("is_main"):
                        images_map[pid] = img["image_url"]
            except Exception as e:
                print(f"Error fetching images: {e}")
        
        # Batch fetch categories
        category_ids = list(set(p.get("category_id") for p in products if p.get("category_id")))
        categories_map = {}
        if category_ids:
            try:
                cats_resp = supabase.table("categories").select("category_id, category_name").in_("category_id", category_ids).execute()
                for cat in (cats_resp.data or []):
                    categories_map[cat["category_id"]] = cat["category_name"]
            except Exception as e:
                print(f"Error fetching categories: {e}")

        # Batch fetch promotions
        promos_map = {}
        if product_ids:
            try:
                pp_resp = supabase.table("product_promotion").select("product_id, promo_id").in_("product_id", product_ids).execute()
                promo_ids = list(set(pp["promo_id"] for pp in (pp_resp.data or [])))
                
                if promo_ids:
                    promos_resp = supabase.table("promotions").select("*").in_("promo_id", promo_ids).execute()
                    promos_by_id = {p["promo_id"]: p for p in (promos_resp.data or [])}
                    
                    from datetime import datetime, date
                    today = date.today()
                    
                    for pp in (pp_resp.data or []):
                        promo = promos_by_id.get(pp["promo_id"])
                        if promo:
                            # Check if promotion is active
                            is_active = True
                            if promo.get("start_date"):
                                start = datetime.strptime(str(promo["start_date"]), "%Y-%m-%d").date() if isinstance(promo["start_date"], str) else promo["start_date"]
                                if today < start:
                                    is_active = False
                            if promo.get("end_date"):
                                end = datetime.strptime(str(promo["end_date"]), "%Y-%m-%d").date() if isinstance(promo["end_date"], str) else promo["end_date"]
                                if today > end:
                                    is_active = False
                            
                            if is_active:
                                promos_map[pp["product_id"]] = {
                                    "promo_id": promo["promo_id"],
                                    "promo_name": promo.get("promo_name"),
                                    "discount_type": "percentage" if promo.get("disc_pct") else "fixed",
                                    "discount_value": float(promo.get("disc_pct") or promo.get("disc_amount") or 0),
                                    "start_date": str(promo.get("start_date")),
                                    "end_date": str(promo.get("end_date"))
                                }
            except Exception as e:
                print(f"Error fetching promotions: {e}")

        # Enrich products
        for product in products:
            product_id = product["product_id"]
            product["image"] = images_map.get(product_id)
            product["category_name"] = categories_map.get(product.get("category_id"))
            if product_id in promos_map:
                product["promotion"] = promos_map[product_id]

        return {"products": products}, 200
    except Exception as e:
        print(f"Error in list_products_service: {e}")
        return {"products": [], "error": str(e)}, 200

# get specific product
def get_product_service(product_id):
    from datetime import datetime, date
    
    product_resp = supabase.table("products") \
        .select("*, categories(category_name), seller(shop_name, shop_description)") \
        .eq("product_id", product_id) \
        .eq("status", "active") \
        .execute()

    if not product_resp.data:
        return {"error": "Product not found"}, 404

    product = product_resp.data[0]
    
    # Extract category name
    if product.get("categories"):
        product["category_name"] = product["categories"].get("category_name", "")
        del product["categories"]
    
    # Extract seller/shop info
    if product.get("seller"):
        product["shop_name"] = product["seller"].get("shop_name", "")
        product["shop_description"] = product["seller"].get("shop_description", "")
        del product["seller"]
    
    # Add stock_quantity for frontend compatibility
    product["stock_quantity"] = product.get("current_stock_level", 0)

    # Get images
    images_resp = supabase.table("product_image") \
        .select("*") \
        .eq("product_id", product_id) \
        .execute()

    product["images"] = images_resp.data or []
    
    # Get active promotion
    try:
        pp_resp = supabase.table("product_promotion").select("promo_id").eq("product_id", product_id).execute()
        if pp_resp.data:
            promo_id = pp_resp.data[0]["promo_id"]
            promo_resp = supabase.table("promotions").select("*").eq("promo_id", promo_id).execute()
            if promo_resp.data:
                promo = promo_resp.data[0]
                today = date.today()
                is_active = True
                if promo.get("start_date"):
                    start = datetime.strptime(str(promo["start_date"]), "%Y-%m-%d").date() if isinstance(promo["start_date"], str) else promo["start_date"]
                    if today < start:
                        is_active = False
                if promo.get("end_date"):
                    end = datetime.strptime(str(promo["end_date"]), "%Y-%m-%d").date() if isinstance(promo["end_date"], str) else promo["end_date"]
                    if today > end:
                        is_active = False
                
                if is_active:
                    product["promotion"] = {
                        "promo_id": promo["promo_id"],
                        "promo_name": promo.get("promo_name"),
                        "discount_type": "percentage" if promo.get("disc_pct") else "fixed",
                        "discount_value": float(promo.get("disc_pct") or promo.get("disc_amount") or 0),
                        "start_date": str(promo.get("start_date")),
                        "end_date": str(promo.get("end_date"))
                    }
    except Exception as e:
        print(f"Error fetching promotion for product {product_id}: {e}")
    
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