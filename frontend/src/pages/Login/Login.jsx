import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import google_icon from "../../assets/images/google-icon.png";
import { loginApi } from "../../api/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { email: "customer@example.com", password: "cust123", role: "customer" },
    { email: "seller@example.com", password: "sell123", role: "seller" },
    { email: "admin@example.com", password: "admin123", role: "admin" },
  ];

  const handleQuickSelect = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const redirectByRole = (role) => {
    if (role === "seller") return "/seller/seller-home";
    if (role === "admin") return "/admin/sellers";
    return "/customer";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await loginApi(email, password);
      if (!userData?.token) throw new Error("Login failed");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          isAuthenticated: true,
          loginTime: new Date().toISOString(),
        })
      );

      navigate(redirectByRole(userData.role));
    } catch (err) {
      alert(err?.message || "Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder: real Google OAuth can be added later
  const handleGoogleLogin = () => {
    alert("Google login is not wired yet. Please use email/password.");
  };

  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 py-10">
        <form
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
          onSubmit={handleLogin}
        >
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

          {/* Quick-select accounts (fills inputs only) */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick Select (fills inputs):</p>
            <div className="flex gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                >
                  {acc.role.charAt(0).toUpperCase() + acc.role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <label className="block mb-2 font-medium text-black">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />

          <label className="block mb-2 font-medium text-black">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-6 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition mb-4 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-black text-black py-3 rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white transition mb-4"
          >
            <img src={google_icon} alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

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
