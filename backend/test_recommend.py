from services.ml_service import recommend_products_for_user

# Test with user_id 1 (test customer)
print("Testing recommendation for user_id 1:")
result = recommend_products_for_user(user_id=1, limit=10)
print(f"Result type: {type(result)}")
print(f"Result length: {len(result) if isinstance(result, list) else 'N/A'}")
print(f"Result: {result}")

if isinstance(result, list) and len(result) > 0:
    print("\nFirst recommendation:")
    print(result[0])

# Test with user_id 2
print("\n\nTesting recommendation for user_id 2:")
result2 = recommend_products_for_user(user_id=2, limit=10)
print(f"Result type: {type(result2)}")
print(f"Result length: {len(result2) if isinstance(result2, list) else 'N/A'}")
print(f"Result: {result2}")
