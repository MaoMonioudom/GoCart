import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { MdSearch } from "react-icons/md";
import Logo from "../../../assets/logos/logo.png";
import Button from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuth();
  const [query, setQuery] = useState("");
  
  // Use authUser from context, or fallback to localStorage
  const user = authUser?.role === "customer" ? authUser : null;

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    navigate(`${location.pathname}?q=${value}`);
  };

  // Customer menu items
  const menuItems = [
    { name: "Home", path: "/customer" },
    { name: "Product", path: "/product" },
    { name: "Promotion", path: "/promotion" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-[60px] bg-white flex items-center justify-between px-6 shadow-md">

      {/* LEFT: Logo */}
      <img
        src={Logo}
        alt="GoCart Logo"
        className="h-9 cursor-pointer"
        onClick={() => navigate("/home")}
      />

      {/* CENTER: Menu */}
      <div className="flex gap-5">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`font-medium px-2 py-1 border-b-2 transition
              ${location.pathname === item.path ? "border-black text-black" : "border-transparent"}`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative flex items-center">
        <MdSearch className="absolute left-2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleSearch}
          className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-full outline-none focus:border-black w-28"
        />
      </div>

      {/* Orders & Cart Icons */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Orders Icon */}
          <button
            onClick={() => navigate("/orders")}
            className={`p-2 rounded-full hover:bg-gray-100 transition relative ${
              location.pathname.startsWith("/orders") ? "bg-gray-100" : ""
            }`}
            title="My Orders"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => navigate("/cart")}
            className={`p-2 rounded-full hover:bg-gray-100 transition relative ${
              location.pathname === "/cart" ? "bg-gray-100" : ""
            }`}
            title="Shopping Cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Customer profile link */}
            <button
              onClick={() => navigate("/customer/profile")}
              className="flex items-center gap-2 font-medium cursor-pointer hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {user.first_name || user.name || "Profile"}
            </button>

            <button
              onClick={handleLogout}
              className="font-medium text-sm border border-black px-3 py-1 rounded hover:bg-black hover:text-white transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <span
              onClick={() => navigate("/login")}
              className="font-medium cursor-pointer"
            >
              Login
            </span>

            <Button
              text="Get Started"
              onClick={() => navigate("/login")}
              className="bg-black text-white px-4 py-2 rounded font-semibold"
            />
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;