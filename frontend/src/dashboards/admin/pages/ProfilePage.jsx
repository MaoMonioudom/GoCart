import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import adminPfp from "../../../assets/admin/admin-pfp.png";
import { useAuth } from "../../../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token = user?.token;

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
    if (!user?.token) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchProfile();
    fetchStats();
  }, [user?.token, user?.role]);

  // ========================
  // FETCH ADMIN PROFILE
  // ========================
  const fetchProfile = async () => {
    if (!token) return;
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
    if (!token) return;
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
    if (!token) return;
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
    logout();
    navigate("/login");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl border p-5 sm:p-8">

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <img
              src={adminPfp}
              alt="Admin Avatar"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold">
                {form.first_name} {form.last_name}
              </h2>
              <p className="text-sm text-gray-500">{form.role}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {[
              { label: "First Name", key: "first_name", type: "text" },
              { label: "Last Name", key: "last_name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone_number", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-500">{label}</span>
                {editing ? (
                  <input
                    type={type}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    className="border px-2 py-1 rounded w-full sm:w-48"
                  />
                ) : (
                  <span className="font-medium">{form[key] || "-"}</span>
                )}
              </div>
            ))}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">{form.role}</span>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4">
            {editing ? (
              <>
                <button onClick={handleSave} className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800">Save</button>
                <button onClick={() => setEditing(false)} className="flex-1 border border-black py-2 rounded font-medium hover:bg-gray-100">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex-1 border border-black py-2 rounded font-medium hover:bg-black hover:text-white">Edit Profile</button>
                <button onClick={handleLogout} className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-800">Logout</button>
              </>
            )}
          </div>

        </div>

        {/* SYSTEM STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {systemStats.map((item) => (
            <div key={item.title} className="bg-white rounded-xl border p-4 sm:p-6 text-center">
              <p className="text-xs sm:text-sm text-gray-500">{item.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}