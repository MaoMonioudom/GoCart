from flask import Blueprint, request, jsonify
from services.user_service import get_user_by_email
from utils.auth import generate_token
from utils.hash import verify_password

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if not user:
        return jsonify({"message": "Invalid email"}), 401

    if not verify_password(password, user["password"]):
        return jsonify({"message": "Invalid password"}), 401

    token = generate_token(user)

    return jsonify({
        "token": token,
        "role": user["role"]
    })