import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import ProductList from "../components/ProductList";
import { productsByCategory } from "../data/productsData";
import Footer from "../components/Footer";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png";

function CustomerPromotion() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const categories = Object.keys(productsByCategory);

  const handleProductClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white min-h-screen scroll-smooth">
      <header className="sticky top-0 z-50 shadow-sm">
        <Navbar />
      </header>

      <div className="sticky top-[60px] z-40 bg-white shadow-md border-b border-gray-200">
        <SubNavbar categories={categories} />
      </div>

      <div className="w-full">
        <img
          src={HomeCustomerBanner}
          alt="Promotion Banner"
          className="w-full object-cover"
        />
      </div>

      <main className="pt-8 px-6">
        {categories.map((cat) => {
          const promoProducts = productsByCategory[cat]
            .filter((p) => p.promotion) // 🔥 PROMO ONLY
            .filter((p) =>
              p.name.toLowerCase().includes(query.toLowerCase())
            );

          if (promoProducts.length === 0) return null;

          return (
            <section
              id={cat.replace(/\s+/g, "-")}
              key={cat}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4 ml-2 mt-4 inline-block">
                {cat}
              </h2>

              <ProductList
                products={promoProducts.map((p) => ({
                  ...p,
                  onClick: handleProductClick
                }))}
              />
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}

export default CustomerPromotion;
