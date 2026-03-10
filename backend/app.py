from flask import Flask, jsonify
from flask_cors import CORS

from supabase_client import supabase

from routes.admin import admin_bp
from routes.products import products_bp
from routes.auth import auth_bp

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(admin_bp)
app.register_blueprint(products_bp)
app.register_blueprint(auth_bp)

@app.route("/")
def home():
    return {"message": "GoCart Backend Running"}

@app.route("/test-db")
def test_db():
    data = supabase.table("users").select("*").execute()
    return jsonify(data.data)

if __name__ == "__main__":
    app.run(debug=True)