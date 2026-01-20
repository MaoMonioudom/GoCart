import { useNavigate } from "react-router-dom";

function ProductCard({ image, name, price, productId }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/cart/${productId}`);
  };

  return (
    <div
      className="w-52 bg-white overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={handleClick}
    >
      {/* Image grows to fill available space */}
      <div className="w-full aspect-[8/9] bg-gray-100 flex items-center justify-center">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="text-base font-medium text-gray-800 mb-2 truncate">
          {name}
        </h3>
        <p className="text-gray-700 font-semibold">${price}</p>
      </div>
    </div>
  );
}

export default ProductCard;
