import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerHome from "../dashboards/customer/pages/CustomerHome";
import CustomerProduct from "../dashboards/customer/pages/CustomerProduct";
import SellerHome from "../dashboards/seller/pages/SellerHome";
import AdminHome from "../dashboards/admin/pages/AdminHome";
import CustomerPromotion from "../dashboards/customer/pages/CstomerPromotion";
import ProductDetail from "../dashboards/customer/pages/ProductDetail";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/customer" />} />

        {/* Customer */}
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/home" element={<CustomerHome />} />
        <Route path="/promotion" element={<CustomerPromotion />} />
        <Route path="/product" element={<CustomerProduct />} />

        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Seller */}
        <Route path="/seller" element={<SellerHome />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
