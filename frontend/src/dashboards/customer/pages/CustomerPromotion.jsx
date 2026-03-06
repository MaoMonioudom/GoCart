import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png";
import { getCustomerProducts } from "../../../services/productService";
import { mapProductToCard } from "../utils/productMapper";

function CustomerPromotion() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotionProducts = async () => {
      try {
        setLoading(true);
        const data = await getCustomerProducts(null, query || null);
        setProducts((data.products || []).filter((product) => product.promotion));
      } catch (error) {
        console.error("Error fetching promotion products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionProducts();
  }, [query]);

  const productsByCategory = useMemo(() => {
    return products.reduce((groupedProducts, product) => {
      const categoryName = product.category_name || "Uncategorized";
      if (!groupedProducts[categoryName]) {
        groupedProducts[categoryName] = [];
      }
      groupedProducts[categoryName].push(product);
      return groupedProducts;
    }, {});
  }, [products]);

  const categoryNames = Object.keys(productsByCategory);

  return (
    <div className="bg-white min-h-screen scroll-smooth">
      <header className="sticky top-0 z-50 shadow-sm">
        <Navbar />
      </header>

      <div className="sticky top-[60px] z-40 bg-white shadow-md border-b border-gray-200">
        <SubNavbar categories={categoryNames} />
      </div>

      <div className="w-full">
        <img
          src={HomeCustomerBanner}
          alt="Promotion Banner"
          className="w-full object-cover"
        />
      </div>

      <main className="pt-8 px-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : categoryNames.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {query ? `No promotions found for "${query}"` : "No active promotions available"}
          </div>
        ) : (
          categoryNames.map((categoryName) => (
            <section
              id={categoryName.replace(/\s+/g, "-")}
              key={categoryName}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4 ml-2 mt-4 inline-block">
                {categoryName}
              </h2>

              <ProductList
                products={productsByCategory[categoryName].map((product) => mapProductToCard(product, navigate))}
              />
            </section>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CustomerPromotion;
