import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import { getCustomerProducts, getCategories } from "../../../services/productService";
import { mapProductToCard } from "../utils/productMapper";

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
          getCategories(),
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

  const productsByCategory = {};
  products.forEach((product) => {
    const categoryName = product.category_name || "Uncategorized";
    if (!productsByCategory[categoryName]) {
      productsByCategory[categoryName] = [];
    }
    productsByCategory[categoryName].push(product);
  });

  const categoryNames = categories.map((category) => category.category_name);

  return (
    <div className="min-h-screen scroll-smooth">
      <header className="sticky top-0 z-50 shadow-sm">
        <Navbar />
      </header>

      <div className="sticky top-[60px] z-40 bg-white shadow-md border-b border-gray-200">
        <SubNavbar categories={categoryNames} />
      </div>

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
          Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => (
            <section
              id={categoryName.replace(/\s+/g, "-")}
              key={categoryName}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4 ml-2 mt-4 inline-block">
                {categoryName}
              </h2>

              <ProductList
                products={categoryProducts.map((product) => mapProductToCard(product, navigate))}
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
