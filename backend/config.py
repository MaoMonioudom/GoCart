import os
from dotenv import load_dotenv

load_dotenv()

<<<<<<< HEAD
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
=======
class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    SECRET_KEY = "my_super_secret_admin_key_2026"
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
