from collections import defaultdict
from datetime import datetime, timezone
from math import ceil

from supabase_client import supabase
from services.promotion_utils import get_active_promotions_for_products


ACTION_WEIGHTS = {
	"pv": 1.0,
	"fav": 3.0,
	"cart": 5.0,
	"buy": 10.0,
}


ACTION_TYPE_TO_WEIGHT_KEY = {
	"pv": "pv",
	"preview": "pv",
	"view": "pv",
	"fav": "fav",
	"favourite": "fav",
	"favorite": "fav",
	"wishlist": "fav",
	"cart": "cart",
	"add_to_cart": "cart",
	"buy": "buy",
	"purchase": "buy",
	"purches": "buy",
}


def _normalize_weight_key(action_type):
	action = str(action_type or "").strip().lower()
	return ACTION_TYPE_TO_WEIGHT_KEY.get(action)


def _to_int(value, default=0):
	try:
		return int(value)
	except Exception:
		return default


def _to_float(value, default=0.0):
	try:
		return float(value)
	except Exception:
		return default


def _clamp(value, minimum, maximum):
	return max(minimum, min(value, maximum))


def _safe_div(num, den):
	if den == 0:
		return 0.0
	return num / den


def _now_utc():
	return datetime.now(timezone.utc)


def _parse_timestamp(value):
	if not value:
		return None
	try:
		# Parse the ISO format string, replacing Z with +00:00 for UTC
		dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
		# If the datetime is naive (no timezone), assume it's UTC
		if dt.tzinfo is None:
			dt = dt.replace(tzinfo=timezone.utc)
		return dt
	except Exception:
		return None


def _fetch_active_products():
	response = (
		supabase.table("products")
		.select("product_id, category_id, seller_id, name, description, price, status, current_stock_level, created_at")
		.eq("status", "active")
		.execute()
	)
	return response.data or []


def _fetch_product_images(product_ids):
	image_map = {}
	if not product_ids:
		return image_map

	response = (
		supabase.table("product_image")
		.select("product_id, image_url, is_main")
		.in_("product_id", product_ids)
		.execute()
	)

	for row in (response.data or []):
		pid = row.get("product_id")
		if pid is None:
			continue

		if pid not in image_map or row.get("is_main"):
			image_map[pid] = row.get("image_url")

	return image_map


def _fetch_category_names(category_ids):
	category_map = {}
	valid_ids = [cid for cid in category_ids if cid is not None]
	if not valid_ids:
		return category_map

	response = (
		supabase.table("categories")
		.select("category_id, category_name")
		.in_("category_id", valid_ids)
		.execute()
	)

	for row in (response.data or []):
		category_map[row.get("category_id")] = row.get("category_name")

	return category_map


def _fetch_user_order_items(user_id):
	orders_resp = (
		supabase.table("orders")
		.select("order_id")
		.eq("user_id", user_id)
		.execute()
	)
	order_ids = [row.get("order_id") for row in (orders_resp.data or []) if row.get("order_id") is not None]

	if not order_ids:
		return []

	order_items_resp = (
		supabase.table("order_item")
		.select("product_id, quantity")
		.in_("order_id", order_ids)
		.execute()
	)
	return order_items_resp.data or []


def _fetch_user_activity_logs(user_id):
	response = (
		supabase.table("user_activities_logs")
		.select("product_id, action_type")
		.eq("user_id", user_id)
		.execute()
	)
	return response.data or []


def _fetch_user_reviews(user_id):
	response = (
		supabase.table("review")
		.select("product_id, rating")
		.eq("user_id", user_id)
		.execute()
	)
	return response.data or []


