import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductList from "../components/ProductList";
import { productsByCategory } from "../data/productsData";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png";
import { useNavigate } from "react-router-dom";

function CustomerHome() {
  const navigate = useNavigate();

  // Flatten all products from categories
  const allProducts = Object.values(productsByCategory).flat();


  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Navbar */}
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
          {/* Render ProductList but only for home, pass onClick for each product */}
          <ProductList
            products={allProducts.map((p) => ({
              ...p,
                onClick: () => {
                    navigate(`/product/${p.productId}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
            }))}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default CustomerHome;
