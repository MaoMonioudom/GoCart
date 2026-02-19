from functools import wraps
from flask import request, jsonify
from utils.jwt_handler import verify_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]

        if not token:
            return jsonify({"error": "Token missing"}), 401

        data = verify_token(token)
        if not data:
            return jsonify({"error": "Invalid or expired token"}), 401

        request.user = data  # attach user info to request
        return f(*args, **kwargs)
    return decorated
