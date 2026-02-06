import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Bell, User } from "lucide-react";
import Logo from "../../../assets/images/logo.png";

const SellerNav = ({ onSearch }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const activeClass = "font-bold text-black";
  const normalClass = "font-medium text-black hover:font-semibold";

  // Handle pressing Enter in search input
  const handleSearch = () => {
    if (onSearch) onSearch(query);
    navigate("/seller/product"); // navigate to products page
  };

  return (
    <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-10">
      {/* Logo */}
      <div className="flex items-center">
        <img src={Logo} alt="GoCart" className="h-12" />
      </div>

      {/* Center Navigation */}
      <div className="flex flex-1 items-center justify-center gap-8">
        <NavLink
          to="/seller/seller-home"
          className={({ isActive }) => (isActive ? activeClass : normalClass)}
        >
          HOME
        </NavLink>

        <NavLink
          to="/seller/product"
          className={({ isActive }) => (isActive ? activeClass : normalClass)}
        >
          PRODUCTS
        </NavLink>

        <NavLink
          to="/seller/ml-prediction"
          className={({ isActive }) => (isActive ? activeClass : normalClass)}
        >
          ML PREDICTIONS
        </NavLink>

        {/* Search Input + Icon */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-none outline-none text-sm"
          />
          <button onClick={handleSearch} className="cursor-pointer p-1">
            <Search size={18} className="text-black" />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4">
          <NavLink to="/seller/inbox">
            <ShoppingCart size={24} className="cursor-pointer text-black hover:opacity-70" />
          </NavLink>

          <Bell size={24} className="cursor-pointer text-black hover:opacity-70" />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="m-0 text-sm font-semibold">User Merchant</p>
            <p className="m-0 text-xs text-gray-500">Seller Account</p>
          </div>

          <button
            onClick={() => navigate("/seller/profile")}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <User size={24} className="text-black" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SellerNav;
