from supabase import create_client
<<<<<<< HEAD
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
=======
from config import Config

supabase = create_client(
    Config.SUPABASE_URL,
    Config.SUPABASE_SERVICE_ROLE_KEY
)
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
