from datetime import date, datetime
from typing import Dict, Iterable, List, Optional

from supabase_client import supabase


def _to_date(value):
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return datetime.strptime(str(value), "%Y-%m-%d").date()


def get_promotion_status(promotion: dict, today: Optional[date] = None) -> str:
    today = today or date.today()

    start_date = _to_date(promotion.get("start_date"))
    end_date = _to_date(promotion.get("end_date"))

    if start_date and today < start_date:
        return "scheduled"
    if end_date and today > end_date:
        return "expired"
    return "active"


def is_promotion_active(promotion: dict, today: Optional[date] = None) -> bool:
    return get_promotion_status(promotion, today=today) == "active"



def serialize_promotion(promotion: dict, today: Optional[date] = None) -> dict:
    status = get_promotion_status(promotion, today=today)
    discount_type = "percentage" if promotion.get("disc_pct") not in (None, "", 0) else "fixed"
    discount_value = promotion.get("disc_pct") if discount_type == "percentage" else promotion.get("disc_amount")

    return {
        "promo_id": promotion["promo_id"],
        "promo_name": promotion.get("promo_name"),
        "discount_type": discount_type,
        "discount_value": float(discount_value or 0),
        "disc_pct": float(promotion.get("disc_pct") or 0),
        "disc_amount": float(promotion.get("disc_amount") or 0),
        "start_date": str(promotion.get("start_date")) if promotion.get("start_date") else None,
        "end_date": str(promotion.get("end_date")) if promotion.get("end_date") else None,
        "status": status,
        "is_active": status == "active",
        "is_scheduled": status == "scheduled",
        "is_expired": status == "expired",
    }


def get_active_promotions_for_products(product_ids: Iterable[int]) -> Dict[int, dict]:
    product_ids = [int(product_id) for product_id in product_ids if product_id is not None]
    if not product_ids:
        return {}

    link_resp = (
        supabase.table("product_promotion")
        .select("product_id, promo_id")
        .in_("product_id", product_ids)
        .execute()
    )
    links = link_resp.data or []
    if not links:
        return {}

    promo_ids = list({link["promo_id"] for link in links if link.get("promo_id") is not None})
    if not promo_ids:
        return {}

    promotions_resp = supabase.table("promotions").select("*").in_("promo_id", promo_ids).execute()
    promotions_by_id = {promotion["promo_id"]: promotion for promotion in (promotions_resp.data or [])}

    active_promotions = {}
    for link in links:
        product_id = link.get("product_id")
        promotion = promotions_by_id.get(link.get("promo_id"))
        if not product_id or not promotion or not is_promotion_active(promotion):
            continue

        current = active_promotions.get(product_id)
        if current is None or promotion["promo_id"] > current["promo_id"]:
            active_promotions[product_id] = promotion

    return {product_id: serialize_promotion(promotion) for product_id, promotion in active_promotions.items()}


def get_active_promotion_for_product(product_id: int):
    return get_active_promotions_for_products([product_id]).get(product_id)


def sort_promotions_newest_first(promotions: List[dict]) -> List[dict]:
    return sorted(promotions or [], key=lambda promotion: promotion.get("promo_id", 0), reverse=True)
