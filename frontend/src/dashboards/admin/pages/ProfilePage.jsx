<<<<<<< HEAD
import { useState } from "react";
=======
import { useEffect, useState } from "react";
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import adminPfp from "../../../assets/admin/admin-pfp.png";

<<<<<<< HEAD
export default function ProfilePage() {
  const [adminData] = useState({
    name: "Techleng Tang",
    email: "admin@gmail.com",
    role: "Administrator",
    avatar: adminPfp,
  });

  const systemStats = [
    { title: "Total Customers", value: 11040 },
    { title: "Total Sellers", value: 474 },
    { title: "Active Sellers", value: 392 },
    { title: "Inactive Sellers", value: 70 },
    { title: "Suspended Sellers", value: 12 },
  ];

  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate("/admin/customers");
  };

  const handleLogout = () => {
    // Clear all authentication tokens
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("userToken");
    
    // Clear any other related data
    localStorage.removeItem("adminData");
    localStorage.removeItem("userData");
    
    // Redirect to login page
    window.location.href = "http://localhost:5173/login";
=======
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNSwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzczNzQxOTY4fQ.nNOHYhysqZX_RpHlM2XEtFN4vpu17h05Cy9MF7Z-1ho";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: ""
  });

  const [systemStats, setSystemStats] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  // ========================
  // FETCH ADMIN PROFILE
  // ========================
  const fetchProfile = async () => {
    const res = await fetch("http://localhost:5000/admin/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    setForm({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      phone_number: data.phone_number || "",
      role: data.role || ""
    });
  };

  // ========================
  // FETCH SYSTEM STATS
  // ========================
  const fetchStats = async () => {
    const res = await fetch("http://localhost:5000/admin/system-stats", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    setSystemStats([
      { title: "Total Customers", value: data.totalCustomers },
      { title: "Total Sellers", value: data.totalSellers },
      { title: "Active Sellers", value: data.activeSellers },
      { title: "Inactive Sellers", value: data.inactiveSellers },
      { title: "Suspended Sellers", value: data.suspendedSellers }
    ]);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ========================
  // SAVE PROFILE
  // ========================
  const handleSave = async () => {
    const res = await fetch("http://localhost:5000/admin/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      alert("Failed to update profile");
      return;
    }

    setEditing(false);

    // refresh profile from database
    fetchProfile();

    alert("Profile updated successfully");
  };

  const handleLogout = () => {
    navigate("/login");
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">

<<<<<<< HEAD
        {/* Profile Section */}
        <h1 className="text-3xl font-semibold text-gray-800">
          Profile
        </h1>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={adminData.avatar}
              alt="Admin Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {adminData.name}
              </h2>
              <p className="text-sm text-gray-500">
                {adminData.role}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Contact Information
            </h3>
            <p className="text-gray-700">
              <strong>Email:</strong> {adminData.email}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemStats.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border p-5 text-center"
=======
        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl border p-8">

          <div className="flex items-center gap-6 mb-8">

            <img
              src={adminPfp}
              alt="Admin Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />

            <div>
              <h2 className="text-2xl font-semibold">
                {form.first_name} {form.last_name}
              </h2>

              <p className="text-sm text-gray-500">
                {form.role}
              </p>
            </div>

          </div>

          <div className="space-y-4 text-sm">

            <div className="flex justify-between items-center">
              <span className="text-gray-500">First Name</span>

              {editing ? (
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-48"
                />
              ) : (
                <span className="font-medium">{form.first_name}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Last Name</span>

              {editing ? (
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-48"
                />
              ) : (
                <span className="font-medium">{form.last_name}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Email</span>

              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-48"
                />
              ) : (
                <span className="font-medium">{form.email}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phone</span>

              {editing ? (
                <input
                  type="text"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-48"
                />
              ) : (
                <span className="font-medium">
                  {form.phone_number || "-"}
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">
                {form.role}
              </span>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex gap-4">

            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 border border-black py-2 rounded font-medium hover:bg-gray-100"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 border border-black py-2 rounded font-medium hover:bg-black hover:text-white"
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            )}

          </div>

        </div>

        {/* SYSTEM STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {systemStats.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border p-6 text-center"
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
            >
              <p className="text-sm text-gray-500">
                {item.title}
              </p>
<<<<<<< HEAD
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleReturnToDashboard}
            className="flex-1 h-14 sm:h-16 rounded-xl bg-gray-300/50 text-lg sm:text-xl font-medium hover:bg-gray-300 transition"
          >
            Return to Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 h-14 sm:h-16 rounded-xl bg-red-500 text-white text-lg sm:text-xl font-medium hover:bg-red-600 transition"
          >
            Logout
          </button>
=======

              <p className="text-2xl font-bold text-gray-900 mt-2">
                {item.value}
              </p>

            </div>
          ))}

>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
        </div>

      </div>
    </DashboardLayout>
  );
}