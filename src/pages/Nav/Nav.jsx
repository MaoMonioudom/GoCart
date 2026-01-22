import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.png";

const Nav = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between h-24 px-6 md:px-12 border-b border-gray-300 bg-white">
      {/* Logo */}
      <div className="flex items-center">
        <img src={Logo} alt="GoCart Logo" className="h-12" />
      </div>

      {/* Menu */}
      <ul className="hidden md:flex items-center gap-8 font-semibold text-gray-900">
        <li>
          <Link to="/home" className="hover:text-gray-600 transition">
            Home
          </Link>
        </li>
        <li className="hover:text-gray-600 transition cursor-pointer">Features</li>
        <li className="hover:text-gray-600 transition cursor-pointer">Pricing</li>
        <li className="hover:text-gray-600 transition cursor-pointer">About</li>
        <li className="hover:text-gray-600 transition cursor-pointer">Contact</li>
      </ul>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Login */}
        <span
          className="cursor-pointer font-medium text-lg text-gray-900 hover:text-gray-600 transition"
          onClick={() => navigate("/login")}
        >
          Login
        </span>

        {/* Get Started button */}
        <button
          className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800 transition"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Nav;
