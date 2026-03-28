from collections import defaultdict
import calendar
import importlib
import os
import threading
from datetime import datetime, timezone
from math import ceil
from pathlib import Path
import pickle
import time
import zlib

from supabase_client import supabase
from services.promotion_utils import get_active_promotions_for_products

try:
	import pandas as pd
except Exception:
	pd = None

np = None
tf = None


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


FORECAST_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "forecasting_model" / "m5_sales_forecast_model.pkl"
_FORECAST_MODEL_BUNDLE = None
_FORECAST_MODEL_DISABLED = False
_FORECAST_MODEL_LOCK = threading.Lock()

RCM_MODEL_PATH = Path(os.getenv("RCM_MODEL_PATH", Path(__file__).resolve().parent.parent / "models" / "rcm_model"))
_RCM_MODEL_BUNDLE = None
_RCM_MODEL_DISABLED = False
_RCM_MODEL_LOCK = threading.Lock()


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


def _month_start(dt):
	return datetime(dt.year, dt.month, 1, tzinfo=timezone.utc)


def _add_month(dt, months=1):
	year = dt.year + (dt.month - 1 + months) // 12
	month = (dt.month - 1 + months) % 12 + 1
	return datetime(year, month, 1, tzinfo=timezone.utc)


def _month_key(dt):
	return f"{dt.year:04d}-{dt.month:02d}"


def _safe_round_int(value):
	return max(0, int(round(_to_float(value, 0.0))))


def _execute_with_retry(query, label, retries=2):
	last_error = None
	for attempt in range(retries + 1):
		try:
			return query.execute()
		except Exception as error:
			last_error = error
			if attempt < retries:
				wait_seconds = 0.2 * (attempt + 1)
				print(
					f"[SupabaseRetry] {label} failed on attempt {attempt + 1}/{retries + 1}: {error}. "
					f"Retrying in {wait_seconds:.1f}s"
				)
				time.sleep(wait_seconds)
			else:
				print(f"[SupabaseRetry] {label} failed after {retries + 1} attempts: {error}")

	raise last_error


def _rehydrate_booster_from_legacy_model(model):
	"""
	Rebuild a fresh LightGBM Booster when legacy pickles store model text in _handle.
	This avoids binary pointer incompatibilities across LightGBM versions.
	"""
	if model is None:
		return None

	legacy_booster = getattr(model, "_Booster", None) or getattr(model, "booster_", None)
	if legacy_booster is None:
		return None

	legacy_handle = getattr(legacy_booster, "_handle", None)
	if not isinstance(legacy_handle, str):
		return None

	try:
		lgb = importlib.import_module("lightgbm")
		fresh_booster = lgb.Booster(model_str=legacy_handle)
		model._Booster = fresh_booster
		# Prevent legacy object from trying to free invalid memory during cleanup.
		legacy_booster._handle = None
		print("[ForecastModel] Rehydrated legacy booster from serialized model text")
		return fresh_booster
	except Exception as error:
		print(f"[ForecastModel] Failed to rehydrate legacy booster: {error}")
		return None


