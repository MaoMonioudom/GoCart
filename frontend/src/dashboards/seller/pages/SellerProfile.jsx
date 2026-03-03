import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SellerNav from "../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { getProfile, updateProfile, updateSellerProfile, getSellerStatistics } from "../../../services/authService";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../../../services/productService";

const SellerProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statistics, setStatistics] = useState({
    product_count: 0,
    order_count: 0,
    average_rating: 0
  });
  
  // User profile form
  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: ""
  });
  
  // Seller profile form
  const [sellerForm, setSellerForm] = useState({
    shop_name: "",
    shop_description: "",
    bank_account: ""
  });

  // Address management
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [newAddress, setNewAddress] = useState({
    street_address: "",
    city_province: ""
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddressForm, setEditAddressForm] = useState({
    street_address: "",
    city_province: ""
  });

  // Fetch seller statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const data = await getSellerStatistics();
      setStatistics(data.statistics || { product_count: 0, order_count: 0, average_rating: 0 });
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  }, []);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const data = await getAddresses();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      const userData = data.user;
      
      setUserForm({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || ""
      });
      
      if (userData.seller) {
        setSellerForm({
          shop_name: userData.seller.shop_name || "",
          shop_description: userData.seller.shop_description || "",
          bank_account: userData.seller.bank_account || ""
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role !== "seller") {
        navigate("/login");
      } else {
        fetchProfile();
        fetchStatistics();
        fetchAddresses();
      }
    } else {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/login");
      }
    }
  }, [user, navigate, fetchProfile, fetchStatistics, fetchAddresses]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleSellerChange = (e) => {
    setSellerForm({ ...sellerForm, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Update user profile
      await updateProfile({
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        phone_number: userForm.phone_number
      });
      
      // Update seller profile
      await updateSellerProfile(sellerForm);
      
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Address handlers
  const handleAddAddress = async () => {
    if (!newAddress.street_address.trim()) {
      alert("Please enter a street address");
      return;
    }
    try {
      await addAddress(newAddress);
      await fetchAddresses();
      setNewAddress({ street_address: "", city_province: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add address");
    }
  };

  const handleUpdateAddress = async (addressId) => {
    if (!editAddressForm.street_address.trim()) {
      alert("Please enter a street address");
      return;
    }
    try {
      await updateAddress(addressId, editAddressForm);
      await fetchAddresses();
      setEditingAddressId(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(addressId);
      await fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await updateAddress(addressId, { is_default: true });
      await fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to set default address");
    }
  };

  const startEditingAddress = (address) => {
    setEditingAddressId(address.address_id);
    setEditAddressForm({
      street_address: address.street_address || "",
      city_province: address.city_province || ""
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerNav />
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SellerNav />
      <div className="min-h-screen bg-gray-50 flex justify-center items-start px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Seller Profile</h2>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                {(sellerForm.shop_name || userForm.first_name || "S").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center px-4 py-3 rounded-lg bg-blue-50">
                <span className="text-xl font-bold text-blue-600">{statistics.product_count}</span>
                <p className="text-xs text-gray-600">Products</p>
              </div>
              <div className="text-center px-4 py-3 rounded-lg bg-green-50">
                <span className="text-xl font-bold text-green-600">{statistics.order_count}</span>
                <p className="text-xs text-gray-600">Orders</p>
              </div>
              <div className="text-center px-4 py-3 rounded-lg bg-yellow-50">
                <span className="text-xl font-bold text-yellow-600">{statistics.average_rating || "N/A"}</span>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Store Name:</span>
                <input type="text" name="shop_name" value={sellerForm.shop_name} onChange={handleSellerChange} className="border px-2 py-1 rounded w-48 text-right" placeholder="Your store name" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">First Name:</span>
                <input type="text" name="first_name" value={userForm.first_name} onChange={handleUserChange} className="border px-2 py-1 rounded w-48 text-right" placeholder="First name" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Last Name:</span>
                <input type="text" name="last_name" value={userForm.last_name} onChange={handleUserChange} className="border px-2 py-1 rounded w-48 text-right" placeholder="Last name" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{userForm.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Phone:</span>
                <input type="text" name="phone_number" value={userForm.phone_number} onChange={handleUserChange} className="border px-2 py-1 rounded w-48 text-right" placeholder="Phone number" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Bank Account:</span>
                <input type="text" name="bank_account" value={sellerForm.bank_account} onChange={handleSellerChange} className="border px-2 py-1 rounded w-48 text-right" placeholder="Bank details" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <span className="font-medium capitalize">Seller</span>
              </div>
            </div>

            {/* Store Description */}
            <div className="mt-4">
              <label className="text-gray-500 text-sm block mb-1">Store Description:</label>
              <textarea
                name="shop_description"
                value={sellerForm.shop_description}
                onChange={handleSellerChange}
                placeholder="Write something about your store"
                className="w-full border px-3 py-2 rounded text-sm h-20 resize-none"
              />
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={handleSaveChanges} disabled={saving} className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={handleLogout} className="flex-1 border border-black py-2 rounded font-medium hover:bg-gray-100 transition">Logout</button>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold mb-4">My Addresses</h3>

            {loadingAddresses ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
              </div>
            ) : (
              <>
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-4">No addresses added yet.</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {addresses.map((addr) => (
                      <div key={addr.address_id} className={`p-4 rounded-lg border ${addr.is_default ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                        {editingAddressId === addr.address_id ? (
                          <div className="space-y-2">
                            <input type="text" value={editAddressForm.street_address} onChange={(e) => setEditAddressForm({ ...editAddressForm, street_address: e.target.value })} placeholder="Street Address" className="w-full border px-3 py-2 rounded text-sm" />
                            <input type="text" value={editAddressForm.city_province} onChange={(e) => setEditAddressForm({ ...editAddressForm, city_province: e.target.value })} placeholder="City/Province" className="w-full border px-3 py-2 rounded text-sm" />
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateAddress(addr.address_id)} className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800">Save</button>
                              <button onClick={() => setEditingAddressId(null)} className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-100">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{addr.street_address}</p>
                              {addr.city_province && <p className="text-gray-600 text-sm">{addr.city_province}</p>}
                              {addr.is_default && <span className="text-xs text-green-600 font-medium">Default Address</span>}
                            </div>
                            <div className="flex gap-2">
                              {!addr.is_default && <button onClick={() => handleSetDefault(addr.address_id)} className="text-xs text-blue-600 hover:text-blue-800">Set Default</button>}
                              <button onClick={() => startEditingAddress(addr)} className="text-xs text-gray-600 hover:text-gray-800">Edit</button>
                              <button onClick={() => handleDeleteAddress(addr.address_id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add New Address</h4>
                  <div className="space-y-2">
                    <input type="text" value={newAddress.street_address} onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })} placeholder="Street Address *" className="w-full border px-3 py-2 rounded text-sm" />
                    <input type="text" value={newAddress.city_province} onChange={(e) => setNewAddress({ ...newAddress, city_province: e.target.value })} placeholder="City/Province" className="w-full border px-3 py-2 rounded text-sm" />
                    <button onClick={handleAddAddress} className="w-full bg-black text-white py-2 rounded text-sm font-medium hover:bg-gray-800">Add Address</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerProfile;