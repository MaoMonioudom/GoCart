import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { MdSearch, MdMenu, MdClose } from "react-icons/md";
import Logo from "../../../assets/logos/logo.png";
import Button from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const user = authUser?.role === "customer" ? authUser : null;

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    navigate(`${location.pathname}?q=${value}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Home", path: "/customer" },
    { name: "Product", path: "/product" },
    { name: "Promotion", path: "/promotion" },
  ];

  return (
    <nav className="bg-white shadow-md z-50">
      <div className="h-[60px] flex items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <img
          src={Logo}
          alt="GoCart Logo"
          className="h-8 sm:h-9 cursor-pointer flex-shrink-0"
          onClick={() => navigate("/home")}
        />

        {/* Center Menu — hidden on mobile */}
        <div className="hidden md:flex gap-3 lg:gap-5">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`font-medium px-2 py-1 border-b-2 transition text-sm
                ${location.pathname === item.path ? "border-black text-black" : "border-transparent"}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Search — hidden on small screens */}
        <div className="hidden sm:flex relative items-center">
          <MdSearch className="absolute left-2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={handleSearch}
            className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-full outline-none focus:border-black w-24 lg:w-28"
          />
        </div>

        {/* Orders & Cart — hidden on mobile */}
        {user && (
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => navigate("/orders")} className="p-2 rounded-full hover:bg-gray-100 transition" title="My Orders">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
            <button onClick={() => navigate("/cart")} className="p-2 rounded-full hover:bg-gray-100 transition" title="Shopping Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        )}

        {/* Auth — hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => navigate("/customer/profile")} className="flex items-center gap-1 font-medium text-sm cursor-pointer hover:text-gray-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user.first_name || user.name || "Profile"}
              </button>
              <button onClick={handleLogout} className="font-medium text-sm border border-black px-3 py-1 rounded hover:bg-black hover:text-white transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <span onClick={() => navigate("/login")} className="font-medium cursor-pointer text-sm">Login</span>
              <Button text="Get Started" onClick={() => navigate("/login")} className="bg-black text-white px-3 py-1.5 rounded font-semibold text-sm" />
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button className="md:hidden p-1 rounded hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-2">
          {/* Search */}
          <div className="relative flex items-center mb-1">
            <MdSearch className="absolute left-3 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={handleSearch}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-full outline-none focus:border-black w-full"
            />
          </div>

          {/* Nav links */}
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => { navigate(item.path); setMenuOpen(false); }}
              className={`font-medium py-2 text-left border-b border-gray-100 text-sm ${location.pathname === item.path ? "text-black font-semibold" : "text-gray-600"}`}
            >
              {item.name}
            </button>
          ))}

          {/* Orders & Cart */}
          {user && (
            <div className="flex gap-4 py-2">
              <button onClick={() => { navigate("/orders"); setMenuOpen(false); }} className="flex items-center gap-1 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                Orders
              </button>
              <button onClick={() => { navigate("/cart"); setMenuOpen(false); }} className="flex items-center gap-1 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
                </svg>
                Cart
              </button>
            </div>
          )}

          {/* Auth */}
          <div className="border-t pt-2">
            {user ? (
              <div className="flex gap-2">
                <button onClick={() => { navigate("/customer/profile"); setMenuOpen(false); }} className="flex-1 text-sm font-medium py-2 border border-gray-300 rounded">Profile</button>
                <button onClick={handleLogout} className="flex-1 text-sm font-medium py-2 bg-black text-white rounded">Logout</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="flex-1 text-sm font-medium py-2 border border-black rounded">Login</button>
                <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="flex-1 text-sm font-medium py-2 bg-black text-white rounded">Get Started</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
