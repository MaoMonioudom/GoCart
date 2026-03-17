from supabase_client import supabase

def get_user_by_email(email:str):
    resp = supabase.table("users").select("*").eq("email", email).limit(1).execute()
    return (resp.data or [None])[0]

def get_user(user_id:int):
    resp = supabase.table("users").select("*").eq("user_id", user_id).limit(1).execute()
    return (resp.data or [None])[0]
