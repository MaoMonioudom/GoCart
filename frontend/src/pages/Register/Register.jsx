import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import google_icon from "../../assets/images/google-icon.png";
import { registerApi } from "../../api/auth";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = () => {
    alert("Google OAuth integration is not wired yet.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerApi({ email, password, role: "customer" });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 py-10">
        <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-center mb-6">Register (Customer)</h2>

          {/* Email */}
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex flex-col mb-6">
            <label className="mb-1 font-medium text-black">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mb-4 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full py-3 mb-4 border border-black text-black rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white transition"
          >
            <img src={google_icon} alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

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
