import ProductCard from "./ProductCard";

function ProductList({ products = [] }) {
  return (
    <div
      className="grid gap-6 
        grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
        justify-items-center"
    >
      {products.map((product, index) => {
        const productId = product.productId || product.id;

        return (
          <ProductCard
            key={productId || `${product.name || "product"}-${index}`}
            productId={productId}
            image={product.image}
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            promotion={product.promotion}
            promotionText={product.promotionText}
            promoId={product.promoId}
            specs={product.specs}
            size={product.size}
            onClick={product.onClick}
          />
        );
      })}
    </div>
  );
}

export default ProductList;
