import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchProductById } from "../../../api/products";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchProductById(id);
        if (!mounted) return;
        setProduct(data);
      } catch (e) {
        console.error(e);
        setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.product_id);

    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        id: product.product_id,
        name: product.name,
        price: Number(product.price),
        qty: 1,
        image: product.image_url || "https://via.placeholder.com/300x200?text=GoCart",
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/cart");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>

      <main className="flex-1 p-6">
        {loading ? (
          <p className="text-gray-600">Loading product...</p>
        ) : !product ? (
          <p className="text-red-600">Product not found.</p>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow p-4">
              <img
                src={product.image_url || "https://via.placeholder.com/800x600?text=GoCart"}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description || "No description"}</p>

              <div className="text-xl font-bold mb-4">${product.price}</div>

              <div className="text-sm text-gray-600 mb-6">
                Stock: {product.current_stock_level ?? 0}
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetail;
