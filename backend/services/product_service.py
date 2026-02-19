from supabase_client import supabase

def create_product(data):
    result = supabase.table("products").insert({
        "name": data["name"],
        "description": data.get("description"),
        "price": data["price"],
        "seller_id": data["seller_id"],
        "status": "active",
        "current_stock_level": data.get("stock", 0)
    }).execute()

    return result.data
