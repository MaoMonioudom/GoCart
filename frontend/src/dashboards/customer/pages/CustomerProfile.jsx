// dasboards/pages/CustomerProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "customer") {
        navigate("/login");
      } else {
        setUser(parsedUser);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          
          <h2 className="text-2xl font-bold mb-6 text-center">
            Customer Profile
          </h2>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{user.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Role:</span>
              <span className="font-medium capitalize">{user.role}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Login Time:</span>
              <span className="font-medium">
                {new Date(user.loginTime).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Register Button */}
          {user.role === "customer" && (
            <button
              onClick={() => navigate("/register-seller")}
              className="w-full mt-6 bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition"
            >
              Register as Seller
            </button>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/customer")}
              className="flex-1 border border-black py-2 rounded font-medium hover:bg-black hover:text-white transition"
            >
              Back to Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProfile;
