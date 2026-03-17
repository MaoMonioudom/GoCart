import { NavLink, Link } from "react-router-dom";
import Logo from "../Logo";
import adminPfp from "../../../../assets/admin/admin-pfp.png";

export default function Header() {
  return (
<<<<<<< HEAD
    <header className="h-16 bg-white border-b flex items-center px-10">
=======
    <header className="fixed top-0 left-0 w-full h-16 bg-white border-b flex items-center px-10 z-50">
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
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

<<<<<<< HEAD
        <NavLink
=======
        {/* <NavLink
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
          to="/admin/ml-insights"
          className={({ isActive }) =>
            isActive
              ? "text-black font-semibold"
              : "text-gray-400 hover:text-black"
          }
        >
          ML Insights
<<<<<<< HEAD
        </NavLink>
=======
        </NavLink> */}
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
      </nav>

      {/* RIGHT */}
      <Link to="/admin/profile" className="flex items-center gap-3">
<<<<<<< HEAD
        <span className="text-sm text-gray-600">Techleng Tang</span>
=======
        <span className="text-sm text-gray-600">Administrator</span>
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
        <img
          src= {adminPfp}
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover"
        />
      </Link>
    </header>
  );
}
