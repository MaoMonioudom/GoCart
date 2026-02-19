from supabase_client import supabase
from datetime import datetime, timedelta
from collections import defaultdict

COMMISSION_RATE = 0.1
# ===============================
# GET ALL SELLERS
# ===============================
def get_all_sellers():
    sellers = supabase.table("seller")\
        .select("seller_id, shop_name, status, verified, user_id")\
        .execute().data

    sales_map = get_seller_sales()
    commission_map = get_seller_commission()

    result = []

    for s in sellers:
        user = supabase.table("users")\
            .select("first_name, last_name, email")\
            .eq("user_id", s["user_id"])\
            .single()\
            .execute()

        seller_id = s["seller_id"]

        result.append({
            "sellerId": seller_id,
            "sellerName": f"{user.data.get('first_name','')} {user.data.get('last_name','')}".strip(),
            "store": s["shop_name"],
            "email": user.data.get("email"),
            "status": s.get("status", "Inactive"),
            "verified": s.get("verified", False),
            "totalSale": sales_map.get(seller_id, 0),
            "commission": commission_map.get(seller_id, 0)
        })

    return result

# ===============================
# SELLER SALES & COMMISSION
# ===============================
def get_seller_sales():
    items = supabase.table("order_item")\
        .select("product_id, quantity, final_price")\
        .execute().data

    sales_map = defaultdict(float)

    for item in items:
        product = supabase.table("products")\
            .select("seller_id")\
            .eq("product_id", item["product_id"])\
            .single()\
            .execute()

        if not product.data:
            continue

        seller_id = product.data["seller_id"]
        total = (item["quantity"] or 0) * (item["final_price"] or 0)
        sales_map[seller_id] += total

    return sales_map


def get_seller_commission():
    sales = get_seller_sales()
    return {sid: total * COMMISSION_RATE for sid, total in sales.items()}

def get_monthly_commission(target_month):
    items = supabase.table("order_item")\
        .select("quantity, final_price, orders(date)")\
        .execute().data

    total_commission = 0

    for item in items:
        order = item.get("orders")
        if not order:
            continue

        order_date = order["date"]

        if order_date.startswith(target_month):
            total = (item["quantity"] or 0) * (item["final_price"] or 0)
            total_commission += total * 0.1

    return total_commission
# ===============================
# SELLER DASHBOARD
# ===============================
def calculate_growth(current, previous):
    if previous == 0:
        return 0
    return round((current - previous) / previous * 100, 1)
