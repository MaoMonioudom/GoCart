import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Supabase
from supabase_client import supabase

# Middleware
from middleware.auth_middleware import token_required

# Blueprints
from routes.auth import auth
from routes.customer import customer
from routes.seller import seller
from routes.orders import orders
from routes.admin import admin_bp
from routes.products import products_bp


def create_app():
    # -----------------------------
    # Frontend build detection
    # -----------------------------
    frontend_dist = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    )
    has_frontend_build = os.path.isdir(frontend_dist)

    app = Flask(
        __name__,
        static_folder=(frontend_dist if has_frontend_build else None),
        static_url_path="/",
    )

    # -----------------------------
    # CORS
    # -----------------------------
    CORS(
        app,
        supports_credentials=True,
        origins="*",
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # -----------------------------
    # HEALTH CHECK
    # -----------------------------
    @app.route("/health")
    def health():
        return {"status": "ok"}

    # -----------------------------
    # FRONTEND SERVING
    # -----------------------------
    @app.route("/", methods=["GET"])
    def home():
        if has_frontend_build:
            return send_from_directory(frontend_dist, "index.html")
        return {"message": "GoCart backend running"}

    # SPA fallback
    if has_frontend_build:
        @app.route("/<path:path>")
        def spa_fallback(path):
            if path.startswith(("auth", "seller", "customer", "orders", "admin", "products")):
                return {"error": "API route not found"}, 404

            full_path = os.path.join(frontend_dist, path)
            if os.path.isfile(full_path):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, "index.html")

    # -----------------------------
    # REGISTER BLUEPRINTS
    # -----------------------------
    app.register_blueprint(auth)
    app.register_blueprint(customer)
    app.register_blueprint(seller)
    app.register_blueprint(orders)
    app.register_blueprint(admin_bp)
    app.register_blueprint(products_bp)

    # -----------------------------
    # TEST PROTECTED ROUTE
    # -----------------------------
    @app.route("/protected")
    @token_required
    def protected_test():
        user = request.user
        return jsonify(
            {"message": f"Hello {user['role']}! Your user_id is {user['user_id']}"}
        )

    # -----------------------------
    # DATABASE TEST
    # -----------------------------
    @app.route("/test-db")
    def test_db():
        try:
            data = supabase.table("users").select("*").limit(5).execute()
            return jsonify(data.data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------
    # GLOBAL ERROR HANDLER
    # -----------------------------
    @app.errorhandler(Exception)
    def handle_error(e):
        return jsonify({"error": str(e)}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)