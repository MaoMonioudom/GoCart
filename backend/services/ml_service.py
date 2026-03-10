from supabase_client import supabase
from collections import defaultdict


# ===============================
# MOST VIEWED PRODUCT (STAT CARD)
# ===============================
def get_most_viewed_product():
    logs = supabase.table("user_activities_logs") \
        .select("product_id") \
        .eq("action_type", "view") \
        .execute().data

    counter = defaultdict(int)

    for row in logs:
        counter[row["product_id"]] += 1

    if not counter:
        return {"product": "N/A", "views": 0}

    top_product_id = max(counter, key=counter.get)
    views = counter[top_product_id]

    product = supabase.table("products") \
        .select("name") \
        .eq("product_id", top_product_id) \
        .single() \
        .execute()

    return {
        "product": product.data["name"],
        "views": views
    }


# ===============================
# MOST PURCHASED PRODUCT (STAT CARD)
# ===============================
def get_most_purchased_product():
    items = supabase.table("order_item") \
        .select("product_id, quantity") \
        .execute().data

    counter = defaultdict(int)

    for row in items:
        counter[row["product_id"]] += row["quantity"]

    if not counter:
        return {"product": "N/A", "purchased": 0}

    top_product_id = max(counter, key=counter.get)
    purchased = counter[top_product_id]

    product = supabase.table("products") \
        .select("name") \
        .eq("product_id", top_product_id) \
        .single() \
        .execute()

    return {
        "product": product.data["name"],
        "purchased": purchased
    }


# ===============================
# PURCHASE FREQUENCY
# ===============================
def get_purchase_frequency():
    orders = supabase.table("orders") \
        .select("user_id") \
        .execute().data

    users = set(o["user_id"] for o in orders)

    if not users:
        return {"averageOrdersPerUser": 0}

    avg = len(orders) / len(users)

    return {"averageOrdersPerUser": round(avg, 2)}


# ===============================
# CONVERSION RATE
# ===============================
def get_conversion_rate():
    views = supabase.table("user_activities_logs") \
        .select("*") \
        .eq("action_type", "view") \
        .execute().data

    orders = supabase.table("orders") \
        .select("*") \
        .execute().data

    if not views:
        return {"conversionRate": 0}

    rate = len(orders) / len(views) * 100

    return {"conversionRate": round(rate, 2)}


# ===============================
# RECOMMENDATION ACCURACY (LINE CHART)
# ===============================
def get_recommendation_accuracy():
    rows = supabase.table("stock_prediction_hist") \
        .select("prediction_month, predicted_quantity, actual_quantity") \
        .execute().data

    monthly = {}

    for r in rows:
        month = r.get("prediction_month")
        predicted = r.get("predicted_quantity")
        actual = r.get("actual_quantity")

        if not month or not actual or actual == 0:
            continue

        error = abs(predicted - actual)
        acc = max(0, 1 - (error / actual))

        month_key = str(month)[:7]

        monthly.setdefault(month_key, []).append(acc)

    result = []

    for month, values in sorted(monthly.items()):
        avg_acc = sum(values) / len(values)

        result.append({
            "name": month,
            "value": round(avg_acc * 100, 1)
        })

    return result


# ===============================
# USER BEHAVIOR (BAR CHART)
# ===============================
def get_user_behavior():
    logs = supabase.table("user_activities_logs") \
        .select("action_type") \
        .execute().data

    counter = defaultdict(int)

    for row in logs:
        counter[row["action_type"]] += 1

    return [
        {"name": "Views", "value": counter["view"]},
        {"name": "Add To Cart", "value": counter["add_to_cart"]},
        {"name": "Purchase", "value": counter["purchase"]},
        {"name": "Search", "value": counter["search"]},
    ]