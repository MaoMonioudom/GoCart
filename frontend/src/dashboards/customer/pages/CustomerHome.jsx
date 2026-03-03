import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductList from "../components/ProductList";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png";
import { useNavigate } from "react-router-dom";
import { getCustomerProducts } from "../../../services/productService";

function CustomerHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getCustomerProducts();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Get main image from images array
  const getMainImage = (p) => {
    return (
      p.images?.find((img) => img.is_main)?.image_url ||
      p.images?.[0]?.image_url ||
      p.image_url ||
      p.image ||
      "/placeholder.png"
    );
  };

  const transformedProducts = products.map((p) => ({
    productId: p.product_id,
    name: p.name,
    price: p.price,

    originalPrice: p.promotion
      ? p.promotion.discount_type === "percentage"
        ? (p.price / (1 - p.promotion.discount_value / 100)).toFixed(2)
        : (parseFloat(p.price) + parseFloat(p.promotion.discount_value)).toFixed(2)
      : null,

    promotion: p.promotion
      ? p.promotion.discount_type === "percentage"
        ? p.promotion.discount_value
        : null
      : null,

    image: getMainImage(p),
    category: p.category_name,
    specs: { description: p.description },

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
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products available</div>
          ) : (
            <ProductList products={transformedProducts} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default CustomerHome;