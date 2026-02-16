import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logos/logo.png";
import { ShoppingCart, Menu, X } from "lucide-react";

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
        isScrolled ? "bg-white backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img src={Logo} alt="GoCart Logo" className="h-10 md:h-12" />
        </div>

        {/* Desktop Menu */}
        <ul className={`hidden md:flex items-center gap-8 font-medium ${isScrolled ? "text-gray-800" : "text-gray-900"}`}>
          <li>
            <Link to="/home" className="hover:text-indigo-600 transition relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </Link>
          </li>
          {["Features", "Pricing", "About", "Contact"].map((item) => (
            <li key={item} className="hover:text-indigo-600 transition cursor-pointer relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className={`font-semibold transition hover:text-indigo-600 ${isScrolled ? "text-gray-800" : "text-gray-900"}`}>
            Login
          </Link>

          <button
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
           <ShoppingCart className="text-gray-800" size={24} />
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-xl border-t">
          <ul className="flex flex-col p-4 gap-4">
            <li><Link to="/home" className="block py-2 text-gray-800 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
            {["Features", "Pricing", "About", "Contact"].map((item) => (
              <li key={item} className="py-2 text-gray-800 font-medium cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>{item}</li>
            ))}
            <li className="pt-4 border-t">
              <button 
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold"
                onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
              >
                Get Started
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Nav;
