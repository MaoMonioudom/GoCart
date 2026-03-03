import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import google_icon from "../../assets/images/google-icon.png";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    alert("Google OAuth integration coming soon!");
  };

  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 py-10">
        <form className="w-full max-w-md bg-white p-8 rounded-lg" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* First and Last Name */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-black">First Name</label>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-black">Last Name</label>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col mb-6">
            <label className="mb-1 font-medium text-black">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              placeholder="Enter your phone number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mb-4 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full py-3 mb-4 border border-black text-black rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white transition disabled:opacity-50"
          >
            <img src={google_icon} alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Footer */}
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-black hover:text-gray-600">
              Login
            </a>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Register;
