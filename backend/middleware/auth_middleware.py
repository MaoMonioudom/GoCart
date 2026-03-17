from functools import wraps
<<<<<<< HEAD
from flask import request, jsonify

from utils.jwt_handler import verify_token


def _extract_bearer_token():
    """Return token string from `Authorization: Bearer <token>` or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return None

    parts = auth_header.split()
    if len(parts) != 2:
        return None
    scheme, token = parts
    if scheme.lower() != "bearer":
        return None
    return token


def token_required(f):
    """Decorator: requires a valid JWT and attaches `request.user` = {user_id, role, exp}."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_bearer_token()
        if not token:
            return jsonify({"error": "Token missing"}), 401

        data = verify_token(token)
        if not data:
            return jsonify({"error": "Invalid or expired token"}), 401

        request.user = {"user_id": data.get("user_id"), "role": data.get("role")}
        return f(*args, **kwargs)

    return decorated


def role_required(required_role: str):
    """Decorator: requires a valid JWT and a matching role.

    Usage:
        @token_required
        @role_required("seller")
        def endpoint(...):
            ...

    Note: If `@token_required` is missing, this decorator will still enforce auth.
    """

    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # If token_required already ran, request.user will exist.
            user = getattr(request, "user", None)
            if not user:
                token = _extract_bearer_token()
                if not token:
                    return jsonify({"error": "Token missing"}), 401
                data = verify_token(token)
                if not data:
                    return jsonify({"error": "Invalid or expired token"}), 401
                request.user = {"user_id": data.get("user_id"), "role": data.get("role")}
                user = request.user

            if user.get("role") != required_role:
                return jsonify({"error": "Forbidden"}), 403

            return f(*args, **kwargs)

        return wrapped

    return decorator
=======
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
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
