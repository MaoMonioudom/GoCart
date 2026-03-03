from supabase_client import supabase
from utils.hash import hash_password, verify_password
from utils.jwt_handler import create_token


# =========================
# REGISTER USER
# =========================
def register_user(data):
    """
    Register a new user.
    Supports:
    - Customer registration
    - Direct seller registration (optional via role="seller")
    """

    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    phone_number = data.get("phone_number")
    role = data.get("role", "customer")  # default customer

    if not email or not password:
        return {"error": "Email and password required"}, 400

    hashed_pw = hash_password(password)

    try:
        # Create user
        response = supabase.table("users").insert({
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": hashed_pw,
            "phone_number": phone_number,
            "role": role
        }).execute()

        user = response.data[0]
        user_id = user["user_id"]

        seller_data = None

        # If registering directly as seller
        if role == "seller":
            seller_resp = supabase.table("seller").insert({
                "user_id": user_id,
                "shop_name": data.get("shop_name", "My Shop"),
                "shop_description": data.get("shop_description", ""),
                "bank_account": data.get("bank_account"),
                "verified": False
            }).execute()

            seller_data = seller_resp.data[0]

        # Remove password from response
        user_response = {
            "user_id": user_id,
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "email": user["email"],
            "phone_number": user.get("phone_number"),
            "role": user["role"],
            "created_at": user.get("created_at")
        }

        result = {
            "message": "Registration successful",
            "user": user_response
        }

        if seller_data:
            result["seller"] = seller_data

        return result, 201

    except Exception as e:
        error_msg = str(e)
        if "duplicate key" in error_msg.lower() or "unique" in error_msg.lower():
            return {"error": "Email already registered"}, 409
        return {"error": "Registration failed", "details": error_msg}, 400


# =========================
# REGISTER AS SELLER (Upgrade)
# =========================
def register_as_seller(user, data):
    """
    Upgrade logged-in customer to seller
    """

    user_id = user.get("user_id")
    current_role = user.get("role")

    if current_role != "customer":
        if current_role == "seller":
            return {"error": "You are already a seller"}, 400
        return {"error": "Only customers can register as sellers"}, 403

    shop_name = data.get("shop_name")
    if not shop_name:
        return {"error": "Shop name is required"}, 400

    try:
        # Update role
        supabase.table("users").update({
            "role": "seller"
        }).eq("user_id", user_id).execute()

        # Create seller profile
        seller_resp = supabase.table("seller").insert({
            "user_id": user_id,
            "shop_name": shop_name,
            "shop_description": data.get("shop_description", ""),
            "bank_account": data.get("bank_account"),
            "verified": False
        }).execute()

        seller = seller_resp.data[0]

        # New token with seller role
        new_token = create_token(user_id, "seller")

        return {
            "message": "Successfully registered as seller",
            "token": new_token,
            "seller": seller
        }, 201

    except Exception as e:
        # Rollback role if failed
        supabase.table("users").update({
            "role": "customer"
        }).eq("user_id", user_id).execute()

        return {"error": "Failed to register as seller", "details": str(e)}, 400


# =========================
# LOGIN
# =========================
def login_user(data):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"error": "Email and password required"}, 400

    try:
        user_resp = supabase.table("users").select("*").eq("email", email).execute()
        users = user_resp.data

        if not users:
            return {"error": "User not found"}, 404

        user = users[0]

        if not verify_password(password, user["password"]):
            return {"error": "Wrong password"}, 401

        token = create_token(user["user_id"], user["role"])

        user_response = {
            "user_id": user["user_id"],
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "email": user["email"],
            "phone_number": user.get("phone_number"),
            "role": user["role"]
        }

        return {"token": token, "user": user_response}, 200

    except Exception as e:
        return {"error": "Login failed", "details": str(e)}, 400


