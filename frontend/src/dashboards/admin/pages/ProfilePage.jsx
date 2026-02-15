import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import adminPfp from "../../../assets/admin/admin-pfp.png";

export default function ProfilePage() {
  const [adminData] = useState({
    name: "Techleng Tang",
    email: "admin@gmail.com",
    role: "Administrator",
    avatar: adminPfp,
  });

  const systemStats = [
    { title: "Total Customers", value: 11040 },
    { title: "Total Sellers", value: 474 },
    { title: "Active Sellers", value: 392 },
    { title: "Inactive Sellers", value: 70 },
    { title: "Suspended Sellers", value: 12 },
  ];

  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate("/admin/customers");
  };

  const handleLogout = () => {
    // Clear all authentication tokens
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("userToken");
    
    // Clear any other related data
    localStorage.removeItem("adminData");
    localStorage.removeItem("userData");
    
    // Redirect to login page
    window.location.href = "http://localhost:5173/login";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Profile Section */}
        <h1 className="text-3xl font-semibold text-gray-800">
          Profile
        </h1>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={adminData.avatar}
              alt="Admin Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {adminData.name}
              </h2>
              <p className="text-sm text-gray-500">
                {adminData.role}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Contact Information
            </h3>
            <p className="text-gray-700">
              <strong>Email:</strong> {adminData.email}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemStats.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border p-5 text-center"
            >
              <p className="text-sm text-gray-500">
                {item.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleReturnToDashboard}
            className="flex-1 h-14 sm:h-16 rounded-xl bg-gray-300/50 text-lg sm:text-xl font-medium hover:bg-gray-300 transition"
          >
            Return to Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 h-14 sm:h-16 rounded-xl bg-red-500 text-white text-lg sm:text-xl font-medium hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}