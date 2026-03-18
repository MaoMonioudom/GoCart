import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import Logo from "../Logo";
import adminPfp from "../../../../assets/admin/admin-pfp.png";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b z-50">
      <div className="flex items-center h-16 px-4 sm:px-10">
        {/* LEFT */}
        <Logo />

        {/* CENTER NAV - hidden on mobile */}
        <nav className="hidden md:flex mx-auto gap-8 lg:gap-14 text-xs uppercase tracking-widest">
          <NavLink
            to="/admin/sellers"
            className={({ isActive }) =>
              isActive ? "text-black font-semibold" : "text-gray-400 hover:text-black"
            }
          >
            Seller Management
          </NavLink>
          <NavLink
            to="/admin/customers"
            className={({ isActive }) =>
              isActive ? "text-black font-semibold" : "text-gray-400 hover:text-black"
            }
          >
            Customer Management
          </NavLink>
        </nav>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-3">
          <Link to="/admin/profile" className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">Administrator</span>
            <img src={adminPfp} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
          </Link>

          {/* Hamburger - mobile only */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3 text-xs uppercase tracking-widest">
          <NavLink
            to="/admin/sellers"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? "text-black font-semibold py-2" : "text-gray-400 hover:text-black py-2"
            }
          >
            Seller Management
          </NavLink>
          <NavLink
            to="/admin/customers"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? "text-black font-semibold py-2" : "text-gray-400 hover:text-black py-2"
            }
          >
            Customer Management
          </NavLink>
        </div>
      )}
    </header>
  );
}
