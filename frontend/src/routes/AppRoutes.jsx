import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// CUSTOMER
import CustomerHome from "../dashboards/customer/pages/CustomerHome/CustomerHome";

// SELLER
import SellerHome from "../dashboards/seller/pages/SellerHome";

// ADMIN 
import CustomerManagement from "../dashboards/admin/pages/CustomerManagement";
import SellerManagement from "../dashboards/admin/pages/SellerManagement";
import MLInsights from "../dashboards/admin/pages/MLInsights";
import ProfilePage from "../dashboards/admin/pages/ProfilePage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/customer" />} />

        {/* Customer */}
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/home" element={<CustomerHome />} />

        {/* Seller */}
        <Route path="/seller" element={<SellerHome />} />

        {/* Admin */}
        <Route path="/admin/sellers" element={<SellerManagement />} />
        <Route path="/admin/customers" element={<CustomerManagement />} />
        <Route path="/admin/ml-insights" element={<MLInsights />} />
        <Route path="/admin/profile" element={<ProfilePage />} />


      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
