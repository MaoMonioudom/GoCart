import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerHome from "../dashboards/customer/pages/CustomerHome/CustomerHome";
import SellerHome from "../dashboards/seller/pages/SellerHome";
import AdminHome from "../dashboards/admin/pages/AdminHome";

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
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
