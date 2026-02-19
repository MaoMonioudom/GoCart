from flask import Flask, jsonify
from flask_cors import CORS

# Supabase client
from supabase_client import supabase

# Routes
from routes.admin import admin_bp
from routes.products import products_bp


app = Flask(__name__)
CORS(app)

# ------------------------
# Register Blueprints
# ------------------------
app.register_blueprint(admin_bp)
app.register_blueprint(products_bp)



# ------------------------
# Root Route
# ------------------------
@app.route("/")
def home():
    return {"message": "GoCart Admin Backend Running"}


# ------------------------
# Test DB Connection
# ------------------------
@app.route("/test-db")
def test_db():
    data = supabase.table("users").select("*").execute()
    return jsonify(data.data)


# ------------------------
# Run Server
# ------------------------
if __name__ == "__main__":
    app.run(debug=True)
