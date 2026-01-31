import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../../../components/layout/Footer";
import ProductCard from "../../../components/ProductCard";
import { productsByCategory } from "../data/productsData";

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  const allProducts = Object.values(productsByCategory).flat();
  const product = location.state?.product || allProducts.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product?.specs?.size) setSelectedSize(product.specs.size[0]);
  }, [id, product]);

  if (!product) return <div className="text-center mt-20 text-gray-700 text-lg">Product not found</div>;

  const numericPrice = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const discount = product.promotion;
  const totalPrice = numericPrice * quantity;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.id === product.id && item.selectedSize === selectedSize);
    if (existing) existing.qty += quantity;
    else cart.push({ ...product, price: numericPrice, qty: quantity, selectedSize, originalPrice });
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("✅ Product added to cart from detail:", cart);
    
    // Trigger custom event to notify cart page
    window.dispatchEvent(new Event('cartUpdated'));
    
    navigate("/cart");
  };

  const handleBuyNow = () => {
    localStorage.setItem("cart", JSON.stringify([{ ...product, price: numericPrice, qty: quantity, selectedSize, originalPrice }]));
    navigate("/checkout");
  };

  const recommendedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 8);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <button onClick={() => navigate(-1)} className="border border-black px-5 py-2 rounded hover:underline">&larr; Back</button>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid lg:grid-cols-3 gap-8">
        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl shadow-md h-96 flex items-center justify-center overflow-hidden">
            <img src={product.images ? product.images[0] : product.image} alt={product.name} className="h-full object-cover" />
          </div>
          <div className="flex gap-2 overflow-x-auto mt-2">
            {(product.images || [product.image]).map((img, i) => (
              <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6">
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          {product.brand && <p className="text-sm text-gray-500">Brand: {product.brand}</p>}
          <div className="flex items-center gap-4 mt-2">
            {discount ? (
              <>
                <span className="text-3xl font-bold text-red-600">${numericPrice}</span>
                <span className="line-through text-gray-400">${originalPrice}</span>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">{discount}% OFF</span>
              </>
            ) : <span className="text-3xl font-bold">${numericPrice}</span>}
          </div>

          {/* Size Selector */}
          {product.specs.size && (
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-600">Size:</span>
              <div className="flex gap-2">
                {product.specs.size.map(size => (
                  <button
                    key={size}
                    className={`px-3 py-1 border rounded ${selectedSize === size ? "bg-black text-white" : "bg-white"}`}
                    onClick={() => setSelectedSize(size)}
                  >{size}</button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-600">Quantity</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button className="px-4 py-2 hover:bg-gray-100" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span className="w-10 flex items-center justify-center font-medium">{quantity}</span>
              <button className="px-4 py-2 hover:bg-gray-100" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
          <h4 className="font-semibold">Order Summary</h4>
          <div className="flex justify-between text-sm"><span>Status</span><span>{discount ? "Promo" : "Normal"}</span></div>
          <div className="flex justify-between text-sm"><span>Unit Price</span><span>${numericPrice}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>${totalPrice}</span></div>
          <button onClick={handleAddToCart} className="mt-3 border border-black py-2 rounded-lg hover:bg-gray-100">Add to Cart</button>
          <button onClick={handleBuyNow} className="bg-black text-white py-2 rounded-lg hover:bg-gray-900">Buy Now</button>
        </div>
      </div>

      {/* Recommended */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <h3 className="text-xl font-semibold mb-4">Recommended Products</h3>
        <div className="flex gap-4 overflow-x-auto">
          {recommendedProducts.map(p => (
            <ProductCard
              key={p.id}
              size="small"
              productId={p.id}
              image={p.images ? p.images[0] : p.image}
              name={p.name}
              price={p.price}
              originalPrice={p.originalPrice}
              promotion={p.promotion}
              specs={p.specs}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProductDetail;