def _load_forecast_model_bundle():
	global _FORECAST_MODEL_BUNDLE, _FORECAST_MODEL_DISABLED
	if _FORECAST_MODEL_DISABLED:
		return {}
	if _FORECAST_MODEL_BUNDLE is not None:
		return _FORECAST_MODEL_BUNDLE

	with _FORECAST_MODEL_LOCK:
		if _FORECAST_MODEL_DISABLED:
			return {}
		if _FORECAST_MODEL_BUNDLE is not None:
			return _FORECAST_MODEL_BUNDLE

		print(f"[ForecastModel] Attempting to load from: {FORECAST_MODEL_PATH}")
		print(f"[ForecastModel] Path exists: {FORECAST_MODEL_PATH.exists()}")
		
		if not FORECAST_MODEL_PATH.exists():
			print(f"[ForecastModel] Model file NOT FOUND at {FORECAST_MODEL_PATH}")
			_FORECAST_MODEL_BUNDLE = {}
			return _FORECAST_MODEL_BUNDLE

		try:
			joblib = None
			try:
				joblib = importlib.import_module("joblib")
			except Exception:
				joblib = None

			# Try loading with joblib first (more compatible with sklearn/lightgbm models)
			if joblib is not None:
				print(f"[ForecastModel] Attempting to load with joblib...")
				bundle = joblib.load(str(FORECAST_MODEL_PATH))
			else:
				print(f"[ForecastModel] Joblib not available, using pickle...")
				with open(FORECAST_MODEL_PATH, "rb") as fp:
					bundle = pickle.load(fp)
			
			if isinstance(bundle, dict) and bundle.get("model") is not None:
				bundle["rehydrated_booster"] = _rehydrate_booster_from_legacy_model(bundle.get("model"))
				_FORECAST_MODEL_BUNDLE = bundle
				print("[ForecastModel] Loaded saved forecasting model successfully")
			else:
				print("[ForecastModel] Unexpected model bundle shape")
				_FORECAST_MODEL_BUNDLE = {}
		except Exception as error:
			print(f"[ForecastModel] Failed to load saved model: {error}")
			print(f"[ForecastModel] Will use fallback heuristic for all predictions")
			_FORECAST_MODEL_BUNDLE = {}

	return _FORECAST_MODEL_BUNDLE


def _encode_state(city_province):
	text = str(city_province or "unknown").strip().lower()
	return int(zlib.crc32(text.encode("utf-8")) % 10000)


def _build_daily_product_series(product_ids):
	if not product_ids:
		return {}

	order_items = (
		_execute_with_retry(
			supabase.table("order_item")
			.select("order_id, product_id, quantity, unit_price, final_price, promo_id")
			.in_("product_id", product_ids),
			"_build_daily_product_series.order_item",
		)
		.data
		or []
	)

	order_ids = list({row.get("order_id") for row in order_items if row.get("order_id") is not None})
	if not order_ids:
		return {pid: {} for pid in product_ids}

	order_rows = (
		_execute_with_retry(
			supabase.table("orders")
			.select("order_id, date, status, address_id")
			.in_("order_id", order_ids),
			"_build_daily_product_series.orders",
		)
		.data
		or []
	)

	address_ids = list({row.get("address_id") for row in order_rows if row.get("address_id") is not None})
	address_rows = []
	if address_ids:
		address_rows = (
			_execute_with_retry(
				supabase.table("addresses")
				.select("address_id, city_province")
				.in_("address_id", address_ids),
				"_build_daily_product_series.addresses",
			)
			.data
			or []
		)

	order_by_id = {}
	for row in order_rows:
		if str(row.get("status") or "").lower() == "cancelled":
			continue
		order_by_id[row.get("order_id")] = row

	city_by_address = {r.get("address_id"): r.get("city_province") for r in address_rows}

	series = defaultdict(lambda: defaultdict(lambda: {
		"sales": 0.0,
		"prices": [],
		"promo_lines": 0,
		"lines": 0,
		"state_ids": [],
	}))

	for row in order_items:
		pid = row.get("product_id")
		order = order_by_id.get(row.get("order_id"))
		if pid is None or order is None:
			continue

		dt = _parse_timestamp(order.get("date"))
		if dt is None:
			continue

		day_key = dt.date().isoformat()
		bucket = series[pid][day_key]
		qty = max(0.0, _to_float(row.get("quantity"), 0.0))
		bucket["sales"] += qty
		bucket["lines"] += 1

		price_value = row.get("unit_price")
		if price_value is None:
			price_value = row.get("final_price")
		price_float = _to_float(price_value, None)
		if price_float is not None:
			bucket["prices"].append(price_float)

		if row.get("promo_id") is not None:
			bucket["promo_lines"] += 1

		state_encoded = _encode_state(city_by_address.get(order.get("address_id")))
		bucket["state_ids"].append(state_encoded)

	return series


