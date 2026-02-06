import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerNav from "../components/Navbar";

const SellerProfile = () => {
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState({
    storeName: "Your Store name",
    email: "seller@example.com",
    phone: "(000) 000-0000",
    address: "Input your address",
    description: "Write something about your store",
    bankDetails: "Bank details"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSellerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    navigate("/login");
  };

  const handleSaveChanges = () => {
    // In a real app, save to API
    console.log("Saving changes:", sellerData);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SellerNav />

      {/* Increased left and right padding */}
      <div className="px-6 sm:px-10 md:px-16 lg:px-32 xl:px-48 pt-24 pb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-8">
          My Profile
        </h1>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-md">
          {/* Header */}
          <div className="px-6 sm:px-10 md:px-12 pt-8 sm:pt-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gray-300 flex-shrink-0" />
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium">Seller</h2>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 sm:px-10 md:px-12 mb-8">
            <div className="flex flex-wrap gap-4 sm:gap-8">
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
          </div>

          {/* Form */}
          <div className="px-6 sm:px-10 md:px-12 pb-8 sm:pb-10">
            <div className="flex flex-col gap-6">
              {/* Store Name - Long Box */}
              <div className="flex flex-col">
                <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
                  Store Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="storeName"
                    value={sellerData.storeName}
                    onChange={handleInputChange}
                    placeholder="Your Store name"
                    className="w-full p-4 sm:p-5 border border-gray-400 rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-black pr-12"
                    style={{ height: '56px' }}
                  />
                  {/* Optional: Add a store icon */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                {/* Optional helper text */}
                <p className="text-sm text-gray-500 mt-2">
                  Enter your complete store name as customers will see it
                </p>
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={sellerData.email}
                  onChange={handleInputChange}
                  placeholder="seller@example.com"
                  className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={sellerData.phone}
                  onChange={handleInputChange}
                  placeholder="(000) 000-0000"
                  className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col">
                <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={sellerData.address}
                  onChange={handleInputChange}
                  placeholder="Input your address"
                  className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={sellerData.description}
                  onChange={handleInputChange}
                  placeholder="Write something about your store"
                  className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base h-28 sm:h-32 resize-none focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Bank Details */}
              <div className="flex flex-col">
                <label className="block text-base sm:text-lg font-bold text-gray-700 mb-2">
                  Bank Details
                </label>
                <input
                  type="text"
                  name="bankDetails"
                  value={sellerData.bankDetails}
                  onChange={handleInputChange}
                  placeholder="Bank details"
                  className="w-full p-3 sm:p-4 border border-gray-400 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button 
                  onClick={handleSaveChanges}
                  className="flex-1 h-16 sm:h-16 rounded-xl bg-gray-300/50 text-lg sm:text-xl font-medium hover:bg-gray-300 transition"
                >
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
    </div>
  );
};

export default SellerProfile;