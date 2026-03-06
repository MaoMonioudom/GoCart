import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductList from "../components/ProductList";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png";
import { useNavigate } from "react-router-dom";
import { getCustomerProducts } from "../../../services/productService";
import { mapProductToCard } from "../utils/productMapper";

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

  const transformedProducts = products.map((product) => mapProductToCard(product, navigate));

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
