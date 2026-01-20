import Navbar from "../components/Navbar";
import Footer from "../../../components/layout/Footer";
import ProductList from "../../../components/ProductList";
import allProducts from "../../../data/products";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png"; // adjust extension

function CustomerHome() {
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
      {/* Page body */}
      <div className="flex-1 flex">
        <main className="flex-1 p-6">
          <ProductList
            products={allProducts}
            onAddToCart={(product) => {
              console.log("Add to cart:", product);
            }}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default CustomerHome;