def _mean_std(values):
	if not values:
		return 0.0, 0.0
	mean = sum(values) / len(values)
	var = sum((v - mean) ** 2 for v in values) / len(values)
	return mean, var ** 0.5


def _safe_get(history, idx_from_end):
	idx = len(history) - idx_from_end
	if idx < 0 or idx >= len(history):
		return 0.0
	return history[idx]


def _build_saved_model_feature_row(product, day_buckets, prediction_date, expected_promo):
	sorted_days = sorted(day_buckets.keys())
	history_sales = [
		_to_float(day_buckets[day]["sales"], 0.0)
		for day in sorted_days
	]

	if sorted_days:
		latest_bucket = day_buckets[sorted_days[-1]]
		latest_prices = latest_bucket.get("prices", [])
		latest_price = _mean(latest_prices) if latest_prices else _to_float(product.get("price"), 0.0)
		state_candidates = latest_bucket.get("state_ids", [])
		state_id = state_candidates[-1] if state_candidates else 0
	else:
		latest_price = _to_float(product.get("price"), 0.0)
		state_id = 0

	last7 = history_sales[-7:] if len(history_sales) >= 7 else history_sales
	last28 = history_sales[-28:] if len(history_sales) >= 28 else history_sales
	roll_mean_7, roll_std_7 = _mean_std(last7)
	roll_mean_28, roll_std_28 = _mean_std(last28)

	lag_1 = _safe_get(history_sales, 1)
	lag_7 = _safe_get(history_sales, 7)
	lag_14 = _safe_get(history_sales, 14)
	lag_28 = _safe_get(history_sales, 28)

	if len(sorted_days) >= 8:
		last_price_7d = _mean(day_buckets[sorted_days[-8]].get("prices", []) or [latest_price])
	else:
		last_price_7d = latest_price

	price_change_1w = latest_price - last_price_7d
	price_ratio_1w = _safe_div(latest_price, last_price_7d) if last_price_7d > 0 else 1.0
	max_hist_price = max([latest_price] + [
		_mean(day_buckets[day].get("prices", []) or [latest_price])
		for day in sorted_days
	])
	price_rel_max = _safe_div(latest_price, max_hist_price) if max_hist_price > 0 else 1.0

	has_event = 1 if expected_promo else 0
	snap = has_event

	wday = prediction_date.weekday() + 1

	return {
		"item_id": _to_int(product.get("product_id"), 0),
		"dept_id": _to_int(product.get("category_id"), 0),
		"cat_id": _to_int(product.get("category_id"), 0),
		"store_id": _to_int(product.get("seller_id"), 0),
		"state_id": _to_int(state_id, 0),
		"weekday": _to_int(wday, 0),
		"wday": _to_int(wday, 0),
		"month": _to_int(prediction_date.month, 0),
		"year": _to_int(prediction_date.year, 0),
		"lag_1": lag_1,
		"lag_7": lag_7,
		"lag_14": lag_14,
		"lag_28": lag_28,
		"roll_mean_7": roll_mean_7,
		"roll_std_7": roll_std_7,
		"roll_mean_28": roll_mean_28,
		"roll_std_28": roll_std_28,
		"sell_price": latest_price,
		"price_change_1w": price_change_1w,
		"price_ratio_1w": price_ratio_1w,
		"price_rel_max": price_rel_max,
		"snap": _to_int(snap, 0),
		"has_event_1": _to_int(has_event, 0),
		"has_event_2": _to_int(has_event, 0),
	}


