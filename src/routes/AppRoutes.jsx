import { Routes, Route } from "react-router-dom";

/* =======================
   Public Pages
======================= */
import Landing from "../pages/Landing/Landing";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

/* =======================
   Seller Pages
======================= */
import SellerHome from "../dashboards/seller/pages/SellerHome";
import Product from "../dashboards/seller/pages/Product";
import MLPrediction from "../dashboards/seller/pages/MLPrediction";
import Inbox from "../dashboards/seller/pages/Inbox";
import SellerProfile from "../dashboards/seller/pages/SellerProfile";

/* =======================
   Customer Pages
======================= */
import CustomerHome from "../dashboards/customer/pages/CustomerHome";
import CustomerProduct from "../dashboards/customer/pages/CustomerProduct";
import CustomerPromotion from "../dashboards/customer/pages/CstomerPromotion";
import ProductDetail from "../dashboards/customer/pages/ProductDetail";
import Cart from "../dashboards/customer/pages/Cart";
import Checkout from "../dashboards/customer/pages/Checkout";

/* =======================
   Admin Pages (RENAMED)
======================= */
import CustomerManagement from "../dashboards/admin/pages/CustomerManagement";
import MLInsights from "../dashboards/admin/pages/MLInsights";
import ProfilePage from "../dashboards/admin/pages/ProfilePage";
import SellerManagement from "../dashboards/admin/pages/SellerManagement";

/* =======================
   App Routes
======================= */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ===== Public Routes ===== */}
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ===== Admin Routes ===== */}
      <Route path="/admin/sellers" element={<SellerManagement />} />
      <Route path="/admin/customers" element={<CustomerManagement />} />
      <Route path="/admin/ml-insights" element={<MLInsights />} />
      <Route path="/admin/profile" element={<ProfilePage />} />

      {/* ===== Seller Routes ===== */}
      <Route path="/seller/seller-home" element={<SellerHome />} />
      <Route path="/seller/product" element={<Product />} />
      <Route path="/seller/ml-prediction" element={<MLPrediction />} />
      <Route path="/seller/inbox" element={<Inbox />} />
      <Route path="/seller/profile" element={<SellerProfile />} />

      {/* ===== Customer Routes ===== */}
      <Route path="/customer" element={<CustomerHome />} />
      <Route path="/promotion" element={<CustomerPromotion />} />
      <Route path="/product" element={<CustomerProduct />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* ===== 404 ===== */}
      <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
    </Routes>
  );
}
