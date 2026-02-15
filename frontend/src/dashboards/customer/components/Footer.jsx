import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logos/logo.png"

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-gray-300 text-black mt-8">
      {/* Footer content */}
      <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-wrap justify-between gap-8">
        
        {/* Column 1: Logo & Description */}
        <div className="flex-1 min-w-[200px]">
          <div className="cursor-pointer mb-4" onClick={() => navigate("/homecustomer")}>
            <img src={logo} alt="GoCart Logo" className="h-12" />
          </div>
          <p className="text-sm">
            Gocart is your all-in-one marketplace. Buy, sell, and explore products with ease and safety.
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-base font-medium mb-4">Navigation</h3>
          <a href="/" className="block text-sm mb-2 hover:text-gray-600">Landing</a>
          <a href="/home" className="block text-sm mb-2 hover:text-gray-600">Home</a>
          <a href="/products" className="block text-sm mb-2 hover:text-gray-600">Products</a>
          <a href="/about" className="block text-sm mb-2 hover:text-gray-600">About Us</a>
        </div>

        {/* Column 3: Support */}
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-base font-medium mb-4">Support</h3>
          <a href="/faq" className="block text-sm mb-2 hover:text-gray-600">FAQ</a>
          <a href="/help" className="block text-sm mb-2 hover:text-gray-600">Help Center</a>
          <a href="/terms" className="block text-sm mb-2 hover:text-gray-600">Terms & Privacy</a>
        </div>

        {/* Column 4: Social / Contact */}
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-base font-medium mb-4">Connect with Us</h3>
          <a href="https://www.facebook.com/share/1MPdCXfbi1/?mibextid=wwXIfr" target="_blank" className="block text-sm mb-2 hover:text-gray-600">Facebook</a>
          <a href="https://instagram.com" target="_blank" className="block text-sm mb-2 hover:text-gray-600">Instagram</a>
          <a href="mailto:support@gocart.com" className="block text-sm mb-2 hover:text-gray-600">Email</a>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="border-t border-gray-300 text-center text-gray-500 text-xs py-1">
        &copy; {new Date().getFullYear()} Gocart. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
