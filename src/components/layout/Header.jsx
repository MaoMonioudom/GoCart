import { NavLink, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import LogoImg from "../../assets/images/logo.png"; // Logo in assets

export default function Header() {
  const navigate = useNavigate();

  const activeStyle = {
    fontWeight: "700",
    color: "#000",
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: "80px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* LEFT: LOGO */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={LogoImg} alt="GoCart" style={{ height: "50px" }} />
      </div>

      {/* CENTER: NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <NavLink
          to="/admin/sellers"
          end
          style={({ isActive }) =>
            isActive ? activeStyle : { color: "#000", fontWeight: 500 }
          }
        >
          SELLERS
        </NavLink>

        <NavLink
          to="/admin/customers"
          style={({ isActive }) =>
            isActive ? activeStyle : { color: "#000", fontWeight: 500 }
          }
        >
          CUSTOMERS
        </NavLink>

        <NavLink
          to="/admin/ml-insights"
          style={({ isActive }) =>
            isActive ? activeStyle : { color: "#000", fontWeight: 500 }
          }
        >
          ML INSIGHTS
        </NavLink>
      </div>

      {/* RIGHT: USER LIKE SELLER NAV */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Bell size={22} />

        <div
          className="seller-user-profile"
          onClick={() => navigate("/admin/profile")}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <div className="seller-user" style={{ textAlign: "right", lineHeight: 1.2 }}>
            <p className="user-name" style={{ margin: 0, fontSize: "14px" }}>Techleng Tang</p>
            <p className="user-role" style={{ margin: 0, fontSize: "12px", color: "#555" }}>Admin</p>
          </div>

          <img
            src="/adminpf.png"
            alt="Profile"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </nav>
  );
}
