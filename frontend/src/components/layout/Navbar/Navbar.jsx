import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../../assets/logos/logo.png";
import Button from "../../common/Button/Button";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // get current route

  const menuItems = [
    { name: "Home", path: "/home" },
    { name: "Product", path: "/product" },
    { name: "Promotion", path: "/promotion" },
    { name: "Cart", path: "/cart" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={Logo} alt="GoCart Logo" className="nav-logo" />
      </div>

      <div className="nav-menu">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`nav-menu-button ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="nav-right">
        <span className="login" onClick={() => navigate("/login")}>
          Login
        </span>

        <Button
          text="Get Started"
          onClick={() => navigate("/login")}
          className="nav-button"
        />
      </div>
    </nav>
  );
};

export default Navbar;
