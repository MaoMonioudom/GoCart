@products.route("/", methods=["POST"])
@token_required

def create_product():
    user = request.user

    if user["role"] != "seller":
        return jsonify({"error": "Only sellers can create products"}), 403

    # Step 1: find seller record using user_id
    seller_resp = supabase.table("seller") \
        .select("*") \
        .eq("user_id", user["user_id"]) \
        .execute()

    if not seller_resp.data:
        return jsonify({"error": "Seller profile not found"}), 404

    seller_id = seller_resp.data[0]["seller_id"]

    data = request.get_json()

    name = data.get("name")
    description = data.get("description")
    price = data.get("price")
    category_id = data.get("category_id")
    stock = data.get("current_stock_level", 0)

    if not name or not price:
        return jsonify({"error": "Name and price required"}), 400

    response = supabase.table("products").insert({
        "seller_id": seller_id,
        "category_id": category_id,
        "name": name,
        "description": description,
        "price": price,
        "status": "active",
        "current_stock_level": stock
    }).execute()

    return jsonify(response.data), 201


