from supabase_client import supabase

def get_user_by_email(email):
    response = supabase.table("users") \
        .select("*") \
        .eq("email", email) \
        .single() \
        .execute()

    return response.data