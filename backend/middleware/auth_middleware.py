from functools import wraps
from flask import request, jsonify, g
from utils.auth import verify_token


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Token missing"}), 401

        try:
            token = auth_header.split(" ")[1]

            payload = verify_token(token)

            if not payload:
                return jsonify({"error": "Invalid token"}), 401

            if payload.get("role") != "admin":
                return jsonify({"error": "Admin access required"}), 403

            # store decoded user info
            g.user = payload

        except Exception as e:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated