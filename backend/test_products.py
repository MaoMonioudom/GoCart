from supabase_client import supabase

# Check active products
result = supabase.table('products').select('product_id, name, status, current_stock_level').eq('status', 'active').execute()
total = len(result.data)
with_stock = sum(1 for p in result.data if (p.get('current_stock_level') or 0) > 0)

print(f'Total active products: {total}')
print(f'Active products with stock: {with_stock}')
print('\nFirst 5 active products:')
for p in result.data[:5]:
    print(f"  - ID: {p['product_id']}, Name: {p.get('name', 'N/A')}, Stock: {p['current_stock_level']}")

# Check all products
all_result = supabase.table('products').select('product_id, status, current_stock_level').execute()
print(f'\nTotal products in database: {len(all_result.data)}')
statuses = {}
for p in all_result.data:
    status = p.get('status', 'unknown')
    statuses[status] = statuses.get(status, 0) + 1
print(f'Products by status: {statuses}')
