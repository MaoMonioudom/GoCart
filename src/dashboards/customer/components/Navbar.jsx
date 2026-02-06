import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { MdSearch } from "react-icons/md";
import Logo from "../../../assets/logos/logo.png";
import Button from "../../../components/common/Button";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    navigate(`${location.pathname}?q=${value}`);
  };

  const menuItems = [
    { name: "Home", path: "/home" },
    { name: "Product", path: "/product" },
    { name: "Promotion", path: "/promotion" },
    { name: "Cart", path: "/cart" },
  ];

  return (
    <nav className="h-[60px] bg-white flex items-center justify-between px-6">
      
      {/* LEFT */}
      <img src={Logo} alt="GoCart Logo" className="h-9" />

      {/* CENTER MENU */}
      <div className="flex gap-5">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`font-medium px-2 py-1 border-b-2 transition
              ${
                location.pathname === item.path
                  ? "border-black text-black"
                  : "border-transparent"
              }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative flex items-center mr-4">
        <MdSearch className="absolute left-2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleSearch}
          className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-full outline-none focus:border-black w-28"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
};

export default Navbar;
