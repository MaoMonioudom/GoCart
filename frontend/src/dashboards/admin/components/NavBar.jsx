import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, User, Menu, X } from "lucide-react";
import Logo from "../../../assets/images/logo.png";

const AdminNav = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeClass = "font-bold text-black";
  const normalClass = "font-medium text-black hover:font-semibold";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-10">
        {/* Logo */}
        <div className="flex items-center">
          <img src={Logo} alt="GoCart" className="h-9 sm:h-12" />
        </div>

        {/* Center Navigation - hidden on mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8">
          <NavLink to="/admin/sellers-management" className={({ isActive }) => isActive ? activeClass : normalClass}>SELLERS</NavLink>
          <NavLink to="/admin/customers-management" className={({ isActive }) => isActive ? activeClass : normalClass}>CUSTOMERS</NavLink>
          <NavLink to="/admin/ml-insights" className={({ isActive }) => isActive ? activeClass : normalClass}>ML INSIGHTS</NavLink>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Bell size={22} className="cursor-pointer text-black hover:opacity-70" />
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="m-0 text-sm font-semibold">Admin User</p>
              <p className="m-0 text-xs text-gray-500">Admin Account</p>
            </div>
            <button onClick={() => navigate("/admin/admin-profile")} className="rounded-full p-1 hover:bg-gray-100">
              <User size={24} className="text-black" />
            </button>
          </div>
          {/* Mobile hamburger */}
          <button className="md:hidden p-1 rounded hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3">
          <NavLink to="/admin/sellers-management" onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-2 ${isActive ? activeClass : normalClass}`}>SELLERS</NavLink>
          <NavLink to="/admin/customers-management" onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-2 ${isActive ? activeClass : normalClass}`}>CUSTOMERS</NavLink>
          <NavLink to="/admin/ml-insights" onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-2 ${isActive ? activeClass : normalClass}`}>ML INSIGHTS</NavLink>
          <div className="flex items-center gap-3 pt-2 border-t">
            <button onClick={() => { navigate("/admin/admin-profile"); setMenuOpen(false); }} className="rounded-full p-1 hover:bg-gray-100">
              <User size={22} className="text-black" />
            </button>
            <div>
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-gray-500">Admin Account</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNav;
