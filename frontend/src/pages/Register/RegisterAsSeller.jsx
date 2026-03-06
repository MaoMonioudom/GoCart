import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../dashboards/customer/components/Navbar";
import { registerAsSeller } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  storeName: "",
  phone: "",
  address: "",
  bank: "",
  description: "",
};

const RegisterAsSeller = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [sellerData, setSellerData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "customer") {
        navigate(parsedUser.role === "seller" ? "/seller/seller-home" : "/login");
      }
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSellerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitSeller = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await registerAsSeller({
        shop_name: sellerData.storeName.trim(),
        shop_description: sellerData.description.trim(),
        bank_account: sellerData.bank.trim() || null,
      });

      const currentUser = user || JSON.parse(localStorage.getItem("user") || "null") || {};
      const updatedUser = {
        ...currentUser,
        role: "seller",
        token: response.token || currentUser.token,
        seller: response.seller,
        sellerInfo: {
          storeName: sellerData.storeName.trim(),
          phone: sellerData.phone.trim(),
          address: sellerData.address.trim(),
          bank: sellerData.bank.trim(),
          description: sellerData.description.trim(),
        },
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      updateUser(updatedUser);
      navigate("/seller/seller-home");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to register as seller";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user && !localStorage.getItem("user")) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">
              Become a Seller
            </h2>
            <p className="text-sm font-bold text-gray-700 mt-2">
              Fill out the form below to upgrade your account to a seller account.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitSeller} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1">Store Name</label>
              <input
                name="storeName"
                value={sellerData.storeName}
                onChange={handleChange}
                required
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Phone Number</label>
              <input
                name="phone"
                value={sellerData.phone}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Address</label>
              <input
                name="address"
                value={sellerData.address}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Bank Details</label>
              <input
                name="bank"
                value={sellerData.bank}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Description</label>
              <textarea
                name="description"
                value={sellerData.description}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-xl p-4 h-28"
              />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" required />
              <span className="text-sm">
                I agree to the seller terms and conditions
              </span>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate("/customer/profile")}
                className="px-6 py-2 bg-gray-200 rounded-lg font-bold"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition"
              disabled={submitting}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterAsSeller;
