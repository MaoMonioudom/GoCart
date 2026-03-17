import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { getCustomerProduct, getCustomerProducts } from "../../../services/productService";
import { getMainProductImage, getProductPricing, mapProductToCard } from "../utils/productMapper";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        
        const productData = await getCustomerProduct(id);
        console.log("Product API response:", productData);
        setProduct(productData?.product || productData);
        
        const allProducts = await getCustomerProducts();
        const filtered = (allProducts.products || [])
          .filter(p => p.product_id !== parseInt(id))
          .slice(0, 8);
        setRecommendedProducts(filtered);
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const images = product?.images?.map((img) => img.image_url) || [getMainProductImage(product)] || [];

  const goNext = useCallback(() => setSelectedImage((i) => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setSelectedImage((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!zoomed) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoomed, goNext, goPrev]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="text-center mt-20 text-gray-700 text-lg">Product not found</div>
      </div>
    );
  }

  const mainImage = images[selectedImage] || images[0] || "/placeholder.png";

  const pricing = getProductPricing(product);
  const hasPromotion = Boolean(product.promotion);
  const discount = pricing.promotionValue || 0;
  const originalPrice = pricing.originalPrice;
  const displayPrice = pricing.currentPrice;
  
  const totalPrice = (displayPrice * quantity).toFixed(2);
  const inStock = product.current_stock_level > 0;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(item => item.id === product.product_id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].qty += quantity;
    } else {
      cart.push({
        id: product.product_id,
        name: product.name,
        price: displayPrice,
        originalPrice: originalPrice,
        qty: quantity,
        discount: discount || 0,
        promotion: discount || 0,
        promotionText: pricing.promotionText || null,
        image: mainImage,
        shop_name: product.shop_name || "",
        promo_id: product.promotion?.promo_id || null
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate("/cart");
  };

  const handleBuyNow = () => {
    const cartItem = {
      id: product.product_id,
      name: product.name,
      price: displayPrice,
      originalPrice: originalPrice,
      qty: quantity,
      discount: discount || 0,
      promotion: discount || 0,
      promotionText: pricing.promotionText || null,
      image: mainImage,
      shop_name: product.shop_name || "",
      promo_id: product.promotion?.promo_id || null
    };
    localStorage.setItem("cart", JSON.stringify([cartItem]));
    navigate("/checkout");
  };

  // Transform recommended products
  const transformedRecommended = recommendedProducts.map((recommendedProduct) =>
    mapProductToCard(recommendedProduct)
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate("/product")} className="hover:text-black">Products</button>
          <span>/</span>
          {product.category_name && (
            <>
              <span className="hover:text-black cursor-pointer">{product.category_name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-black font-medium truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            
            {/* Left: Images */}
            <div className="p-6 lg:p-8 border-r border-gray-100">
              {/* Main image */}
              <div
                className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative group cursor-zoom-in"
                onClick={() => images.length > 0 && setZoomed(true)}
              >
                <img
                  key={selectedImage}
                  src={mainImage}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }}
                  className="w-full h-full object-contain transition-opacity duration-300"
                />

                {/* Arrow overlays on main image */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goPrev(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goNext(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {/* Zoom hint */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to zoom
                    </div>
                  </>
                )}
              </div>

              {/* Dot indicators (mobile) */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 mb-3 sm:hidden">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`rounded-full transition-all ${selectedImage === i ? "w-4 h-2 bg-black" : "w-2 h-2 bg-gray-300"}`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="hidden sm:flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === i ? "border-black shadow-md" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Zoom / lightbox modal ── */}
            {zoomed && (
              <div
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                onClick={() => setZoomed(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <img
                  src={mainImage}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }}
                  className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg select-none"
                  onClick={(e) => e.stopPropagation()}
                />

                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => setZoomed(false)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full w-9 h-9 flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <span className="text-white/70 text-sm">{selectedImage + 1} / {images.length}</span>
                  <div className="flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                        className={`rounded-full transition-all ${selectedImage === i ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Right: Product Info */}
            <div className="p-6 lg:p-8 flex flex-col">
              {/* Shop Name */}
              {product.shop_name && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-medium">
                      {product.shop_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{product.shop_name}</span>
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Category */}
              {product.category_name && (
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full mb-4 w-fit">
                  {product.category_name}
                </span>
              )}

              {/* Price Section */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className={`text-3xl font-bold ${hasPromotion ? 'text-red-600' : 'text-gray-900'}`}>
                  ${displayPrice.toFixed(2)}
                </span>
                {hasPromotion && (
                  <>
                    <span className="text-lg text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                    <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-0.5 rounded">
                      {product.promotion.discount_type === "percentage" 
                        ? `-${discount}%` 
                        : `-$${discount}`}
                    </span>
                  </>
                )}
              </div>

              {/* Promotion Badge */}
              {hasPromotion && product.promotion.promo_name && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-700">{product.promotion.promo_name}</span>
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {inStock ? `${product.current_stock_level} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Divider */}
              <hr className="border-gray-100 my-4" />

              {/* Description */}
              {product.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Specifications</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    {Object.entries(product.specifications).map(([key, value], i) => (
                      <div key={key} className={`flex items-center px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <span className="w-36 flex-shrink-0 text-gray-500 capitalize font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    onClick={() => setQuantity(q => Math.min(product.current_stock_level || 99, q + 1))}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-900">${totalPrice}</span></span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 border-2 border-black text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {/* Shipping Info */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Free Shipping</h4>
            </div>
            <p className="text-sm text-gray-500">On orders over $50</p>
          </div>

          {/* Return Policy */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Easy Returns</h4>
            </div>
            <p className="text-sm text-gray-500">30-day return policy</p>
          </div>

          {/* Secure Payment */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Secure Payment</h4>
            </div>
            <p className="text-sm text-gray-500">100% protected</p>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {transformedRecommended.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {transformedRecommended.slice(0, 4).map(p => (
              <ProductCard
                key={p.id}
                size="small"
                productId={p.id}
                image={p.image}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                promotion={p.promotion}
                promotionText={p.promotionText}
                promoId={p.promoId}
              />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default ProductDetail;