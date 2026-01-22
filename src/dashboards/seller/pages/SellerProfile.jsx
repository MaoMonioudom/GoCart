import React from "react";
import { useNavigate } from "react-router-dom";
import SellerNav from "../components/Navbar";

const SellerProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SellerNav />

      <div className="px-4 sm:px-6 md:px-12 lg:px-24 pt-24 pb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-8">
          My Profile
        </h1>

        {/* Main Card */}
        <div className="bg-white rounded-xl p-6 sm:p-10 shadow-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gray-300 flex-shrink-0" />
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium">Seller</h2>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 sm:gap-8 mb-8">
            {[
              { label: "Products", value: "120" },
              { label: "Orders", value: "3800" },
              { label: "Rating", value: "4.5" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex-1 min-w-[140px] sm:min-w-[180px] h-28 sm:h-32 rounded-xl bg-gray-300/50 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-medium"
              >
                {stat.value} {stat.label}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="max-w-full md:max-w-[800px] mx-auto flex flex-col gap-4">
            {[
              { label: "Store Name", type: "text", placeholder: "Your Store name" },
              { label: "Email", type: "email", placeholder: "seller@example.com" },
              { label: "Phone", type: "text", placeholder: "(000) 000-0000" },
              { label: "Address", type: "text", placeholder: "Input your address" },
            ].map((field, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label className="block text-base sm:text-lg font-bold text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            ))}

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="block text-base sm:text-lg font-bold text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Write something about your store"
                className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base h-28 sm:h-32 resize-none focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Bank Details */}
            <div className="flex flex-col gap-1">
              <label className="block text-base sm:text-lg font-bold text-gray-700">
                Bank Details
              </label>
              <input
                type="text"
                placeholder="Bank details"
                className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button className="flex-1 h-16 sm:h-16 rounded-xl bg-gray-300/50 text-lg sm:text-xl font-medium hover:bg-gray-300 transition">
                Save changes
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 h-16 sm:h-16 rounded-xl bg-red-500 text-white text-lg sm:text-xl font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
