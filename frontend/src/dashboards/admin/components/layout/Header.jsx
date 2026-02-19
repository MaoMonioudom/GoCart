import { NavLink, Link } from "react-router-dom";
import Logo from "../Logo";
import adminPfp from "../../../../assets/admin/admin-pfp.png";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center px-10">
      {/* LEFT */}
      <Logo />

      {/* CENTER NAV */}
      <nav className="mx-auto flex gap-14 text-xs uppercase tracking-widest">
        <NavLink
          to="/admin/sellers"
          className={({ isActive }) =>
            isActive
              ? "text-black font-semibold"
              : "text-gray-400 hover:text-black"
          }
        >
          Seller Management
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) =>
            isActive
              ? "text-black font-semibold"
              : "text-gray-400 hover:text-black"
          }
        >
          Customer Management
        </NavLink>

        <NavLink
          to="/admin/ml-insights"
          className={({ isActive }) =>
            isActive
              ? "text-black font-semibold"
              : "text-gray-400 hover:text-black"
          }
        >
          ML Insights
        </NavLink>
      </nav>

      {/* RIGHT */}
      <Link to="/admin/profile" className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Techleng Tang</span>
        <img
          src= {adminPfp}
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover"
        />
      </Link>
    </header>
  );
}
