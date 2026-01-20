import ProductCard from "./ProductCard";

function ProductList({ products = [] }) {
  return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(175px,1fr))]">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          image={product.image}
          name={product.name}
          price={product.price}
          productId={product.id}
        />
      ))}
    </div>
  );
}

export default ProductList;
