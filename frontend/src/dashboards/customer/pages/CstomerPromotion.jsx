// import { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import ProductList from "../components/ProductList";
// import { useNavigate } from "react-router-dom";
// import { fetchProducts } from "../../../api/products";

// function CstomerPromotion() {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const data = await fetchProducts();
//         if (!mounted) return;
//         // For now: treat all products as eligible. Real promotions can be added later.
//         setProducts(Array.isArray(data) ? data : []);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const uiProducts = products.map((p) => ({
//     productId: p.product_id,
//     name: p.name,
//     price: p.price,
//     image: p.image_url || "https://via.placeholder.com/300x200?text=GoCart",
//     description: p.description,
//     onClick: () => {
//       navigate(`/product/${p.product_id}`);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     },
//   }));

//   return (
//     <div className="min-h-screen flex flex-col">
//       <header className="sticky top-0 z-50">
//         <Navbar />
//       </header>

//       <div className="flex-1 flex">
//         <main className="flex-1 p-6">
//           <h1 className="text-2xl font-semibold mb-4">Promotions</h1>
//           {loading ? (
//             <p className="text-gray-600">Loading products...</p>
//           ) : (
//             <ProductList products={uiProducts} />
//           )}
//         </main>
//       </div>

//       <Footer />
//     </div>
//   );
// }

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import HomeCustomerBanner from "../../../assets/images/HomeCustomerBanner.png";
import Loader from "../../../components/common/Loader";

// API client
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function CustomerPromotion() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch promotions from backend API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(`${API_BASE_URL}/customer/promotions`);
        
        if (query) {
          url.searchParams.append("search", query);
        }

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setPromotions(data.promotions || []);

        // Extract unique categories from products in promotions
        const uniqueCategories = new Set();
        (data.promotions || []).forEach((promo) => {
          (promo.products || []).forEach((product) => {
            if (product.category_id) {
              uniqueCategories.add(product.category_id);
            }
          });
        });
        
        setCategories(Array.from(uniqueCategories));

      } catch (err) {
        console.error("Failed to fetch promotions:", err);
        setError("Failed to load promotions. Please try again later.");
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [query]);

  const handleProductClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {promotions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active promotions at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for exciting deals!</p>
          </div>
        ) : (
          promotions.map((promo) => (
            <section
              key={promo.promo_id}
              className="mb-12"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold ml-2 mt-4 inline-block">
                  {promo.promo_name}
                </h2>
                <span className="ml-4 inline-block">
                  {promo.disc_pct > 0 ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {promo.disc_pct}% OFF
                    </span>
                  ) : promo.disc_amount > 0 ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${promo.disc_amount} OFF
                    </span>
                  ) : null}
                </span>
              </div>

              {promo.products && promo.products.length > 0 ? (
                <ProductList
                  products={promo.products.map((p) => ({
                    ...p,
                    promotion: promo.disc_pct || promo.disc_amount,
                    originalPrice: p.price,
                    onClick: handleProductClick
                  }))}
                />
              ) : (
                <p className="text-gray-400 ml-2">No products in this promotion</p>
              )}
            </section>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CustomerPromotion;
