import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, User } from "lucide-react";
import Logo from "../../../assets/images/logo.png";

const AdminNav = () => {
  const navigate = useNavigate();

  const activeClass = "font-bold text-black";
  const normalClass = "font-medium text-black hover:font-semibold";

  return (
    <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-10">
      {/* Logo */}
      <div className="flex items-center">
        <img src={Logo} alt="GoCart" className="h-12" />
      </div>

      {/* Center Navigation */}
      <div className="flex flex-1 items-center justify-center gap-8">
        <NavLink
          to="/admin/sellers-management"
          className={({ isActive }) =>
            isActive ? activeClass : normalClass
          }
        >
          SELLERS
        </NavLink>

        <NavLink
          to="/admin/customers-management"
          className={({ isActive }) =>
            isActive ? activeClass : normalClass
          }
        >
          CUSTOMERS
        </NavLink>

        <NavLink
          to="/admin/ml-insights"
          className={({ isActive }) =>
            isActive ? activeClass : normalClass
          }
        >
          ML INSIGHTS
        </NavLink>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* Icons */}
        <Bell
          size={24}
          className="cursor-pointer text-black hover:opacity-70"
        />

        {/* Admin Info */}
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="m-0 text-sm font-semibold">
              Admin User
            </p>
            <p className="m-0 text-xs text-gray-500">
              Admin Account
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/admin-profile")}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <User size={24} className="text-black" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;
