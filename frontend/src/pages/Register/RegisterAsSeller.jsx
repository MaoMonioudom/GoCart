//RegisterAsSeller
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../dashboards/customer/components/Navbar";


const RegisterAsSeller = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [sellerData, setSellerData] = useState({
    storeName: "",
    phone: "",
    address: "",
    bank: "",
    description: ""
  });

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

  const handleChange = (e) => {
    setSellerData({
      ...sellerData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitSeller = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      role: "seller",
      sellerInfo: sellerData
    };

    // Update current user
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Update users list
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map((u) =>
      u.email === user.email ? updatedUser : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    alert("You are now registered as a Seller!");

    navigate("/seller/seller-home");
  };

  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">
              Become a Seller
            </h2>
            <p className="text-sm font-bold text-gray-700 mt-2">
              Fill out the form below to upgrade your account to a seller account.
            </p>
          </div>

          <form onSubmit={handleSubmitSeller} className="space-y-5">

            <div>
              <label className="block text-sm font-bold mb-1">Store Name</label>
              <input
                name="storeName"
                onChange={handleChange}
                required
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Phone Number</label>
              <input
                name="phone"
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Address</label>
              <input
                name="address"
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Bank Details</label>
              <input
                name="bank"
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-xl p-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Description</label>
              <textarea
                name="description"
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
                onClick={() => navigate("/customer-profile")}
                className="px-6 py-2 bg-gray-200 rounded-lg font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
              >
                Submit Application
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
