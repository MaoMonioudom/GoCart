import { useNavigate } from "react-router-dom";

function ProductCard({
  image,
  name,
  price,
  originalPrice,
  promotion,
  promotionText,
  specs,
  productId,
  promoId,
  onClick,
  size = "normal",
}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (typeof onClick === "function") {
      onClick();
      return;
    }
    if (!productId) return;
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (!productId) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const selectedSize = specs?.size ? specs.size[0] : null;
    const existing = cart.find(
      (item) => item.id === productId && item.selectedSize === selectedSize
    );

    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        id: productId,
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        promotion: promotion || null,
        promotionText: promotionText || null,
        qty: 1,
        image,
        specs,
        selectedSize,
        promo_id: promoId || null,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const previewSpecs = [];
  if (specs?.fabric) previewSpecs.push(specs.fabric);
  if (specs?.size) previewSpecs.push(specs.size.join(", "));
  if (specs?.author) previewSpecs.push(`by ${specs.author}`);
  if (specs?.weight) previewSpecs.push(specs.weight);
  if (specs?.warranty) previewSpecs.push(specs.warranty);
  if (specs?.material) previewSpecs.push(specs.material);
  if (specs?.volume) previewSpecs.push(specs.volume);
  if (specs?.skinType) previewSpecs.push(specs.skinType);

  const badgeText = promotionText || (promotion ? `${promotion}% OFF` : null);

  return (
    <div
      onClick={handleNavigate}
      className={`
        relative flex flex-col rounded-xl overflow-hidden bg-white shadow hover:shadow-xl
        transition-transform duration-300 cursor-pointer w-full
        hover:-translate-y-1 sm:hover:-translate-y-2
      `}
    >
      <div className={`relative ${size === "small" ? "h-40 sm:h-48" : "h-48 sm:h-64 lg:h-72"} overflow-hidden`}>
        <img
          src={image || "/placeholder.png"}
          alt={name}
          className="w-full h-full object-cover rounded-t-xl transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
        {badgeText && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded shadow">
            {badgeText}
          </span>
        )}
      </div>

      <div className={`px-5 py-4 flex flex-col gap-2 ${size === "small" ? "text-sm" : "text-base"}`}>
        <h3 className={`font-semibold text-gray-800 truncate ${size === "small" ? "text-sm" : "text-lg"}`}>
          {name}
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-gray-900 font-bold text-base">${Number(price).toFixed(2)}</span>
          {originalPrice && <span className="text-gray-400 line-through text-sm">${Number(originalPrice).toFixed(2)}</span>}
        </div>

        {size === "normal" && previewSpecs.length > 0 && (
          <p className="text-gray-500 text-sm truncate">{previewSpecs.join(" | ")}</p>
        )}
      </div>

      {size === "normal" && (
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

export default ProductCard;