# =========================
# GET USER PROFILE
# =========================
def get_user_profile(user_id):
    try:
        user_resp = supabase.table("users").select("*").eq("user_id", user_id).execute()

        if not user_resp.data:
            return {"error": "User not found"}, 404

        user = user_resp.data[0]

        user_response = {
            "user_id": user["user_id"],
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "email": user["email"],
            "phone_number": user.get("phone_number"),
            "role": user["role"],
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at")
        }

        # If seller, attach seller profile
        if user["role"] == "seller":
            seller_resp = supabase.table("seller").select("*").eq("user_id", user_id).execute()
            if seller_resp.data:
                user_response["seller"] = seller_resp.data[0]

        return {"user": user_response}, 200

    except Exception as e:
        return {"error": "Failed to get profile", "details": str(e)}, 400


# =========================
# UPDATE USER PROFILE
# =========================
def update_user_profile(user_id, data):
    try:
        updates = {}
        for field in ["first_name", "last_name", "phone_number"]:
            if field in data:
                updates[field] = data[field]

        if not updates:
            return {"error": "No fields to update"}, 400

        response = supabase.table("users").update(updates).eq("user_id", user_id).execute()

        if not response.data:
            return {"error": "User not found"}, 404

        return {"message": "Profile updated", "user": response.data[0]}, 200

    except Exception as e:
        return {"error": "Failed to update profile", "details": str(e)}, 400


# =========================
# CHANGE PASSWORD
# =========================
def change_password(user_id, data):
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return {"error": "Current and new password required"}, 400

    try:
        user_resp = supabase.table("users").select("password").eq("user_id", user_id).execute()

        if not user_resp.data:
            return {"error": "User not found"}, 404

        if not verify_password(current_password, user_resp.data[0]["password"]):
            return {"error": "Current password is incorrect"}, 401

        hashed_new = hash_password(new_password)
        supabase.table("users").update({
            "password": hashed_new
        }).eq("user_id", user_id).execute()

        return {"message": "Password changed successfully"}, 200

    except Exception as e:
        return {"error": "Failed to change password", "details": str(e)}, 400


# =========================
# UPDATE SELLER PROFILE
# =========================
def update_seller_profile(user_id, data):
    try:
        seller_resp = supabase.table("seller").select("*").eq("user_id", user_id).execute()

        if not seller_resp.data:
            return {"error": "Seller profile not found"}, 404

        seller_id = seller_resp.data[0]["seller_id"]

        updates = {}
        for field in ["shop_name", "shop_description", "bank_account"]:
            if field in data:
                updates[field] = data[field]

        if not updates:
            return {"error": "No fields to update"}, 400

        response = supabase.table("seller").update(updates).eq("seller_id", seller_id).execute()

        return {"message": "Seller profile updated", "seller": response.data[0]}, 200

    except Exception as e:
        return {"error": "Failed to update seller profile", "details": str(e)}, 400


# =========================
# SELLER STATISTICS
# =========================
def get_seller_statistics(user_id):
    try:
        seller_resp = supabase.table("seller").select("*").eq("user_id", user_id).execute()
        if not seller_resp.data:
            return {"error": "Seller profile not found"}, 404

        seller_id = seller_resp.data[0]["seller_id"]

        products_resp = supabase.table("products").select("product_id").eq("seller_id", seller_id).execute()
        product_count = len(products_resp.data) if products_resp.data else 0

        order_count = 0
        try:
            orders_resp = supabase.table("order_items") \
                .select("order_id, products!inner(seller_id)") \
                .eq("products.seller_id", seller_id).execute()

            unique_orders = set(item["order_id"] for item in orders_resp.data) if orders_resp.data else set()
            order_count = len(unique_orders)
        except:
            pass

        avg_rating = 0.0
        try:
            reviews_resp = supabase.table("reviews") \
                .select("rating, products!inner(seller_id)") \
                .eq("products.seller_id", seller_id).execute()

            if reviews_resp.data:
                ratings = [r["rating"] for r in reviews_resp.data if r.get("rating")]
                if ratings:
                    avg_rating = round(sum(ratings) / len(ratings), 1)
        except:
            pass

        return {
            "statistics": {
                "product_count": product_count,
                "order_count": order_count,
                "average_rating": avg_rating
            }
        }, 200

    except Exception as e:
        return {"error": "Failed to get statistics", "details": str(e)}, 400