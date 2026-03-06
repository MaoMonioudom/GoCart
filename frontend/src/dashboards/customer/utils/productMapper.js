export const getMainProductImage = (product) => {
  if (!product) return "/placeholder.png";

  return (
    product.images?.find((image) => image.is_main)?.image_url ||
    product.images?.[0]?.image_url ||
    product.image ||
    product.image_url ||
    "/placeholder.png"
  );
};

const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getProductPricing = (product) => {
  const basePrice = normalizeNumber(product?.price);
  const promotion = product?.promotion;

  if (!promotion) {
    return {
      currentPrice: basePrice,
      originalPrice: null,
      promotionValue: null,
      promotionText: null,
      promoId: null,
    };
  }

  const discountValue = normalizeNumber(promotion.discount_value);

  if (promotion.discount_type === "percentage") {
    return {
      currentPrice: Math.max(0, basePrice * (1 - discountValue / 100)),
      originalPrice: basePrice,
      promotionValue: discountValue,
      promotionText: `${discountValue}% OFF`,
      promoId: promotion.promo_id || null,
    };
  }

  return {
    currentPrice: Math.max(0, basePrice - discountValue),
    originalPrice: basePrice,
    promotionValue: discountValue,
    promotionText: `$${discountValue.toFixed(2)} OFF`,
    promoId: promotion.promo_id || null,
  };
};

export const mapProductToCard = (product, navigate, extra = {}) => {
  const pricing = getProductPricing(product);

  const defaultOnClick = () => {
    if (!navigate) return;
    navigate(`/product/${product.product_id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    productId: product.product_id,
    name: product.name,
    price: pricing.currentPrice.toFixed(2),
    originalPrice:
      pricing.originalPrice !== null ? pricing.originalPrice.toFixed(2) : null,
    promotion: pricing.promotionValue,
    promotionText: pricing.promotionText,
    promoId: pricing.promoId,
    image: getMainProductImage(product),
    category: product.category_name,
    specs: {
      description: product.description,
    },
    onClick: extra.onClick || defaultOnClick,
    ...extra,
  };
};
