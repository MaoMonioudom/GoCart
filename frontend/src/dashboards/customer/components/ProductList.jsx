import ProductCard from "./ProductCard";

function ProductList({ products = [] }) {
  return (
    <div
      className="grid gap-6 
        grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
        justify-items-center"
    >
      {products.map((p) => (
        <ProductCard
          key={p.productId}
          productId={p.productId}
          image={p.image}
          name={p.name}
          price={p.price}
          originalPrice={p.originalPrice}
          promotion={p.promotion}
          specs={p.specs}
          size={p.size}
          onClick={p.onClick}   // ✅ Important: use the click handler from CustomerHome
        />
      ))}
    </div>
  );
}

export default ProductList;