def _predict_with_saved_model(products, expected_promo=False):
	global _FORECAST_MODEL_DISABLED
	if _FORECAST_MODEL_DISABLED:
		return None

	bundle = _load_forecast_model_bundle()
	if not bundle:
		print("[Prediction] Model bundle is empty, falling back to heuristic")
		return None

	model = bundle.get("model")
	rehydrated_booster = bundle.get("rehydrated_booster")
	feature_names = bundle.get("features") or []
	
	if model is None:
		print("[Prediction] Model object is None, falling back to heuristic")
		return None
	if not feature_names:
		print("[Prediction] No feature names in bundle, falling back to heuristic")
		return None
	if pd is None:
		print("[Prediction] Pandas not available, falling back to heuristic")
		return None

	product_ids = [p.get("product_id") for p in products if p.get("product_id") is not None]
	if not product_ids:
		return None

	daily_series = _build_daily_product_series(product_ids)
	now = _now_utc()
	next_month_first_day = _add_month(_month_start(now), 1)

	rows = []
	row_products = []
	for product in products:
		pid = product.get("product_id")
		day_buckets = daily_series.get(pid, {})
		feature_row = _build_saved_model_feature_row(product, day_buckets, next_month_first_day, expected_promo)
		rows.append({name: feature_row.get(name, 0) for name in feature_names})
		row_products.append(product)

	try:
		df = pd.DataFrame(rows, columns=feature_names)
		if rehydrated_booster is not None:
			daily_pred = rehydrated_booster.predict(df)
		else:
			daily_pred = model.predict(df)
		print(f"[Prediction] Model inference successful for {len(rows)} products")
	except Exception as error:
		print(f"[Prediction] Model inference FAILED: {error}")
		error_text = str(error).lower()
		if "access violation" in error_text or "booster" in error_text or "handle" in error_text:
			_FORECAST_MODEL_DISABLED = True
			print("[Prediction] Disabled saved model due to binary compatibility issue; using fallback for remaining requests")
		return None

	result_by_pid = {}
	for product, model_prediction, feature_row in zip(row_products, daily_pred, rows):
		pid = product.get("product_id")
		monthly_pred = _safe_round_int(max(0.0, _to_float(model_prediction, 0.0)))
		result_by_pid[pid] = {
			"predicted_demand": monthly_pred,
			"features": {
				"model_features": feature_row,
				"inference_mode": "saved_model_monthly_direct",
			},
		}

	return result_by_pid


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


def _load_rcm_model_bundle():
	global _RCM_MODEL_BUNDLE, _RCM_MODEL_DISABLED
	global np, tf
	if _RCM_MODEL_DISABLED:
		return {}
	if _RCM_MODEL_BUNDLE is not None:
		return _RCM_MODEL_BUNDLE

	with _RCM_MODEL_LOCK:
		if _RCM_MODEL_DISABLED:
			return {}
		if _RCM_MODEL_BUNDLE is not None:
			return _RCM_MODEL_BUNDLE

		if np is None:
			try:
				np = importlib.import_module("numpy")
			except Exception:
				np = None

		if tf is None:
			try:
				tf = importlib.import_module("tensorflow")
			except Exception:
				tf = None

		if tf is None or np is None:
			print("[RCM] TensorFlow or NumPy not available; falling back to heuristic recommender")
			_RCM_MODEL_BUNDLE = {}
			return _RCM_MODEL_BUNDLE

		if not RCM_MODEL_PATH.exists():
			print(f"[RCM] Model path not found: {RCM_MODEL_PATH}")
			_RCM_MODEL_BUNDLE = {}
			return _RCM_MODEL_BUNDLE

		try:
			loaded = tf.saved_model.load(str(RCM_MODEL_PATH))
			serving_fn = loaded.signatures.get("serving_default")
			if serving_fn is None:
				print("[RCM] Missing serving_default signature; falling back to heuristic recommender")
				_RCM_MODEL_BUNDLE = {}
				return _RCM_MODEL_BUNDLE

			_, input_spec = serving_fn.structured_input_signature
			input_name = next(iter(input_spec.keys()), None)
			output_key = next(iter(serving_fn.structured_outputs.keys()), None)

			_RCM_MODEL_BUNDLE = {
				"serving_fn": serving_fn,
				"input_name": input_name,
				"input_spec": input_spec,
				"output_key": output_key,
			}
			print(f"[RCM] Loaded recommendation model from: {RCM_MODEL_PATH}")
			return _RCM_MODEL_BUNDLE
		except Exception as error:
			print(f"[RCM] Failed to load recommendation model: {error}")
			_RCM_MODEL_BUNDLE = {}
			return _RCM_MODEL_BUNDLE


