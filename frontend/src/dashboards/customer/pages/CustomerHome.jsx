import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductList from "../components/ProductList";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../../api/products";

function CustomerHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchProducts();
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const uiProducts = products.map((p) => ({
    productId: p.product_id,
    name: p.name,
    price: p.price,
    image: p.image_url || "https://via.placeholder.com/300x200?text=GoCart",
    description: p.description,
    onClick: () => {
      navigate(`/product/${p.product_id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>

      <div className="w-full">
        <img
          src={HomeCustomerBanner}
          alt="Customer Homepage Banner"
          className="w-full object-cover"
        />
      </div>

      <div className="flex-1 flex">
        <main className="flex-1 p-6">
          {loading ? (
            <p className="text-gray-600">Loading products...</p>
          ) : (
            <ProductList products={uiProducts} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default CustomerHome;
