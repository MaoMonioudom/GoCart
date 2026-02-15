import { useNavigate } from "react-router-dom";

function ProductCard({
  image,
  name,
  price,
  originalPrice,
  promotion,
  specs,
  productId,
  size = "normal"
}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/product/${productId}`);
  };

  // ✅ Add to cart and navigate to cart
  const handleAddToCart = (e) => {
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const selectedSize = specs?.size ? specs.size[0] : null;
    const existing = cart.find(item => item.id === productId && item.selectedSize === selectedSize);

    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        id: productId,
        name,
        price: Number(price),
        qty: 1,
        image,
        specs,
        selectedSize
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // ✅ Dispatch cartUpdated event
    window.dispatchEvent(new Event("cartUpdated"));

    // Navigate to cart
    navigate("/cart", { replace: true });
  };

  // 🔍 Pick important specs for card preview
  const previewSpecs = [];
  if (specs?.fabric) previewSpecs.push(specs.fabric);
  if (specs?.size) previewSpecs.push(specs.size.join(", "));
  if (specs?.author) previewSpecs.push(`by ${specs.author}`);
  if (specs?.weight) previewSpecs.push(specs.weight);
  if (specs?.warranty) previewSpecs.push(specs.warranty);
  if (specs?.material) previewSpecs.push(specs.material);
  if (specs?.volume) previewSpecs.push(specs.volume);
  if (specs?.skinType) previewSpecs.push(specs.skinType);

  return (
    <div
      onClick={handleNavigate}
      className={`
        flex flex-col gap-3
        rounded-xl bg-white shadow-sm
        overflow-hidden cursor-pointer
        transition hover:shadow-md
        ${size === "small" ? "w-44" : "w-full"}
      `}
    >
      {/* Image */}
      <div className={`relative ${size === "small" ? "h-32" : "h-40"}`}>
        {promotion && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {promotion}% OFF
          </span>
        )}
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full rounded-t-xl"
        />
      </div>

      {/* Info */}
      <div className={`px-4 pb-4 flex flex-col gap-1 ${size === "small" ? "text-xs" : "text-sm"}`}>
        <h3 className={`${size === "small" ? "text-sm" : "text-base"} font-semibold text-gray-800 truncate`}>
          {name}
        </h3>

        {/* Price */}
        {promotion ? (
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-semibold text-sm">${price}</span>
            <span className="text-gray-400 line-through text-xs">${originalPrice}</span>
          </div>
        ) : (
          <span className="text-gray-800 font-semibold text-sm">${price}</span>
        )}

        {/* 🔹 ONE-LINE SPEC PREVIEW (normal size only) */}
        {size === "normal" && previewSpecs.length > 0 && (
          <p className="text-xs text-gray-600 truncate">{previewSpecs.join(" | ")}</p>
        )}

        {/* Add to Cart button (normal size only) */}
        {size === "normal" && (
          <button
            onClick={handleAddToCart}
            className="mt-2 w-full bg-black text-white text-sm font-medium py-2 rounded-lg transition hover:bg-gray-800"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