def _normalize_rcm_scores(raw_scores):
	if not raw_scores:
		return []

	if all(0.0 <= score <= 1.0 for score in raw_scores):
		return [_clamp(_to_float(score, 0.0), 0.0, 1.0) for score in raw_scores]

	min_score = min(raw_scores)
	max_score = max(raw_scores)
	if abs(max_score - min_score) < 1e-9:
		return [0.5 for _ in raw_scores]

	return [
		_clamp(_safe_div(score - min_score, max_score - min_score), 0.0, 1.0)
		for score in raw_scores
	]


def _coerce_values_for_tensor(values, tensor_spec):
	dtype_name = str(getattr(tensor_spec, "dtype", ""))
	if "string" in dtype_name:
		return [str(v or "") for v in values]
	if "int" in dtype_name or "uint" in dtype_name:
		return [_to_int(v, 0) for v in values]
	return [_to_float(v, 0.0) for v in values]


def _predict_with_rcm_model(user_id, product_ids, feature_rows):
	bundle = _load_rcm_model_bundle()
	if not bundle:
		return []

	serving_fn = bundle.get("serving_fn")
	input_name = bundle.get("input_name")
	input_spec = bundle.get("input_spec") or {}
	output_key = bundle.get("output_key")
	if serving_fn is None:
		return []

	try:
		if "user_id" in input_spec and "item_id" in input_spec:
			user_values = [user_id for _ in product_ids]
			item_values = product_ids
			user_tensor = tf.convert_to_tensor(
				_coerce_values_for_tensor(user_values, input_spec.get("user_id")),
				dtype=input_spec.get("user_id").dtype,
			)
			item_tensor = tf.convert_to_tensor(
				_coerce_values_for_tensor(item_values, input_spec.get("item_id")),
				dtype=input_spec.get("item_id").dtype,
			)
			outputs = serving_fn(user_id=user_tensor, item_id=item_tensor)
		elif input_name and input_spec.get(input_name) is not None:
			spec = input_spec.get(input_name)
			dtype_name = str(getattr(spec, "dtype", ""))
			if "string" in dtype_name:
				input_values = [str(pid or "") for pid in product_ids]
				input_tensor = tf.convert_to_tensor(input_values, dtype=spec.dtype)
			elif "int" in dtype_name or "uint" in dtype_name:
				input_values = [_to_int(pid, 0) for pid in product_ids]
				input_tensor = tf.convert_to_tensor(input_values, dtype=spec.dtype)
			else:
				input_tensor = tf.convert_to_tensor(np.asarray(feature_rows, dtype=np.float32), dtype=spec.dtype)
			outputs = serving_fn(**{input_name: input_tensor})
		else:
			features_tensor = tf.convert_to_tensor(np.asarray(feature_rows, dtype=np.float32))
			outputs = serving_fn(features_tensor)

		if isinstance(outputs, dict):
			output_tensor = outputs.get(output_key)
			if output_tensor is None and outputs:
				output_tensor = next(iter(outputs.values()))
		else:
			output_tensor = outputs

		if output_tensor is None:
			print("[RCM] No output tensor returned by model")
			return []

		raw_scores = [float(x) for x in np.asarray(output_tensor.numpy()).reshape(-1)]
		if len(raw_scores) != len(feature_rows):
			print(f"[RCM] Output row mismatch: got {len(raw_scores)} scores for {len(feature_rows)} rows")
			return []

		return _normalize_rcm_scores(raw_scores)
	except Exception as error:
		print(f"[RCM] Inference failed, using heuristic recommender: {error}")
		return []


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

		max_stock_level = max((_to_float(p.get("current_stock_level"), 0.0) for p in products), default=0.0)
		max_price = max((_to_float(p.get("price"), 0.0) for p in products), default=0.0)
		max_signal = max(product_signal.values(), default=0.0)

		rcm_feature_rows = []
		rcm_product_ids = []
		for product in products:
			pid = product.get("product_id")
			category_id = product.get("category_id")
			rcm_feature_rows.append([
				_safe_div(_to_float(product_signal.get(pid, 0.0), 0.0), max_signal),
				category_affinity_norm.get(category_id, 0.0),
				popularity_norm.get(pid, 0.0),
				rating_norm.get(pid, 0.0),
				_freshness_score(product.get("created_at")),
				1.0 if promotions_map.get(pid) else 0.0,
				1.0 if pid in purchased_products else 0.0,
				_safe_div(_to_float(product.get("current_stock_level"), 0.0), max_stock_level),
				_safe_div(_to_float(product.get("price"), 0.0), max_price),
				1.0 if has_personal_signals else 0.0,
			])
			rcm_product_ids.append(pid)

		rcm_scores = _predict_with_rcm_model(user_id, rcm_product_ids, rcm_feature_rows)
		rcm_score_by_product_id = {
			pid: score for pid, score in zip(rcm_product_ids, rcm_scores)
		}
		if rcm_score_by_product_id:
			print(f"[Recommend] RCM model scored {len(rcm_score_by_product_id)} products")

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

			model_score = rcm_score_by_product_id.get(pid)
			if model_score is not None:
				score = 0.35 * score + 0.65 * model_score

			enriched = dict(product)
			enriched["image"] = images_map.get(pid)
			enriched["category_name"] = category_map.get(category_id)
			enriched["stock_quantity"] = _to_int(product.get("current_stock_level"), 0)
			enriched["promotion"] = promotions_map.get(pid)
			enriched["recommendation_score"] = round(score, 4)
			enriched["recommendation_model_score"] = round(_to_float(model_score, 0.0), 4) if model_score is not None else None
			enriched["recommendation_method"] = "rcm_saved_model_blend" if model_score is not None else "heuristic_v2"
			enriched["recommendation_reason"] = _recommendation_reason(
				enriched,
				category_affinity,
				popularity_norm,
				has_personal_signals,
			)

			scored.append(enriched)

		# Cold-start users: use popularity sort only when model score is unavailable.
		if not has_personal_signals and not rcm_score_by_product_id:
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


