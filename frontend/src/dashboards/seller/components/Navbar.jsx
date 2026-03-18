import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import Logo from "../../../assets/images/logo.png";
import { useAuth } from "../../../context/AuthContext";

const SellerNav = ({ onSearch }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const activeClass = "font-bold text-black";
  const normalClass = "font-medium text-black hover:font-semibold";

  const displayName = user?.seller?.shop_name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Seller");

  const handleSearch = () => {
    if (onSearch) onSearch(query);
    navigate("/seller/product");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-10">
        {/* Logo */}
        <div className="flex items-center">
          <img src={Logo} alt="GoCart" className="h-9 sm:h-12" />
        </div>

        {/* Center Nav - hidden on mobile */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8">
          <NavLink to="/seller/seller-home" className={({ isActive }) => isActive ? activeClass : normalClass}>HOME</NavLink>
          <NavLink to="/seller/product" className={({ isActive }) => isActive ? activeClass : normalClass}>PRODUCTS</NavLink>
          <NavLink to="/seller/ml-prediction" className={({ isActive }) => isActive ? activeClass : normalClass}>ML PREDICTIONS</NavLink>

          {/* Search */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border-none outline-none text-sm w-32 xl:w-40"
            />
            <button onClick={handleSearch} className="cursor-pointer p-1">
              <Search size={18} className="text-black" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-5">
          <NavLink to="/seller/notifications" className="hidden sm:block">
            <ShoppingCart size={22} className="cursor-pointer text-black hover:opacity-70" />
          </NavLink>

          <NavLink to="/seller/profile" className="hidden sm:flex items-center gap-2 hover:opacity-80">
            <div className="text-right leading-tight">
              <p className="m-0 text-sm font-semibold">{displayName}</p>
              <p className="m-0 text-xs text-gray-500">Seller Account</p>
            </div>
            <div className="rounded-full p-1 hover:bg-gray-100">
              <User size={22} className="text-black" />
            </div>
          </NavLink>

          {/* Hamburger - mobile/tablet */}
          <button className="lg:hidden p-1 rounded hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-3 flex flex-col gap-3">
          <NavLink to="/seller/seller-home" onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-2 ${isActive ? activeClass : normalClass}`}>HOME</NavLink>
          <NavLink to="/seller/product" onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-2 ${isActive ? activeClass : normalClass}`}>PRODUCTS</NavLink>
          <NavLink to="/seller/ml-prediction" onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-2 ${isActive ? activeClass : normalClass}`}>ML PREDICTIONS</NavLink>

          {/* Mobile search */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border-none outline-none text-sm flex-1"
            />
            <button onClick={handleSearch}><Search size={16} className="text-black" /></button>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <NavLink to="/seller/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
              <User size={22} className="text-black" />
              <div>
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-gray-500">Seller Account</p>
              </div>
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SellerNav;
