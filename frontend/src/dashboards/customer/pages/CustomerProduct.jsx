import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import { getCustomerProducts, getCategories } from "../../../services/productService";

function CustomerProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q") || "";
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getCustomerProducts(null, query || null),
          getCategories()
        ]);
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  // Group products by category
  const productsByCategory = {};
  products.forEach((p) => {
    const catName = p.category_name || "Uncategorized";
    if (!productsByCategory[catName]) {
      productsByCategory[catName] = [];
    }
    productsByCategory[catName].push(p);
  });

  const categoryNames = categories.map(c => c.category_name);

  // Transform product for ProductCard
  const transformProduct = (p) => {
    const originalPrice = parseFloat(p.price);
    let discountedPrice = originalPrice;
    
    if (p.promotion) {
      if (p.promotion.discount_type === "percentage") {
        discountedPrice = originalPrice * (1 - p.promotion.discount_value / 100);
      } else {
        discountedPrice = originalPrice - parseFloat(p.promotion.discount_value);
      }
    }
    
    return {
      id: p.product_id,
      name: p.name,
      price: p.promotion ? discountedPrice.toFixed(2) : p.price,
      originalPrice: p.promotion ? originalPrice.toFixed(2) : null,
      promotion: p.promotion 
        ? (p.promotion.discount_type === "percentage" ? p.promotion.discount_value : null)
        : null,
      promoId: p.promotion?.promo_id || null,
      image: p.image || "/placeholder.png",
      specs: { description: p.description },
      onClick: () => {
        navigate(`/product/${p.product_id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    };
  };

  return (
    <div className="min-h-screen scroll-smooth">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 shadow-sm">
        <Navbar />
      </header>

      {/* Sticky SubNavbar */}
      <div className="sticky top-[60px] z-40 bg-white shadow-md border-b border-gray-200">
        <SubNavbar categories={categoryNames} />
      </div>

      {/* Products */}
      <main className="pt-8 px-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : Object.keys(productsByCategory).length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {query ? `No products found for "${query}"` : "No products available"}
          </div>
        ) : (
          Object.entries(productsByCategory).map(([catName, catProducts]) => (
            <section
              id={catName.replace(/\s+/g, "-")}
              key={catName}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4 ml-2 mt-4 inline-block">
                {catName}
              </h2>

              <ProductList
                products={catProducts.map(transformProduct)}
              />
            </section>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CustomerProduct;