def _get_seller_id_from_user(user_id):
	response = (
		_execute_with_retry(
			supabase.table("seller")
			.select("seller_id")
			.eq("user_id", user_id)
			.limit(1),
			"_get_seller_id_from_user",
		)
	)
	rows = response.data or []
	if not rows:
		return None
	return rows[0].get("seller_id")


def _fetch_seller_products(seller_id, product_id=None):
	query = (
		supabase.table("products")
		.select("product_id, seller_id, category_id, name, current_stock_level, price, created_at")
		.eq("seller_id", seller_id)
	)
	if product_id is not None:
		query = query.eq("product_id", product_id)
	return _execute_with_retry(query, "_fetch_seller_products").data or []


def _fetch_order_dates(order_ids):
	if not order_ids:
		return {}
	rows = (
		_execute_with_retry(
			supabase.table("orders")
			.select("order_id, date, status")
			.in_("order_id", order_ids),
			"_fetch_order_dates",
		)
		.data
		or []
	)
	date_by_order_id = {}
	for row in rows:
		if str(row.get("status") or "").lower() == "cancelled":
			continue
		date_by_order_id[row.get("order_id")] = _parse_timestamp(row.get("date"))
	return date_by_order_id


def _build_monthly_sales_series(product_ids):
	if not product_ids:
		return {}, {}

	order_items = (
		_execute_with_retry(
			supabase.table("order_item")
			.select("order_id, product_id, quantity, unit_price, final_price, promo_id")
			.in_("product_id", product_ids),
			"_build_monthly_sales_series.order_item",
		)
		.data
		or []
	)

	order_ids = list({row.get("order_id") for row in order_items if row.get("order_id") is not None})
	date_by_order_id = _fetch_order_dates(order_ids)

	qty_by_product_month = defaultdict(lambda: defaultdict(int))
	price_by_product_month = defaultdict(lambda: defaultdict(list))
	promo_count_by_product_month = defaultdict(lambda: defaultdict(int))
	line_count_by_product_month = defaultdict(lambda: defaultdict(int))

	for row in order_items:
		pid = row.get("product_id")
		order_id = row.get("order_id")
		dt = date_by_order_id.get(order_id)
		if pid is None or dt is None:
			continue

		month_dt = _month_start(dt)
		month = _month_key(month_dt)
		qty = _to_int(row.get("quantity"), 0)

		qty_by_product_month[pid][month] += max(0, qty)
		line_count_by_product_month[pid][month] += 1

		price_value = row.get("unit_price")
		if price_value is None:
			price_value = row.get("final_price")
		price_float = _to_float(price_value, None)
		if price_float is not None:
			price_by_product_month[pid][month].append(price_float)

		if row.get("promo_id") is not None:
			promo_count_by_product_month[pid][month] += 1

	series_payload = {}
	for pid in product_ids:
		month_qty = qty_by_product_month.get(pid, {})
		months = sorted(month_qty.keys())
		series_payload[pid] = {
			"months": months,
			"quantity": month_qty,
			"prices": price_by_product_month.get(pid, {}),
			"promo_count": promo_count_by_product_month.get(pid, {}),
			"line_count": line_count_by_product_month.get(pid, {}),
		}

	return series_payload, date_by_order_id


