from supabase_client import supabase

def get_order(order_id:int):
    resp = supabase.table("orders").select("*").eq("order_id", order_id).limit(1).execute()
    return (resp.data or [None])[0]

def list_orders_for_user(user_id:int):
    return (supabase.table("orders").select("*").eq("user_id", user_id).neq("status","cart").execute().data) or []
