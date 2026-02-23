# services/seller_service.py
from supabase_client import supabase


# ================= HELPERS =================
def get_seller_id(user_id):
    resp = supabase.table("seller").select("seller_id").eq("user_id", user_id).limit(1).execute()
    if not resp.data:
        return None
    return resp.data[0]["seller_id"]


def get_seller_products_ids(seller_id):
    resp = supabase.table("products").select("product_id").eq("seller_id", seller_id).execute()
    return [p["product_id"] for p in resp.data or []]


# ================= PROFILE =================
def get_profile(user_id):
    sid = get_seller_id(user_id)
    if not sid:
        return None

    resp = supabase.table("seller").select("*").eq("seller_id", sid).single().execute()
    return resp.data


# ================= PRODUCTS =================
def get_products(user_id, page, limit):
    sid = get_seller_id(user_id)
    start = (page - 1) * limit

    resp = (
        supabase.table("products")
        .select("*")
        .eq("seller_id", sid)
        .range(start, start + limit - 1)
        .order("product_id", desc=True)
        .execute()
    )
    return resp.data


def create_product(user_id, data):
    sid = get_seller_id(user_id)
    data["seller_id"] = sid
    return supabase.table("products").insert(data).execute().data


def update_product(pid, data):
    return supabase.table("products").update(data).eq("product_id", pid).execute().data


def delete_product(pid):
    supabase.table("products").delete().eq("product_id", pid).execute()
    return {"message": "deleted"}


def update_stock(pid, qty):
    return supabase.table("products").update(
        {"current_stock_level": qty}
    ).eq("product_id", pid).execute().data


# ================= ORDERS =================
def get_orders(user_id):
    sid = get_seller_id(user_id)
    product_ids = get_seller_products_ids(sid)

    oi = supabase.table("order_item").select("*").in_("product_id", product_ids).execute()
    order_ids = list({i["order_id"] for i in oi.data or []})

    orders = supabase.table("orders").select("*").in_("order_id", order_ids).execute()
    return orders.data


def update_order_status(oid, status):
    return supabase.table("orders").update({"status": status}).eq("order_id", oid).execute().data


# ================= DASHBOARD =================
def get_stats(user_id):
    sid = get_seller_id(user_id)

    products = supabase.table("products").select("*").eq("seller_id", sid).execute().data or []
    pids = [p["product_id"] for p in products]

    order_items = supabase.table("order_item").select("*").in_("product_id", pids).execute().data or []

    revenue = sum(float(i.get("quantity", 0)) * float(i.get("final_price", 0)) for i in order_items)

    return {
        "products": len(products),
        "low_stock": len([p for p in products if p.get("current_stock_level", 0) < 5]),
        "orders": len(set(i["order_id"] for i in order_items)),
        "revenue": revenue
    }


def get_low_stock(user_id):
    sid = get_seller_id(user_id)
    return supabase.table("products").select("*").eq("seller_id", sid).lt("current_stock_level", 5).execute().data