def _mean(values):
	if not values:
		return 0.0
	return sum(values) / len(values)


def _forecast_next_month_from_series(series, expected_promo=False):
	months = series.get("months", [])
	if not months:
		baseline = 0.0
		recent_avg_3 = 0.0
		seasonal_avg_12 = 0.0
		trend = 0.0
		price_change_mom = 0.0
		promo_share_last_3 = 0.0
	else:
		qty_map = series.get("quantity", {})
		last_vals = [
			_to_float(qty_map.get(month), 0.0)
			for month in months
		]

		last1 = last_vals[-1] if len(last_vals) >= 1 else 0.0
		last2 = last_vals[-2] if len(last_vals) >= 2 else last1
		last3 = last_vals[-3] if len(last_vals) >= 3 else last2

		recent_window = last_vals[-3:] if len(last_vals) >= 3 else last_vals
		seasonal_window = last_vals[-12:] if len(last_vals) >= 12 else last_vals

		recent_avg_3 = _mean(recent_window)
		seasonal_avg_12 = _mean(seasonal_window)
		trend = last1 - last2

		# Blend recency + seasonality + short trend for next-month forecast.
		baseline = (
			0.60 * recent_avg_3
			+ 0.30 * seasonal_avg_12
			+ 0.10 * max(0.0, last1 + 0.5 * trend)
		)

		prices = series.get("prices", {})
		last_month_price_avg = _mean(prices.get(months[-1], [])) if months else 0.0
		prev_month_price_avg = _mean(prices.get(months[-2], [])) if len(months) >= 2 else last_month_price_avg
		price_change_mom = 0.0
		if prev_month_price_avg > 0:
			price_change_mom = (last_month_price_avg - prev_month_price_avg) / prev_month_price_avg

		# Light price elasticity penalty/boost to avoid overreacting.
		price_factor = _clamp(1.0 - (0.25 * price_change_mom), 0.80, 1.20)
		baseline *= price_factor

		promo_count = series.get("promo_count", {})
		line_count = series.get("line_count", {})
		promo_shares = []
		for month in months[-3:]:
			lines = _to_float(line_count.get(month), 0.0)
			promo_lines = _to_float(promo_count.get(month), 0.0)
			promo_shares.append(_safe_div(promo_lines, lines))
		promo_share_last_3 = _mean(promo_shares)

	# If seller expects promo next month, apply a modest uplift learned from history.
	if expected_promo:
		promo_uplift = _clamp(1.05 + (0.15 * promo_share_last_3), 1.05, 1.20)
		baseline *= promo_uplift

	predicted = _safe_round_int(baseline)
	return {
		"predicted_demand": predicted,
		"features": {
			"recent_avg_3m": round(recent_avg_3, 3),
			"seasonal_avg_12m": round(seasonal_avg_12, 3),
			"trend_1m": round(trend, 3),
			"price_change_mom": round(price_change_mom, 4),
			"promo_share_last_3m": round(promo_share_last_3, 4),
		},
	}