def _fetch_global_popularity_scores(active_product_ids):
	popularity = defaultdict(float)
	rating_sum = defaultdict(float)
	rating_count = defaultdict(int)

	order_items_resp = (
		supabase.table("order_item")
		.select("product_id, quantity")
		.execute()
	)
	for row in (order_items_resp.data or []):
		pid = row.get("product_id")
		if pid not in active_product_ids:
			continue
		popularity[pid] += _to_float(row.get("quantity"), 0.0)

	reviews_resp = (
		supabase.table("review")
		.select("product_id, rating")
		.execute()
	)
	for row in (reviews_resp.data or []):
		pid = row.get("product_id")
		if pid not in active_product_ids:
			continue
		rating = _to_float(row.get("rating"), 0.0)
		rating_sum[pid] += rating
		rating_count[pid] += 1

	rating_norm = {}
	for pid in active_product_ids:
		if rating_count[pid] > 0:
			rating_norm[pid] = _clamp(rating_sum[pid] / (rating_count[pid] * 5.0), 0.0, 1.0)
		else:
			rating_norm[pid] = 0.0

	max_popularity = max(popularity.values(), default=0.0)
	popularity_norm = {
		pid: _safe_div(popularity.get(pid, 0.0), max_popularity) for pid in active_product_ids
	}

	return popularity_norm, rating_norm


def _freshness_score(created_at):
	created = _parse_timestamp(created_at)
	if not created:
		return 0.0

	age_days = (_now_utc() - created).days
	if age_days <= 7:
		return 1.0
	if age_days <= 30:
		return 0.7
	if age_days <= 90:
		return 0.4
	return 0.1


def _recommendation_reason(product, category_affinity, popularity_norm, has_personal_signals):
	pid = product.get("product_id")
	if has_personal_signals and category_affinity > 0.55:
		return "Matched to your preferred category"
	if popularity_norm.get(pid, 0.0) > 0.65:
		return "Trending among customers"
	if product.get("promotion"):
		return "Promotion currently available"
	return "Recommended for you"


