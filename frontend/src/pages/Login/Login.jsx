import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import google_icon from "../../assets/images/google-icon.png";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getRedirectPath = (role) => {
    switch (role) {
      case "admin": return "/admin/sellers";
      case "seller": return "/seller/seller-home";
      case "customer": return "/customer";
      default: return "/";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      const redirectPath = getRedirectPath(result.user.role);
      navigate(redirectPath);
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google OAuth integration coming soon!");
  };

  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 py-10">
        <form 
          className="w-full max-w-md bg-white p-8 rounded-lg"
          onSubmit={handleLogin}
        >
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <label className="block mb-2 font-medium text-black">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
          />

          {/* Password */}
          <label className="block mb-2 font-medium text-black">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full mb-6 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition mb-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-black text-black py-3 rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white transition mb-4 disabled:opacity-50"
          >
            <img src={google_icon} alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Footer */}
          <div className="text-center text-sm mb-4">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-black hover:text-gray-600">
              Sign Up
            </a>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Login;