def predict_ml_demand(user_id, data):
	"""
	Seller-scoped monthly demand prediction (next month) built from existing schema.
	No DB schema changes required.
	"""
	try:
		user_id = _to_int(user_id, 0)
		data = data or {}
		product_id = data.get("product_id")
		if product_id is not None:
			product_id = _to_int(product_id, 0)
			if product_id <= 0:
				return {"error": "Invalid product_id"}

		seller_id = _get_seller_id_from_user(user_id)
		if not seller_id:
			return {"error": "Seller not found"}

		expected_promo = bool(data.get("expected_promo", False))
		safety_buffer = _clamp(_to_float(data.get("safety_buffer", 0.2), 0.2), 0.0, 1.0)

		products = _fetch_seller_products(seller_id, product_id=product_id)
		if not products:
			return {
				"predictions": [],
				"method": "seller_monthly_v2",
				"message": "No products found for seller",
			}

		product_ids = [p.get("product_id") for p in products if p.get("product_id") is not None]
		series_by_product, _ = _build_monthly_sales_series(product_ids)
		model_predictions = _predict_with_saved_model(products, expected_promo=expected_promo)

		now_month = _month_start(_now_utc())
		next_month = _add_month(now_month, 1)
		prediction_month = _month_key(next_month)

		predictions = []
		for product in products:
			pid = product.get("product_id")
			series = series_by_product.get(pid, {})
			history_months_count = len(series.get("months", []))
			series_signal_features = _forecast_next_month_from_series(series, expected_promo=expected_promo).get("features", {})

			if model_predictions and model_predictions.get(pid):
				forecast = model_predictions.get(pid)
				model_features = forecast.get("features", {}) if isinstance(forecast.get("features"), dict) else {}
				forecast = {
					**forecast,
					"features": {
						**series_signal_features,
						**model_features,
					},
				}
				prediction_method = "saved_model_lightgbm_v1"
				print(f"[Prediction] Product {pid} ({product.get('name')}): Using LIGHTGBM MODEL")
			else:
				forecast = _forecast_next_month_from_series(series, expected_promo=expected_promo)
				prediction_method = "seller_monthly_v2"
				print(f"[Prediction] Product {pid} ({product.get('name')}): Using FALLBACK HEURISTIC")

			predicted_demand = forecast.get("predicted_demand", 0)
			recommended_stock = ceil(predicted_demand * (1.0 + safety_buffer))
			current_stock = _to_int(product.get("current_stock_level"), 0)
			replenish_qty = max(0, recommended_stock - current_stock)

			predictions.append({
				"product_id": pid,
				"product_name": product.get("name"),
				"prediction_month": prediction_month,
				"predicted_demand": predicted_demand,
				"recommended_stock": recommended_stock,
				"current_stock": current_stock,
				"replenish_quantity": replenish_qty,
				"expected_promo": expected_promo,
				"history_months_count": history_months_count,
				"features": forecast.get("features", {}),
				"prediction_method": prediction_method,
			})

		predictions.sort(key=lambda x: x.get("replenish_quantity", 0), reverse=True)

		if product_id is not None:
			return {
				**predictions[0],
				"method": "seller_monthly_v2",
			}

		return {
			"prediction_month": prediction_month,
			"predictions": predictions,
			"total_products": len(predictions),
			"method": "seller_monthly_v2",
		}
	except Exception as error:
		print(f"Demand prediction error: {error}")
		return {"error": "Demand prediction failed"}
