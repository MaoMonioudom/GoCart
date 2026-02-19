import "./ProductCard.css";
import Button from "../common/Button/Button";

function ProductCard({ image, name, price, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />

      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">${price}</p>

        <Button
          text="Add to Cart"
          onClick={onAddToCart}
        />
      </div>
    </div>
  );
}

export default ProductCard;
