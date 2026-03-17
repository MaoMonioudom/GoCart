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
from routes.admin import admin
from routes.products import products


# =====================================================
# APP FACTORY
# =====================================================
def create_app():

    # -------------------------------------------------
    # Detect frontend build
    # -------------------------------------------------
    frontend_dist = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    )
    has_frontend_build = os.path.isdir(frontend_dist)

    print("Frontend build:", has_frontend_build)
    print("Frontend path:", frontend_dist)

    app = Flask(
        __name__,
        static_folder=(frontend_dist if has_frontend_build else None),
        static_url_path="/",
    )

    # -------------------------------------------------
    # Security
    # -------------------------------------------------
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB upload limit

    # -------------------------------------------------
    # CORS
    # -------------------------------------------------
    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # -------------------------------------------------
    # Request logging
    # -------------------------------------------------
    @app.before_request
    def log_request():
        print(f"{request.method} {request.path}")

    # -------------------------------------------------
    # Fix OPTIONS preflight
    # -------------------------------------------------
    @app.before_request
    def cors_preflight_ok():
        if request.method == "OPTIONS":
            return ("", 200)

    # -------------------------------------------------
    # Health check
    # -------------------------------------------------
    @app.route("/health")
    def health():
        return {"status": "ok"}

    # -------------------------------------------------
    # Home
    # -------------------------------------------------
    @app.route("/")
    def home():
        if has_frontend_build:
            return send_from_directory(frontend_dist, "index.html")
        return {"message": "GoCart backend running"}

    # -------------------------------------------------
    # SPA fallback
    # -------------------------------------------------
    if has_frontend_build:

        @app.route("/<path:path>")
        def spa_fallback(path):
            if path.startswith(
                ("auth", "seller", "customer", "orders", "admin", "products")
            ):
                return {"error": "API route not found"}, 404

            full_path = os.path.join(frontend_dist, path)

            if os.path.isfile(full_path):
                return send_from_directory(frontend_dist, path)

            return send_from_directory(frontend_dist, "index.html")

    # -------------------------------------------------
    # REGISTER BLUEPRINTS
    # (Blueprints already define their own url_prefix)
    # -------------------------------------------------
    app.register_blueprint(auth)
    app.register_blueprint(customer)
    app.register_blueprint(seller)
    app.register_blueprint(orders)
    app.register_blueprint(admin)
    app.register_blueprint(products)

    # -------------------------------------------------
    # Protected test route
    # -------------------------------------------------
    @app.route("/protected")
    @token_required
    def protected_test():
        user = request.user
        return jsonify({
            "message": f"Hello {user['role']}! Your user_id is {user['user_id']}"
        })

    # -------------------------------------------------
    # Database test route
    # -------------------------------------------------
    @app.route("/test-db")
    def test_db():
        try:
            data = supabase.table("users").select("*").limit(5).execute()
            return jsonify(data.data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -------------------------------------------------
    # Error Handlers
    # -------------------------------------------------
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found"}), 404

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(Exception)
    def handle_error(e):
        return jsonify({"error": str(e)}), 500

    return app


# =====================================================
# RUN APP
# =====================================================
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
