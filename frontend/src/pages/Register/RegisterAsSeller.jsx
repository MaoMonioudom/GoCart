import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../dashboards/customer/components/Navbar";
import { apiRequest } from "../../api/client";
import { parseJwt } from "../../api/client";

const RegisterAsSeller = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [sellerData, setSellerData] = useState({
    storeName: "",
    phone: "",
    address: "",
    bank: "",
    description: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.token) {
      navigate("/login");
      return;
    }

    // Only customers can upgrade via this screen
    if (parsedUser.role !== "customer") {
      navigate("/customer");
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChange = (e) => {
    setSellerData({
      ...sellerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitSeller = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await apiRequest("/auth/upgrade-to-seller", {
        method: "POST",
        body: { shop_name: sellerData.storeName || "My Shop" },
      });

      const token = resp?.token;
      const payload = token ? parseJwt(token) : null;

      const updatedUser = {
        ...user,
        token,
        role: payload?.role || "seller",
        user_id: payload?.user_id || user.user_id,
        sellerInfo: sellerData,
        isAuthenticated: true,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("You are now registered as a Seller!");
      navigate("/seller/seller-home");
    } catch (err) {
      alert(err?.message || "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">Become a Seller</h2>
            <p className="text-sm font-bold text-gray-700 mt-2">
              Fill out the form below to upgrade your account to a seller account.
            </p>
          </div>

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
              <span className="text-sm">I agree to the seller terms and conditions</span>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate("/customer-profile")}
                className="px-6 py-2 bg-gray-200 rounded-lg font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition"
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
