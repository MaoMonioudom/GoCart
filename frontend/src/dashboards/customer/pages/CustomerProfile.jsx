// dashboards/pages/CustomerProfile.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../../../context/AuthContext";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../../../services/productService";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [newAddress, setNewAddress] = useState({
    street_address: "",
    city_province: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddressForm, setEditAddressForm] = useState({
    street_address: "",
    city_province: "",
  });

  // Fetch addresses from API
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

  useEffect(() => {
    if (user) {
      if (user.role !== "customer") {
        navigate("/login");
      } else {
        let fName = user.first_name || "";
        let lName = user.last_name || "";
        if (!fName && !lName && user.name) {
          const names = user.name.split(" ");
          fName = names[0];
          lName = names.slice(1).join(" ");
        }

        setForm({
          first_name: fName,
          last_name: lName,
          email: user.email || "",
          phone_number: user.phone_number || "",
        });

        fetchAddresses();
      }
    } else {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/login");
      }
    }
  }, [user, navigate, fetchAddresses]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    if (!window.confirm("Are you sure you want to delete this address?")) return;
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

  const startEditAddress = (addr) => {
    setEditingAddressId(addr.address_id);
    setEditAddressForm({
      street_address: addr.street_address || "",
      city_province: addr.city_province || "",
    });
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      let fName = user.first_name || "";
      let lName = user.last_name || "";
      if (!fName && !lName && user.name) {
        const names = user.name.split(" ");
        fName = names[0];
        lName = names.slice(1).join(" ");
      }
      setForm({
        first_name: fName,
        last_name: lName,
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  };

  const handleSave = () => {
    if (!user) return;
    updateUser(form);
    setEditing(false);
    alert("Profile updated");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex justify-center items-start px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Customer Profile</h2>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                {(form.first_name || user.first_name || user.name || "?").charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {[
                { label: "First Name", name: "first_name", type: "text", value: form.first_name, display: form.first_name || "-" },
                { label: "Last Name", name: "last_name", type: "text", value: form.last_name, display: form.last_name || "-" },
                { label: "Email", name: "email", type: "email", value: form.email, display: user.email },
                { label: "Phone", name: "phone_number", type: "text", value: form.phone_number, display: user.phone_number || "-" },
              ].map(({ label, name, type, value, display }) => (
                <div key={name} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-500">{label}:</span>
                  {editing ? (
                    <input type={type} name={name} value={value} onChange={handleChange} className="border px-2 py-1 rounded w-full sm:w-48" />
                  ) : (
                    <span className="font-medium">{display}</span>
                  )}
                </div>
              ))}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500">Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4">
              {editing ? (
                <>
                  <button onClick={handleSave} className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition">Save</button>
                  <button onClick={handleCancel} className="flex-1 border border-black py-2 rounded font-medium hover:bg-gray-100 transition">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="flex-1 border border-black py-2 rounded font-medium hover:bg-black hover:text-white transition">Edit Profile</button>
                  <button onClick={handleLogout} className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition">Logout</button>
                </>
              )}
            </div>

            {!editing && (
              <div className="mt-4">
                <button onClick={() => navigate("/register-seller")} className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition">Register as Seller</button>
              </div>
            )}
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
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                              <p className="font-medium">{addr.street_address}</p>
                              {addr.city_province && <p className="text-gray-600 text-sm">{addr.city_province}</p>}
                              {addr.is_default && <span className="text-xs text-green-600 font-medium">Default Address</span>}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {!addr.is_default && <button onClick={() => handleSetDefault(addr.address_id)} className="text-xs text-blue-600 hover:text-blue-800">Set Default</button>}
                              <button onClick={() => startEditAddress(addr)} className="text-xs text-gray-600 hover:text-gray-800">Edit</button>
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

export default CustomerProfile;
