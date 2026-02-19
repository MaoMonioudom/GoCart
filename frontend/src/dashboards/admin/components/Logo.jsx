import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/admin/sellers"
      className="flex items-center text-2xl font-bold tracking-tight hover:opacity-80 transition"
    >
      <span className="text-black">Gocart</span>
      <span className="text-red-500 ml-1">.</span>
    </Link>
  );
}
