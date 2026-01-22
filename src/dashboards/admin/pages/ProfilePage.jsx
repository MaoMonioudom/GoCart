import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function ProfilePage() {
  const [adminData, setAdminData] = useState({
    name: "Techleng Tang",
    email: "admin@gmail.com",
    role: "Administrator",
    avatar: "/adminpf.png",
  });

  // Mock data for system stats
  const systemStats = [
    { title: "Total Customers", value: 11040 },
    { title: "Total Sellers", value: 474 },
    { title: "Active Sellers", value: 392 },
    { title: "Inactive Sellers", value: 70 },
    { title: "Suspended Sellers", value: 12 },
  ];

  // Initialize the useNavigate hook
  const navigate = useNavigate();

  // Function to navigate back to the dashboard
  const handleReturnToDashboard = () => {
    navigate("/"); // Navigate to the dashboard ("/" path)
  };

  return (
    <div className="container mx-auto p-6">
      {/* Profile Section */}
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center mb-6">
          <img
            src={adminData.avatar}
            alt="Admin Avatar"
            className="w-24 h-24 rounded-full mr-6"
          />
          <div>
            <h2 className="text-2xl font-semibold">{adminData.name}</h2>
            <p className="text-sm text-gray-500">{adminData.role}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Contact Information</h3>
          <p>
            <strong>Email:</strong> {adminData.email}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {systemStats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-lg p-5 shadow-md flex flex-col items-center justify-center"
          >
            <h3 className="text-xl font-semibold text-gray-700">{item.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Return to Dashboard Button */}
      <div className="mt-6">
        <button
          onClick={handleReturnToDashboard}
          className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
