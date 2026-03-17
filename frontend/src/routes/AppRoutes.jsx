import { Routes, Route } from "react-router-dom";

/* =======================
   Public Pages
======================= */
// import Landing from "../pages/Landing/Landing";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import About from "../pages/PublicPages/About";
import Blog from "../pages/PublicPages/Blog";
import FAQ from "../pages/PublicPages/FAQ";
import Contact from "../pages/PublicPages/Contact";

/* =======================
   Seller Pages
======================= */
import SellerHome from "../dashboards/seller/pages/SellerHome";
import Product from "../dashboards/seller/pages/Product";
import MLPrediction from "../dashboards/seller/pages/MLPrediction";
import Notification from "../dashboards/seller/pages/Notification";
import SellerProfile from "../dashboards/seller/pages/SellerProfile";

/* =======================
   Customer Pages
======================= */
import CustomerHome from "../dashboards/customer/pages/CustomerHome";
import CustomerProduct from "../dashboards/customer/pages/CustomerProduct";
import CustomerPromotion from "../dashboards/customer/pages/CustomerPromotion";
import ProductDetail from "../dashboards/customer/pages/ProductDetail";
import Cart from "../dashboards/customer/pages/Cart";
import Checkout from "../dashboards/customer/pages/Checkout";
import Orders from "../dashboards/customer/pages/Orders";
import OrderDetail from "../dashboards/customer/pages/OrderDetail";
import CustomerProfile from "../dashboards/customer/pages/CustomerProfile";
import RegisterAsSeller from "../pages/Register/RegisterAsSeller";

/* =======================
   Admin Pages (RENAMED)
======================= */
import CustomerManagement from "../dashboards/admin/pages/CustomerManagement";
import SellerManagement from "../dashboards/admin/pages/SellerManagement";
// import MLInsights from "../dashboards/admin/pages/MLInsights";
import ProfilePage from "../dashboards/admin/pages/ProfilePage";

/* =======================
   App Routes
======================= */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== Public Routes ===== */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />

      {/* ===== Admin Routes ===== */}
      {/* <Route path="/admin/sellers" element={<SellerManagement />} />
      <Route path="/admin/customers" element={<CustomerManagement />} />
      <Route path="/admin/ml-insights" element={<MLInsights />} />
      <Route path="/admin/profile" element={<ProfilePage />} /> */}

      {/* ===== Seller Routes ===== */}
      <Route path="/seller/seller-home" element={<SellerHome />} />
      <Route path="/seller/product" element={<Product />} />
      <Route path="/seller/ml-prediction" element={<MLPrediction />} />
      <Route path="/seller/notifications" element={<Notification />} />
      <Route path="/seller/profile" element={<SellerProfile />} />

      {/* ===== Customer Routes ===== */}
      <Route path="/customer" element={<CustomerHome />} />
      <Route path="/promotion" element={<CustomerPromotion />} />
      <Route path="/product" element={<CustomerProduct />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/customer/profile" element={<CustomerProfile />} />
      <Route path="/register-seller" element={<RegisterAsSeller />} />
        
    {/* Admin */}
        <Route path="/admin/sellers" element={<SellerManagement />} />
        <Route path="/admin/customers" element={<CustomerManagement />} />
        {/* <Route path="/admin/ml-insights" element={<MLInsights />} /> */}
        <Route path="/admin/profile" element={<ProfilePage />} />

      {/* ===== 404 ===== */}
      <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
    </Routes>
  );
}
