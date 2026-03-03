from flask import Blueprint, request, jsonify
from services.auth_service import (
    register_user,
    register_as_seller,
    login_user,
    get_user_profile,
    update_user_profile,
    change_password,
    update_seller_profile,
    get_seller_statistics
)
from middleware.auth_middleware import token_required

auth = Blueprint("auth", __name__, url_prefix="/auth")


# =========================
# Helper: Split Full Name
# =========================
def _split_full_name(full_name: str):
    full_name = (full_name or "").strip()
    if not full_name:
        return "", ""
    parts = full_name.split()
    first = parts[0]
    last = " ".join(parts[1:]) if len(parts) > 1 else ""
    return first, last


# =========================
# REGISTER (Customer / Seller / Admin)
# =========================
@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    # Normalize fields
    data["email"] = (data.get("email") or "").strip().lower()
    data["role"] = (data.get("role") or "customer").strip().lower()
    data["first_name"] = (data.get("first_name") or "").strip()
    data["last_name"] = (data.get("last_name") or "").strip()
    data["phone_number"] = (data.get("phone_number") or "").strip()

    full_name = (data.get("full_name") or "").strip()

    # Validate role
    if data["role"] not in ("customer", "seller", "admin"):
        return jsonify({"error": "Invalid role"}), 400

    # If only full_name provided, split it
    if full_name and not data["first_name"] and not data["last_name"]:
        first, last = _split_full_name(full_name)
        data["first_name"] = first
        data["last_name"] = last

    result, status = register_user(data)
    return jsonify(result), status


# =========================
# LOGIN
# =========================
@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    data["email"] = (data.get("email") or "").strip().lower()

    result, status = login_user(data)
    return jsonify(result), status


# =========================
# REGISTER AS SELLER (Upgrade)
# =========================
@auth.route("/register-seller", methods=["POST"])
@token_required
def register_seller():
    data = request.get_json(silent=True) or {}
    result, status = register_as_seller(request.user, data)
    return jsonify(result), status


# =========================
# UPGRADE TO SELLER (Alias)
# =========================
@auth.route("/upgrade-to-seller", methods=["POST"])
@token_required
def upgrade_to_seller():
    data = request.get_json(silent=True) or {}
    result, status = register_as_seller(request.user, data)
    return jsonify(result), status


# =========================
# GET PROFILE
# =========================
@auth.route("/profile", methods=["GET"])
@token_required
def profile():
    result, status = get_user_profile(request.user["user_id"])
    return jsonify(result), status


# =========================
# UPDATE PROFILE
# =========================
@auth.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json(silent=True) or {}
    result, status = update_user_profile(request.user["user_id"], data)
    return jsonify(result), status


# =========================
# CHANGE PASSWORD
# =========================
@auth.route("/change-password", methods=["PUT"])
@token_required
def change_pwd():
    data = request.get_json(silent=True) or {}
    result, status = change_password(request.user["user_id"], data)
    return jsonify(result), status


# =========================
# UPDATE SELLER PROFILE
# =========================
@auth.route("/seller-profile", methods=["PUT"])
@token_required
def update_seller():
    if request.user.get("role") != "seller":
        return jsonify({"error": "Only sellers can access this endpoint"}), 403

    data = request.get_json(silent=True) or {}
    result, status = update_seller_profile(request.user["user_id"], data)
    return jsonify(result), status


# =========================
# GET SELLER STATISTICS
# =========================
@auth.route("/seller-statistics", methods=["GET"])
@token_required
def seller_stats():
    if request.user.get("role") != "seller":
        return jsonify({"error": "Only sellers can access this endpoint"}), 403

    result, status = get_seller_statistics(request.user["user_id"])
    return jsonify(result), status