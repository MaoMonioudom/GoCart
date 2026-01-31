import { useNavigate } from "react-router-dom";

function ProductCard({
  image,
  name,
  price,
  originalPrice,
  promotion,
  specs,
  productId
}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    console.log("Add to cart:", productId);
  };

  // 🔍 PICK IMPORTANT SPECS FOR CARD (PREVIEW ONLY)
const previewSpecs = [];
if (specs?.fabric) previewSpecs.push(specs.fabric);
if (specs?.size) previewSpecs.push(specs.size.join(", "));
if (specs?.author) previewSpecs.push(`by ${specs.author}`);
if (specs?.weight) previewSpecs.push(specs.weight);
if (specs?.warranty) previewSpecs.push(specs.warranty);
if (specs?.material) previewSpecs.push(specs.material);
if (specs?.volume) previewSpecs.push(specs.volume);      // ✅ new
if (specs?.skinType) previewSpecs.push(specs.skinType);  // ✅ new


  return (
    <div
      onClick={handleNavigate}
      className="
        flex flex-col gap-3
        rounded-xl bg-white shadow-sm
        overflow-hidden cursor-pointer
        transition hover:shadow-md
      "
    >
      {/* Image */}
      <div className="relative">
        {promotion && (
          <span className="
            absolute top-2 left-2
            bg-red-500 text-white text-xs font-semibold
            px-2 py-1 rounded
          ">
            {promotion}% OFF
          </span>
        )}

        <img
          src={image}
          alt={name}
          className="h-40 w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="px-4 pb-4 flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-800 truncate">
          {name}
        </h3>

        {/* Price */}
        {promotion ? (
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-semibold">
              ${price}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ${originalPrice}
            </span>
          </div>
        ) : (
          <span className="text-gray-800 font-semibold">
            ${price}
          </span>
        )}

        {/* 🔹 ONE-LINE SPEC PREVIEW (ADMIN-STYLE) */}
        {previewSpecs.length > 0 && (
          <p className="text-xs text-gray-600 truncate">
            {previewSpecs.join(" | ")}
          </p>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="
            mt-2 w-full
            bg-black text-white text-sm font-medium
            py-2 rounded-lg
            transition hover:bg-gray-800
          "
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
