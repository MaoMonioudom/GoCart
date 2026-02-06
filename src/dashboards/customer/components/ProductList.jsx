import ProductCard from "./ProductCard";

function ProductList({ products = [], onProductClick }) {
  return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(175px,1fr))]">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          image={product.image}
          name={product.name}
          price={product.price}
          originalPrice={product.originalPrice}
          promotion={product.promotion}
          productId={product.id}
          specs={product.specs} // ⭐ pass specs
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}

export default ProductList;