def recommend_products_for_user(user_id, limit=10):
	"""
	Customer-first recommendation using purchase history + activity logs + ratings.
	Returns a list of product payloads sorted by recommendation score.
	"""
	try:
		user_id = _to_int(user_id, 0)
		limit = _clamp(_to_int(limit, 10), 1, 50)
		if user_id <= 0:
			print(f"Invalid user_id: {user_id}")
			return []

		products = _fetch_active_products()
		print(f"[Recommend] Fetched {len(products)} active products for user {user_id}")
		if not products:
			print(f"[Recommend] No active products found")
			return []

		# Keep only in-stock active products for recommendations.
		products = [
			p for p in products
			if _to_int(p.get("current_stock_level"), 0) > 0
		]
		print(f"[Recommend] Filtered to {len(products)} in-stock products")
		if not products:
			print(f"[Recommend] No in-stock products found")
			return []

		active_product_ids = {p.get("product_id") for p in products if p.get("product_id") is not None}
		images_map = _fetch_product_images(list(active_product_ids))
		category_map = _fetch_category_names({p.get("category_id") for p in products})
		promotions_map = get_active_promotions_for_products(list(active_product_ids))

		purchase_rows = _fetch_user_order_items(user_id)
		activity_rows = _fetch_user_activity_logs(user_id)
		review_rows = _fetch_user_reviews(user_id)

		product_signal = defaultdict(float)
		purchased_products = set()

		for row in purchase_rows:
			pid = row.get("product_id")
			if pid not in active_product_ids:
				continue
			qty = _to_float(row.get("quantity"), 0.0)
			product_signal[pid] += 3.0 * qty
			purchased_products.add(pid)

		for row in activity_rows:
			pid = row.get("product_id")
			if pid not in active_product_ids:
				continue
			action_key = _normalize_weight_key(row.get("action_type"))
			if not action_key:
				continue
			product_signal[pid] += ACTION_WEIGHTS.get(action_key, 0.0)

		for row in review_rows:
			pid = row.get("product_id")
			if pid not in active_product_ids:
				continue
			rating = _to_float(row.get("rating"), 0.0)
			product_signal[pid] += max(0.0, rating - 2.5) * 1.4

		has_personal_signals = len(product_signal) > 0

		# Build category affinity from observed user product signals.
		category_signal = defaultdict(float)
		product_by_id = {p.get("product_id"): p for p in products}
		for pid, weight in product_signal.items():
			category_id = (product_by_id.get(pid) or {}).get("category_id")
			if category_id is not None:
				category_signal[category_id] += weight

		max_cat = max(category_signal.values(), default=0.0)
		category_affinity_norm = {
			cid: _safe_div(score, max_cat) for cid, score in category_signal.items()
		}

		popularity_norm, rating_norm = _fetch_global_popularity_scores(active_product_ids)

		scored = []
		for product in products:
			pid = product.get("product_id")
			category_id = product.get("category_id")
			category_affinity = category_affinity_norm.get(category_id, 0.0)

			score = (
				0.52 * category_affinity
				+ 0.28 * popularity_norm.get(pid, 0.0)
				+ 0.12 * rating_norm.get(pid, 0.0)
				+ 0.08 * _freshness_score(product.get("created_at"))
			)

			# Prefer variety over repeatedly showing already purchased products.
			if pid in purchased_products:
				score *= 0.82

			if promotions_map.get(pid):
				score += 0.08

			enriched = dict(product)
			enriched["image"] = images_map.get(pid)
			enriched["category_name"] = category_map.get(category_id)
			enriched["stock_quantity"] = _to_int(product.get("current_stock_level"), 0)
			enriched["promotion"] = promotions_map.get(pid)
			enriched["recommendation_score"] = round(score, 4)
			enriched["recommendation_reason"] = _recommendation_reason(
				enriched,
				category_affinity,
				popularity_norm,
				has_personal_signals,
			)

			scored.append(enriched)

		# Cold-start users: rank by popularity + rating + freshness.
		if not has_personal_signals:
			print(f"[Recommend] Cold-start user (no personal signals), sorting by popularity")
			scored.sort(
				key=lambda p: (
					popularity_norm.get(p.get("product_id"), 0.0),
					rating_norm.get(p.get("product_id"), 0.0),
					_freshness_score(p.get("created_at")),
				),
				reverse=True,
			)
		else:
			print(f"[Recommend] Returning {len(scored)} personalized recommendations")
			scored.sort(key=lambda p: p.get("recommendation_score", 0.0), reverse=True)

		result = scored[:limit]
		print(f"[Recommend] Returning top {len(result)} recommendations")
		return result

	except Exception as error:
		print(f"Recommendation service error: {error}")
		return []


def predict_ml_demand(data):
	"""
	Lightweight demand prediction fallback.
	Uses historical order quantities and returns a practical recommended stock level.
	"""
	try:
		data = data or {}
		product_id = data.get("product_id")
		months = _clamp(_to_int(data.get("months", 3), 3), 1, 12)
		safety_buffer = _clamp(_to_float(data.get("safety_buffer", 0.2), 0.2), 0.0, 1.0)

		query = supabase.table("order_item").select("quantity")
		if product_id is not None:
			query = query.eq("product_id", product_id)
		rows = query.execute().data or []

		total_qty = sum(_to_int(row.get("quantity"), 0) for row in rows)
		avg_monthly_qty = _safe_div(total_qty, months)
		predicted_demand = ceil(avg_monthly_qty)
		recommended_stock = ceil(predicted_demand * (1.0 + safety_buffer))

		current_stock = _to_int(data.get("current_stock"), 0)
		replenish_qty = max(0, recommended_stock - current_stock)

		return {
			"product_id": product_id,
			"months_used": months,
			"total_quantity": total_qty,
			"predicted_demand": predicted_demand,
			"recommended_stock": recommended_stock,
			"current_stock": current_stock,
			"replenish_quantity": replenish_qty,
			"method": "heuristic_v1",
		}
	except Exception as error:
		print(f"Demand prediction error: {error}")
		return {"error": "Demand prediction failed"}
