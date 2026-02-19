from flask import Blueprint, request, jsonify
from services.product_service import create_product

products_bp = Blueprint("products", __name__, url_prefix="/products")

@products_bp.route("", methods=["POST"])
def add_product():
    return jsonify(create_product(request.json))
