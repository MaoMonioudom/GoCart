import ProductCard from "../ProductCard/ProductCard";
import "./ProductList.css";

function ProductList({ products = [], onAddToCart = () => {} }) { // default empty array & noop
  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          image={product.image}
          name={product.name}
          price={product.price}
          onAddToCart={() => onAddToCart(product)}
        />
      ))}
    </div>
  );
}

export default ProductList;
