from flask import Blueprint, request, jsonify

from supabase_client import supabase
from utils.hash import hash_password, verify_password
from utils.jwt_handler import create_token
from middleware.auth_middleware import token_required, role_required

auth = Blueprint("auth", __name__, url_prefix="/auth")

def _split_full_name(full_name: str):
    full_name = (full_name or "").strip()
    if not full_name:
        return "", ""
    parts = full_name.split()
    first = parts[0]
    last = " ".join(parts[1:]) if len(parts) > 1 else ""
    return first, last


@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    role = (data.get("role") or "customer").strip().lower()

    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    full_name = (data.get("full_name") or "").strip()
    phone_number = (data.get("phone_number") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if role not in ("customer", "seller", "admin"):
        return jsonify({"error": "Invalid role"}), 400

    if full_name and (not first_name and not last_name):
        first_name, last_name = _split_full_name(full_name)

    hashed_pw = hash_password(password)

    try:
        existing = (
            supabase.table("users")
            .select("user_id")
            .eq("email", email)
            .limit(1)
            .execute()
        )
        if existing.data:
            return jsonify({"error": "Email already exists"}), 409

        insert_payload = {
            "email": email,
            "password": hashed_pw,
            "role": role,
            "first_name": first_name or None,
            "last_name": last_name or None,
            "phone_number": phone_number or None,
        }

        resp = supabase.table("users").insert(insert_payload).execute()
        if not resp.data:
            return jsonify({"error": "Registration failed", "details": "No data returned"}), 400

        user = resp.data[0]
        user_id = user["user_id"]

        if role == "seller":
            shop_name = (data.get("shop_name") or "My Shop").strip()
            seller_existing = (
                supabase.table("seller")
                .select("*")
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            if not seller_existing.data:
                supabase.table("seller").insert(
                    {"user_id": user_id, "shop_name": shop_name, "verified": False}
                ).execute()

        user.pop("password", None)
        return jsonify(user), 201

    except Exception as e:
        return jsonify({"error": "Registration failed", "details": str(e)}), 400


@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user_resp = (
        supabase.table("users")
        .select("*")
        .eq("email", email)
        .limit(1)
        .execute()
    )

    if not user_resp.data:
        return jsonify({"error": "User not found"}), 404

    user = user_resp.data[0]

    if not verify_password(password, user.get("password", "")):
        return jsonify({"error": "Wrong password"}), 401

    token = create_token(user["user_id"], user["role"])
    user.pop("password", None)

    return jsonify({"token": token, "user": user}), 200


@auth.route("/upgrade-to-seller", methods=["POST"])
@token_required
@role_required("customer")
def upgrade_to_seller():
    user = request.user
    data = request.get_json(silent=True) or {}
    shop_name = (data.get("shop_name") or "My Shop").strip()

    try:
        supabase.table("users").update({"role": "seller"}).eq("user_id", user["user_id"]).execute()

        existing = (
            supabase.table("seller")
            .select("seller_id")
            .eq("user_id", user["user_id"])
            .limit(1)
            .execute()
        )

        if not existing.data:
            supabase.table("seller").insert(
                {"user_id": user["user_id"], "shop_name": shop_name, "verified": False}
            ).execute()

        token = create_token(user["user_id"], "seller")
        return jsonify({"token": token}), 200

    except Exception as e:
        return jsonify({"error": "Upgrade failed", "details": str(e)}), 400