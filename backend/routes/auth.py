from flask import Blueprint, request, jsonify
from supabase_client import supabase
from utils.hash import hash_password, verify_password
from utils.jwt_handler import create_token

auth = Blueprint("auth", __name__)

# ===== REGISTER =====
@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "customer")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # Hash password
    hashed_pw = hash_password(password)

    try:
        # Insert into users table
        response = supabase.table("users").insert({
            "email": email,
            "password": hashed_pw,
            "role": role
        }).execute()

        user = response.data[0]
        user_id = user["user_id"]

        # If seller, create seller profile
        if role == "seller":
            supabase.table("seller").insert({
                "user_id": user_id,
                "shop_name": "My Shop",
                "verified": False
            }).execute()

        return jsonify(user), 201

    except Exception as e:
        return jsonify({"error": "Registration failed", "details": str(e)}), 400

# ===== LOGIN =====
@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # Fetch user
    user_resp = supabase.table("users").select("*").eq("email", email).execute()
    users = user_resp.data

    if not users:
        return jsonify({"error": "User not found"}), 404

    user = users[0]

    # Verify password
    if not verify_password(password, user["password"]):
        return jsonify({"error": "Wrong password"}), 401

    # Create JWT token
    token = create_token(user["user_id"], user["role"])

    return jsonify({"token": token}), 200
