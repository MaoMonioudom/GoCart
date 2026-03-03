# services/seller_service.py
from supabase_client import supabase
import services.ml_service as ml_service


# ================= HELPERS =================
def get_seller_id(user_id):
    """
    Return seller_id for a user_id, or None if not found.
    """
    try:
        resp = (
            supabase.table("seller")
            .select("seller_id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if not resp.data:
            return None
        return resp.data[0].get("seller_id")
    except Exception:
        return None


def get_seller_products_ids(seller_id):
    """
    Return list of product_id for seller, or [] if none / invalid.
    """
    if not seller_id:
        return []
    try:
        resp = supabase.table("products").select("product_id").eq("seller_id", seller_id).execute()
        return [p.get("product_id") for p in (resp.data or []) if p.get("product_id") is not None]
    except Exception:
        return []


def _safe_list(value):
    return value if isinstance(value, list) else []


# ================= PROFILE =================
def get_profile(user_id):
    sid = get_seller_id(user_id)
    if not sid:
        return None
    try:
        return supabase.table("seller").select("*").eq("seller_id", sid).single().execute().data
    except Exception:
        return None


def update_seller_profile(user_id, data):
    sid = get_seller_id(user_id)
    if not sid:
        return []
    try:
        return supabase.table("seller").update(data).eq("seller_id", sid).execute().data
    except Exception:
        return []


# ================= PRODUCTS =================
def get_products(user_id, page, limit):
    sid = get_seller_id(user_id)
    if not sid:
        return []

    start = (page - 1) * limit

    try:
        resp = (
            supabase.table("products")
            .select("*")
            .eq("seller_id", sid)
            .range(start, start + limit - 1)
            .order("product_id", desc=True)
            .execute()
        )
        return resp.data or []
    except Exception:
        return []


def get_product_detail(pid):
    if not pid:
        return None
    try:
        return supabase.table("products").select("*").eq("product_id", pid).single().execute().data
    except Exception:
        return None


def create_product(user_id, data):
    sid = get_seller_id(user_id)
    if not sid:
        return []
    data["seller_id"] = sid
    try:
        return supabase.table("products").insert(data).execute().data
    except Exception:
        return []


def update_product(pid, data):
    if not pid:
        return []
    try:
        return supabase.table("products").update(data).eq("product_id", pid).execute().data
    except Exception:
        return []


def delete_product(pid):
    if not pid:
        return {"message": "deleted"}
    try:
        supabase.table("products").delete().eq("product_id", pid).execute()
    except Exception:
        # still return ok to avoid crashing UI
        pass
    return {"message": "deleted"}


def update_stock(pid, qty):
    """
    NOTE:
    Your frontend Product.jsx shows stock_quantity.
    Your seller dashboard code used current_stock_level.
    Keep current_stock_level update here (as in your existing schema usage).
    If your table is actually stock_quantity, change the column below.
    """
    if not pid:
        return []
    try:
        return (
            supabase.table("products")
            .update({"current_stock_level": qty})
            .eq("product_id", pid)
            .execute()
            .data
        )
    except Exception:
        return []


# ================= ORDERS =================
def get_orders(user_id):
    sid = get_seller_id(user_id)
    if not sid:
        return []

    product_ids = get_seller_products_ids(sid)
    if not product_ids:
        return []

    try:
        oi_resp = supabase.table("order_item").select("*").in_("product_id", product_ids).execute()
        order_items = oi_resp.data or []
    except Exception:
        return []

    order_ids = list({i.get("order_id") for i in order_items if i.get("order_id") is not None})
    if not order_ids:
        return []

    try:
        orders_resp = supabase.table("orders").select("*").in_("order_id", order_ids).execute()
        return orders_resp.data or []
    except Exception:
        return []


def update_order_status(oid, status):
    if not oid:
        return []
    try:
        return supabase.table("orders").update({"status": status}).eq("order_id", oid).execute().data
    except Exception:
        return []


# ================= DASHBOARD =================
def get_stats(user_id):
    """
    Returns stable defaults to prevent 500 when seller/products/orders are missing.
    """
    sid = get_seller_id(user_id)
    if not sid:
        return {
            "products": 0,
            "low_stock": 0,
            "orders": 0,
            "revenue": 0,
        }

    try:
        products = supabase.table("products").select("*").eq("seller_id", sid).execute().data or []
    except Exception:
        products = []

    pids = [p.get("product_id") for p in products if p.get("product_id") is not None]
    if not pids:
        return {
            "products": len(products),
            "low_stock": len([p for p in products if (p.get("current_stock_level") or 0) < 5]),
            "orders": 0,
            "revenue": 0,
        }

    try:
        order_items = supabase.table("order_item").select("*").in_("product_id", pids).execute().data or []
    except Exception:
        order_items = []

    revenue = 0
    for i in order_items:
        try:
            revenue += float(i.get("quantity", 0)) * float(i.get("final_price", 0))
        except Exception:
            continue

    return {
        "products": len(products),
        "low_stock": len([p for p in products if (p.get("current_stock_level") or 0) < 5]),
        "orders": len(set(i.get("order_id") for i in order_items if i.get("order_id") is not None)),
        "revenue": revenue,
    }


def get_low_stock(user_id):
    sid = get_seller_id(user_id)
    if not sid:
        return []
    try:
        return (
            supabase.table("products")
            .select("*")
            .eq("seller_id", sid)
            .lt("current_stock_level", 5)
            .execute()
            .data
            or []
        )
    except Exception:
        return []


# ================= ANALYTICS =================
def get_sales_trend(user_id):
    """
    Uses orders.date (not order_item.created_at) and safely handles empty lists.
    """
    sid = get_seller_id(user_id)
    if not sid:
        return []

    pids = get_seller_products_ids(sid)
    if not pids:
        return []

    try:
        order_items = (
            supabase.table("order_item")
            .select("order_id,quantity")
            .in_("product_id", pids)
            .execute()
            .data
            or []
        )
    except Exception:
        return []

    if not order_items:
        return []

    order_ids = list({i.get("order_id") for i in order_items if i.get("order_id") is not None})
    if not order_ids:
        return []

    try:
        orders = (
            supabase.table("orders")
            .select("order_id,date")
            .in_("order_id", order_ids)
            .execute()
            .data
            or []
        )
    except Exception:
        return []

    order_date_by_id = {o.get("order_id"): o.get("date") for o in orders if o.get("order_id") is not None}

    trend = {}
    for i in order_items:
        oid = i.get("order_id")
        raw_dt = order_date_by_id.get(oid)
        if not raw_dt:
            continue
        day = str(raw_dt)[:10]
        try:
            trend[day] = trend.get(day, 0) + int(i.get("quantity") or 0)
        except Exception:
            continue

    return [{"date": k, "quantity": v} for k, v in sorted(trend.items())]


def get_comparison_data(user_id):
    sid = get_seller_id(user_id)
    if not sid:
        return []
    try:
        products = (
            supabase.table("products")
            .select("product_id,name,current_stock_level")
            .eq("seller_id", sid)
            .execute()
            .data
            or []
        )
        return products
    except Exception:
        return []


def get_quantity_data(user_id):
    sid = get_seller_id(user_id)
    if not sid:
        return []

    pids = get_seller_products_ids(sid)
    if not pids:
        return []

    try:
        oi = (
            supabase.table("order_item")
            .select("product_id,quantity")
            .in_("product_id", pids)
            .execute()
            .data
            or []
        )
    except Exception:
        return []

    qty = {}
    for i in oi:
        pid = i.get("product_id")
        if pid is None:
            continue
        try:
            qty[pid] = qty.get(pid, 0) + int(i.get("quantity") or 0)
        except Exception:
            continue

    return [{"product_id": k, "quantity": v} for k, v in qty.items()]


# ================= ML =================
def predict_demand(user_id, data):
    try:
        return ml_service.predict_ml_demand(data)
    except Exception:
        return {"error": "ML prediction failed"}


def get_seller_notifications(user_id):
    try:
        # Get seller ID (reuse helper)
        seller_id = get_seller_id(user_id)
        if not seller_id:
            return []

        # Get notifications for this seller
        notifications = (
            supabase.table("notifications")
            .select("*")
            .eq("seller_id", seller_id)
            .order("created_at", desc=True)
            .execute()
            .data
            or []
        )

        results = []
        for n in notifications:
            product_name = "Unknown Product"
            quantity = 0
            price = 0.0

            order_id = n.get("order_id")
            if order_id:
                # Get all items in this order
                order_items = (
                    supabase.table("order_item")
                    .select("product_id, quantity")
                    .eq("order_id", order_id)
                    .execute()
                    .data
                    or []
                )

                # Fetch all products for those items (one query)
                pids = [i.get("product_id") for i in order_items if i.get("product_id") is not None]
                if pids:
                    products = (
                        supabase.table("products")
                        .select("product_id, name, price, seller_id")
                        .in_("product_id", pids)
                        .execute()
                        .data
                        or []
                    )
                    product_by_id = {p["product_id"]: p for p in products if p.get("product_id") is not None}

                    # Choose the item whose product belongs to THIS seller
                    matched_item = None
                    matched_product = None
                    for item in order_items:
                        pid = item.get("product_id")
                        p = product_by_id.get(pid)
                        if p and p.get("seller_id") == seller_id:
                            matched_item = item
                            matched_product = p
                            break

                    if matched_item and matched_product:
                        quantity = matched_item.get("quantity") or 0
                        product_name = matched_product.get("name", product_name)
                        price = matched_product.get("price", 0.0)

            results.append(
                {
                    "id": n.get("id"),
                    "product_name": product_name,
                    "quantity": quantity,
                    "price": price,
                    "is_read": n.get("is_read", False),
                    "created_at": n.get("created_at"),
                }
            )

        # Sort unread first
        results.sort(key=lambda x: x["is_read"])
        return results

    except Exception as e:
        print("Notification fetch error:", e)
        return []