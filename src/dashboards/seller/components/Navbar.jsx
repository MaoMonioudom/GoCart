import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Bell,
  User,
} from "lucide-react";
import Logo from "../../../assets/images/logo.png";

const SellerNav = () => {
  const navigate = useNavigate();

  const activeClass =
    "font-bold text-black";

  const normalClass =
    "font-medium text-black hover:font-semibold";

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
          className={({ isActive }) =>
            isActive ? activeClass : normalClass
          }
        >
          HOME
        </NavLink>

        <NavLink
          to="/seller/product"
          className={({ isActive }) =>
            isActive ? activeClass : normalClass
          }
        >
          PRODUCTS
        </NavLink>

        <NavLink
          to="/seller/ml-prediction"
          className={({ isActive }) =>
            isActive ? activeClass : normalClass
          }
        >
          ML PREDICTIONS
        </NavLink>

        {/* Search Icon */}
        <div className="cursor-pointer rounded-lg border border-gray-300 p-2 hover:bg-gray-100">
          <Search size={18} className="text-black" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* Icons */}
        <div className="flex items-center gap-4">
          <NavLink to="/seller/inbox">
            <ShoppingCart
              size={24}
              className="cursor-pointer text-black hover:opacity-70"
            />
          </NavLink>

          <Bell
            size={24}
            className="cursor-pointer text-black hover:opacity-70"
          />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="m-0 text-sm font-semibold">
              User Merchant
            </p>
            <p className="m-0 text-xs text-gray-500">
              Seller Account
            </p>
          </div>

          <button
            onClick={() => navigate("/seller/seller-profile")}
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
