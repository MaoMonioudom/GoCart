import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

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
// import HomeCustomer from "../dashboards/Customers/HomeCustomer/HomeCustomer";
// import Products from "../dashboards/Customers/Products/Products";
// import Promotion from "../dashboards/Customers/Promotion/Promotion";
// import ProductDetail from "../dashboards/Customers/ProductDetail/ProductDetail";
// import Cart from "../dashboards/Customers/Cart/Cart";
// import RegisterSeller from "../dashboards/Customers/RegisterSeller/RegisterSeller";
// import CAccount from "../dashboards/Customers/Account/Account";
// import Delivery from "../dashboards/Customers/Delivery/Delivery";
// import Payment from "../dashboards/Customers/Payment/Payment";

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
      <Route
        path="/admin/sellers-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SellerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CustomerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ml-insights"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MLInsights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/admin-profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* ===== Seller Routes ===== */}
      <Route
        path="/seller/seller-home"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/product"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <Product />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/ml-prediction"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <MLPrediction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/inbox"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <Inbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/seller-profile"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerProfile />
          </ProtectedRoute>
        }
      />

      {/* ===== Customer Routes =====
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <HomeCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/home"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <HomeCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/products"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/promotion"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Promotion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/product/:id"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <ProductDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/cart"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/register-seller"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <RegisterSeller />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/account"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/delivery"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Delivery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/payment"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Payment />
          </ProtectedRoute>
        }
      /> */}

      {/* ===== 404 ===== */}
      <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
    </Routes>
  );
}
