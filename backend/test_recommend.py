from collections import Counter

from services.ml_service import recommend_products_for_user
from supabase_client import supabase


def fetch_user_purchase_profile(user_id):
    order_rows = (
        supabase.table("orders")
        .select("order_id")
        .eq("user_id", user_id)
        .execute()
        .data
        or []
    )
    order_ids = [row.get("order_id") for row in order_rows if row.get("order_id") is not None]
    if not order_ids:
        return set(), Counter()

    items = (
        supabase.table("order_item")
        .select("product_id")
        .in_("order_id", order_ids)
        .execute()
        .data
        or []
    )
    product_ids = [row.get("product_id") for row in items if row.get("product_id") is not None]
    if not product_ids:
        return set(), Counter()

    products = (
        supabase.table("products")
        .select("product_id, category_id")
        .in_("product_id", list(set(product_ids)))
        .execute()
        .data
        or []
    )
    category_by_product = {row.get("product_id"): row.get("category_id") for row in products}

    category_counter = Counter()
    for pid in product_ids:
        category_counter[category_by_product.get(pid)] += 1

    return set(product_ids), category_counter


def evaluate_user(user_id, top_k=10):
    recs = recommend_products_for_user(user_id=user_id, limit=top_k)
    bought_products, bought_categories = fetch_user_purchase_profile(user_id)

    if not isinstance(recs, list):
        print(f"user {user_id}: recommender returned non-list payload")
        return

    if not recs:
        print(f"user {user_id}: no recommendations")
        return

    rec_ids = [row.get("product_id") for row in recs if row.get("product_id") is not None]
    rec_categories = [row.get("category_id") for row in recs]

    purchased_overlap = sum(1 for pid in rec_ids if pid in bought_products)
    category_match = sum(1 for cid in rec_categories if cid in bought_categories)
    unique_categories = len(set(rec_categories))

    novelty_at_k = 1.0 - (purchased_overlap / len(rec_ids))
    category_match_at_k = category_match / len(rec_ids)
    diversity_at_k = unique_categories / len(rec_ids)

    print("=" * 80)
    print(f"Recommendation quality check for user {user_id}")
    print(f"Top-K: {len(rec_ids)}")
    print(f"Novelty@K (higher is better): {novelty_at_k:.3f}")
    print(f"CategoryMatch@K (personal relevance proxy): {category_match_at_k:.3f}")
    print(f"Diversity@K (higher is better): {diversity_at_k:.3f}")

    if bought_categories:
        top_cats = bought_categories.most_common(3)
        print(f"Top historical categories: {top_cats}")

    print("Recommendations:")
    for idx, row in enumerate(recs, start=1):
        print(
            f"  {idx}. product_id={row.get('product_id')} "
            f"cat={row.get('category_id')} "
            f"score={row.get('recommendation_score')} "
            f"reason={row.get('recommendation_reason')}"
        )


if __name__ == "__main__":
    evaluate_user(user_id=1, top_k=10)
    evaluate_user(user_id=2, top_k=10)
