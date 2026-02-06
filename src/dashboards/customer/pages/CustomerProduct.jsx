import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import ProductList from "../components/ProductList";
import { productsByCategory } from "../data/productsData";
import Footer from "../components/Footer";

function CustomerProduct() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const categories = Object.keys(productsByCategory);

  const handleProductClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white min-h-screen scroll-smooth">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 shadow-sm">
        <Navbar />
      </header>

      {/* Sticky SubNavbar */}
      <div className="sticky top-[60px] z-40 bg-white shadow-md border-b border-gray-200">
        <SubNavbar categories={categories} />
      </div>

      {/* Products */}
      <main className="pt-8 px-6">
        {categories.map((cat) => {
          const filteredProducts = productsByCategory[cat].filter((product) =>
            product.name.toLowerCase().includes(query.toLowerCase())
          );

          if (filteredProducts.length === 0) return null;

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
                products={filteredProducts.map((p) => ({
                  ...p,
                  onClick: handleProductClick,
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

export default CustomerProduct;
