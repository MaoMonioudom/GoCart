import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdSearch } from "react-icons/md";
import Logo from "../../../assets/logos/logo.png";
import Button from "../../../components/common/Button";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);

  // Load login state
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === "customer") setUser(parsed);
    }
  }, []);

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

  if (user) menuItems.push({ name: "Cart", path: "/cart" });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
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
        {user ? (
          <>
            {/* Customer profile link */}
            <button
              onClick={() => navigate("/customer/profile")}
              className="font-medium cursor-pointer"
            >
                {user.name}
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
