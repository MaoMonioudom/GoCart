from supabase_client import supabase
from collections import defaultdict

def get_top_viewed_products(limit=10):
    logs = supabase.table("user_activities_logs")\
        .select("product_id")\
        .eq("action_type", "view")\
        .execute().data

    counter = defaultdict(int)

    for row in logs:
        counter[row["product_id"]] += 1

    ranked = sorted(counter.items(), key=lambda x: x[1], reverse=True)

    results = []

    for pid, views in ranked[:limit]:
        product = supabase.table("products")\
            .select("name")\
            .eq("product_id", pid)\
            .single()\
            .execute()

        results.append({
            "product": product.data["name"],
            "views": views
        })

    return results


def get_top_purchased_products(limit=10):
    items = supabase.table("order_item")\
        .select("product_id, quantity")\
        .execute().data

    counter = defaultdict(int)

    for row in items:
        counter[row["product_id"]] += row["quantity"]

    ranked = sorted(counter.items(), key=lambda x: x[1], reverse=True)

    results = []

    for pid, qty in ranked[:limit]:
        product = supabase.table("products")\
            .select("name")\
            .eq("product_id", pid)\
            .single()\
            .execute()

        results.append({
            "product": product.data["name"],
            "purchased": qty
        })

    return results


def get_purchase_frequency():
    orders = supabase.table("orders")\
        .select("user_id")\
        .execute().data

    users = set(o["user_id"] for o in orders)

    if not users:
        return {"averageOrdersPerUser": 0}

    avg = len(orders) / len(users)

    return {"averageOrdersPerUser": round(avg, 2)}


def get_conversion_rate():
    views = supabase.table("user_activities_logs")\
        .select("*")\
        .eq("action_type", "view")\
        .execute().data

    orders = supabase.table("orders")\
        .select("*")\
        .execute().data

    if not views:
        return {"conversionRate": 0}

    rate = len(orders) / len(views) * 100
    return {"conversionRate": round(rate, 2)}

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
            "month": month,
            "accuracy": round(avg_acc * 100, 1)
        })

    return result

def get_user_behavior():
    logs = supabase.table("user_activities_logs")\
        .select("action_type")\
        .execute().data

    counter = defaultdict(int)

    for row in logs:
        counter[row["action_type"]] += 1

    return {
        "views": counter["view"],
        "addToCart": counter["add_to_cart"],
        "purchase": counter["purchase"],
        "search": counter["search"],
    }
