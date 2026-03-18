import sys
import io
from services.ml_service import recommend_products_for_user

# Suppress print statements
old_stdout = sys.stdout
sys.stdout = io.StringIO()

try:
    result = recommend_products_for_user(user_id=1, limit=5)
finally:
    sys.stdout = old_stdout

print(f"Recommendations returned: {len(result)}")
if len(result) > 0:
    print(f"First recommendation ID: {result[0].get('product_id')}")
    print("SUCCESS - Recommendations working!")
else:
    print("FAILED - No recommendations returned")
