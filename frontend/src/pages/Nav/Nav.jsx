import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logos/logo.png";
import { Menu, X } from "lucide-react";

const Nav = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="GoCart Logo" className="h-10 md:h-12" />
        </div>

        {/* Desktop Menu */}
        <ul
          className={`hidden md:flex items-center gap-8 font-medium ${
            isScrolled ? "text-gray-800" : "text-gray-900"
          }`}
        >
          <li>
            <Link to="/home" className="hover:text-indigo-600 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-indigo-600 transition">
              About
            </Link>
          </li>
          <li>
            <Link to="/blog" className="hover:text-indigo-600 transition">
              Blog
            </Link>
          </li>
          <li>
            <Link to="/faq" className="hover:text-indigo-600 transition">
              FAQ
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-indigo-600 transition">
              Contact
            </Link>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/login"
            className={`font-semibold transition hover:text-indigo-600 ${
              isScrolled ? "text-gray-800" : "text-gray-900"
            }`}
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg"
          >
            Register
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-xl border-t">
          <ul className="flex flex-col p-6 gap-4 font-medium text-gray-800">
            <li>
              <Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)}>
                Blog
              </Link>
            </li>
            <li>
              <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
            </li>

            <li className="pt-4 border-t">
              <Link
                to="/login"
                className="block text-center py-2 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </li>

            <li>
              <Link
                to="/register"
                className="block text-center bg-indigo-600 text-white py-3 rounded-lg font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Nav;