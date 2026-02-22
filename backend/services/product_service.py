from supabase_client import supabase

def list_active_products():
    return (supabase.table("products").select("*").eq("status","active").execute().data) or []

def get_product(product_id:int):
    resp = supabase.table("products").select("*").eq("product_id", product_id).limit(1).execute()
    return (resp.data or [None])[0]

def create_product(payload:dict):
    resp = supabase.table("products").insert(payload).execute()
    return (resp.data or [None])[0]

def update_product(product_id:int, payload:dict):
    resp = supabase.table("products").update(payload).eq("product_id", product_id).execute()
    return (resp.data or [None])[0]