def get_seller_dashboard_stats():
    sellers = supabase.table("seller")\
        .select("status, created_at")\
        .execute().data

    now = datetime.utcnow()
    current_month = now.strftime("%Y-%m")
    last_month = (now.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

    total = len(sellers)

    active = inactive = suspended = 0
    current_new = previous_new = 0

    for s in sellers:
        status = (s.get("status") or "").strip().lower()

        if status == "active":
            active += 1
        elif status == "inactive":
            inactive += 1
        elif status == "suspended":
            suspended += 1

        created = s.get("created_at", "")

        if created.startswith(current_month):
            current_new += 1
        elif created.startswith(last_month):
            previous_new += 1

    # Seller growth
    growth_sellers = calculate_growth(current_new, previous_new)

    # ============================
    # REAL COMMISSION CALCULATION
    # ============================
    commission_current = get_monthly_commission(current_month)
    commission_previous = get_monthly_commission(last_month)

    growth_commission = calculate_growth(
        commission_current,
        commission_previous
    )

    return {
        "totalSellers": total,
        "activeSellers": active,
        "inactiveSellers": inactive,
        "suspendedSellers": suspended,
        "totalCommission": commission_current,
        "growth": {
            "sellers": growth_sellers,
            "commission": growth_commission
        }
    }


# ===============================
# COMMISSION TREND
# ===============================
def get_commission_trend(group="month"):
    data = supabase.table("order_item")\
        .select("quantity, final_price, orders(date)")\
        .execute().data

    from collections import defaultdict

    trend = defaultdict(float)

    for item in data:
        order = item.get("orders")
        if not order:
            continue

        date = order["date"]

        if group == "year":
            key = date[:4]   # YYYY
        else:
            key = date[:7]   # YYYY-MM

        total = (item["quantity"] or 0) * (item["final_price"] or 0)
        commission = total * 0.1

        trend[key] += commission

    return [{"name": k, "value": v} for k, v in sorted(trend.items())]

# ===============================
# COMMISSION BY CATEGORY
# ===============================
def get_commission_by_category(group="month"):
    items = supabase.table("order_item")\
        .select("quantity, final_price, product_id, orders(date)")\
        .execute().data

    from collections import defaultdict

    result = defaultdict(float)

    for item in items:
        order = item.get("orders")
        if not order:
            continue

        date = order["date"]

        if group == "year":
            key = date[:4]
        else:
            key = date[:7]

        product = supabase.table("products")\
            .select("category_id")\
            .eq("product_id", item["product_id"])\
            .single()\
            .execute()

        if not product.data:
            continue

        category_id = product.data["category_id"]

        category = supabase.table("categories")\
            .select("category_name")\
            .eq("category_id", category_id)\
            .single()\
            .execute()

        cat_name = category.data["category_name"]

        total = (item["quantity"] or 0) * (item["final_price"] or 0)
        commission = total * 0.1

        result[cat_name] += commission

    return [{"name": k, "value": v} for k, v in result.items()]


# ===============================
# SELLER REGISTRATION TREND
# ===============================
def get_seller_registration_trend():
    sellers = supabase.table("seller")\
        .select("created_at")\
        .execute().data

    trend = defaultdict(int)

    for s in sellers:
        if s.get("created_at"):
            trend[s["created_at"][:7]] += 1

    return [{"name": k, "value": v} for k, v in sorted(trend.items())]


# ===============================
# SELLER STATUS OVERVIEW
# ===============================
def get_seller_status_overview():
    sellers = supabase.table("seller")\
        .select("status")\
        .execute().data

    counts = defaultdict(int)

    for s in sellers:
        counts[s.get("status", "Inactive")] += 1

    return [{"name": k, "value": v} for k, v in counts.items()]


# ===============================
# TOP SELLERS TABLE
# ===============================
def get_top_sellers(limit=10):
    sellers = supabase.table("seller")\
        .select("seller_id, shop_name, status, user_id")\
        .execute().data

    sales = get_seller_sales()
    commissions = get_seller_commission()

    result = []

    for s in sellers:
        user = supabase.table("users")\
            .select("first_name, last_name")\
            .eq("user_id", s["user_id"])\
            .single()\
            .execute()

        result.append({
            "sellerName": f"{user.data.get('first_name','')} {user.data.get('last_name','')}".strip(),
            "store": s["shop_name"],
            "status": s["status"],
            "totalSale": sales.get(s["seller_id"], 0),
            "commission": commissions.get(s["seller_id"], 0),
        })

    result.sort(key=lambda x: x["totalSale"], reverse=True)
    return result[:limit]

def get_seller_detail(seller_id):
    seller = supabase.table("seller")\
        .select("*")\
        .eq("seller_id", seller_id)\
        .single()\
        .execute()

    if not seller.data:
        return {}

    user = supabase.table("users")\
        .select("first_name, last_name, email")\
        .eq("user_id", seller.data["user_id"])\
        .single()\
        .execute()

    sales = get_seller_sales()
    commissions = get_seller_commission()

    sid = seller.data["seller_id"]

    return {
        "sellerId": sid,
        "sellerName": f"{user.data.get('first_name','')} {user.data.get('last_name','')}".strip(),
        "store": seller.data["shop_name"],
        "status": seller.data.get("status"),
        "totalSales": sales.get(sid, 0),
        "commissionEarned": commissions.get(sid, 0)
    }

def update_seller(seller_id, data):
    allowed = {"status", "shop_name", "verified"}

    update_data = {k: v for k, v in data.items() if k in allowed}

    res = supabase.table("seller")\
        .update(update_data)\
        .eq("seller_id", seller_id)\
        .execute()

    return res.data

def delete_seller(seller_id):
    supabase.table("seller")\
        .delete()\
        .eq("seller_id", seller_id)\
        .execute()

    return {"message": "Seller removed"}


# ===============================
# CUSTOMER DASHBOARD
# ===============================
def get_customer_stats():
    users = supabase.table("users")\
        .select("user_id, created_at")\
        .eq("role", "customer")\
        .execute().data

    now = datetime.utcnow()
    current_month = now.strftime("%Y-%m")
    last_month = (now.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")

    total_customers = len(users)

    new_current = 0
    new_previous = 0

    for u in users:
        created = u.get("created_at", "")

        if created.startswith(current_month):
            new_current += 1
        elif created.startswith(last_month):
            new_previous += 1

    # ==========================
    # VISITOR COUNT
    # ==========================
    logs = supabase.table("user_activities_logs")\
        .select("user_id, date")\
        .execute().data

    visitors_current = set()
    visitors_previous = set()

    for log in logs:
        date = log.get("date", "")
        uid = log.get("user_id")

        if not uid:
            continue

        if date.startswith(current_month):
            visitors_current.add(uid)
        elif date.startswith(last_month):
            visitors_previous.add(uid)

    growth_customers = calculate_growth(new_current, new_previous)
    growth_visitors = calculate_growth(
        len(visitors_current),
        len(visitors_previous)
    )

    return {
        "totalCustomers": total_customers,
        "newCustomers": new_current,
        "visitors": len(visitors_current),
        "growth": {
            "customers": growth_customers,
            "visitors": growth_visitors
        }
    }


# ===============================
# CUSTOMER OVERVIEW CHART
# ===============================
def get_customer_overview(range_type="this_week"):
    logs = supabase.table("user_activities_logs")\
        .select("date")\
        .execute().data

    today = datetime.utcnow()

    # Monday = start of week
    start_this_week = today - timedelta(days=today.weekday())
    start_this_week = start_this_week.replace(hour=0, minute=0, second=0, microsecond=0)

    if range_type == "last_week":
        start = start_this_week - timedelta(days=7)
        end = start_this_week
    else:
        start = start_this_week
        end = start + timedelta(days=7)

    days = defaultdict(int)

    for log in logs:
        if not log.get("date"):
            continue

        dt = datetime.fromisoformat(log["date"])

        if start <= dt < end:
            weekday = dt.strftime("%a")
            days[weekday] += 1

    ordered = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    return [{"name": d, "value": days.get(d, 0)} for d in ordered]


# ===============================
# CUSTOMER TABLE
# ===============================
def get_all_customers(page=1, limit=10):
    start = (page - 1) * limit
    end = start + limit - 1

    users = supabase.table("users")\
        .select("*", count="exact")\
        .eq("role", "customer")\
        .range(start, end)\
        .execute()

    customers = []

    for u in users.data:
        orders = supabase.table("orders")\
            .select("total_amount")\
            .eq("user_id", u["user_id"])\
            .execute().data

        customers.append({
            "customerId": u["user_id"],
            "name": f'{u.get("first_name","")} {u.get("last_name","")}'.strip(),
            "email": u.get("email"),
            "phone": u.get("phone_number"),
            "orderCount": len(orders),
            "totalSpend": sum(o["total_amount"] or 0 for o in orders),
            "status": "Active" if orders else "Inactive"
        })

    total = users.count or 0

    return {
        "data": customers,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }

def get_customer_detail(user_id):
    user = supabase.table("users")\
        .select("*")\
        .eq("user_id", user_id)\
        .eq("role", "customer")\
        .single()\
        .execute()

    if not user.data:
        return {}

    orders = supabase.table("orders")\
        .select("total_amount")\
        .eq("user_id", user_id)\
        .execute().data

    return {
        "customerId": user_id,
        "name": f'{user.data.get("first_name","")} {user.data.get("last_name","")}'.strip(),
        "email": user.data.get("email"),
        "phone": user.data.get("phone_number"),
        "orderCount": len(orders),
        "totalSpend": sum(o["total_amount"] or 0 for o in orders)
    }

def update_customer(user_id, data):
    allowed = {"first_name", "last_name", "phone_number", "email"}

    update_data = {k: v for k, v in data.items() if k in allowed}

    res = supabase.table("users")\
        .update(update_data)\
        .eq("user_id", user_id)\
        .eq("role", "customer")\
        .execute()

    return res.data

def delete_customer(user_id):
    supabase.table("users")\
        .delete()\
        .eq("user_id", user_id)\
        .eq("role", "customer")\
        .execute()

    return {"message": "Customer deleted"}

