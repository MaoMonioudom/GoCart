import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../../../components/layout/Footer";
import ProductList from "../../../components/ProductList";
import { productsByCategory } from "../data/productsData";

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const allProducts = Object.values(productsByCategory).flat();

  const product =
    location.state?.product || allProducts.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="text-center mt-20 text-gray-700 text-lg">
        Product not found
      </div>
    );
  }

  const numericPrice = Number(product.price);
  const originalPrice = product.originalPrice
    ? Number(product.originalPrice)
    : null;
  const discount = product.promotion;
  const totalPrice = numericPrice * quantity;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.qty += quantity;
    } else {
      cart.push({
        ...product,
        price: numericPrice,
        qty: quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  const handleBuyNow = () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          ...product,
          price: numericPrice,
          qty: quantity,
        },
      ])
    );
    navigate("/checkout");
  };

  const recommendedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 8);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="border border-black px-5 py-2 rounded hover:underline"
        >
          &larr; Back
        </button>
      </div>

      {/* TOP */}
      <div className="max-w-7xl mx-auto px-4 mt-6 grid lg:grid-cols-3 gap-8">
        {/* IMAGE */}
        <div className="bg-white rounded-2xl shadow-md h-96 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="h-full object-cover"
          />
        </div>

        {/* INFO */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          {product.brand && (
            <p className="text-sm text-gray-500">Brand: {product.brand}</p>
          )}

          {/* PRICE */}
          <div className="flex items-center gap-4">
            {discount ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  ${numericPrice}
                </span>
                <span className="line-through text-gray-400">
                  ${originalPrice}
                </span>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
                  {discount}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">${numericPrice}</span>
            )}
          </div>

          {/* QTY */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Quantity</span>

            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className="px-4 py-2 hover:bg-gray-100"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>

              <span className="w-10 flex items-center justify-center font-medium">
                {quantity}
              </span>

              <button
                className="px-4 py-2 hover:bg-gray-100"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
          <h4 className="font-semibold">Order Summary</h4>

          <div className="flex justify-between text-sm">
            <span>Status</span>
            <span>{discount ? "Promo" : "Normal"}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Unit Price</span>
            <span>${numericPrice}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-3 border border-black py-2 rounded-lg hover:bg-gray-100"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="bg-black text-white py-2 rounded-lg hover:bg-gray-900"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* SPECS */}
      <section className="max-w-7xl mx-auto px-4 mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Product Information</h3>

        <div className="divide-y text-sm">
          {Object.entries(product.specs || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between py-3">
              <span className="text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
              <span>
                {Array.isArray(value) ? value.join(", ") : value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* RECOMMENDED */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <h3 className="text-xl font-semibold mb-4">Recommended Products</h3>
        <div className="flex gap-4 overflow-x-auto">
          {recommendedProducts.map((p) => (
            <div key={p.id} className="w-44 flex-shrink-0">
              <ProductList products={[p]} />
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProductDetail;
