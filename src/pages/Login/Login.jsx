import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import google_icon from "../../assets/images/google-icon.png";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const accounts = [
    { 
      email: "customer@example.com", 
      password: "cust123", 
      role: "customer", 
      name: "John Customer",
      redirect: "/customer/account" 
    },
    { 
      email: "seller@example.com", 
      password: "sell123", 
      role: "seller", 
      name: "Jane Seller",
      redirect: "/seller/seller-home" 
    },
    { 
      email: "admin@example.com", 
      password: "admin123", 
      role: "admin", 
      name: "Techleng Tang",
      redirect: "/admin/sellers-management" 
    },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const matchedAccount = accounts.find(
      account => account.email === email && account.password === password
    );

    if (matchedAccount) {
      const userData = {
        email: matchedAccount.email,
        role: matchedAccount.role,
        name: matchedAccount.name,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("user", JSON.stringify(userData));
      navigate(matchedAccount.redirect);
    } else {
      alert("Invalid email or password!");
    }
  };

  const handleGoogleLogin = () => {
    const googleUser = {
      email: "googleuser@example.com",
      role: "customer",
      name: "Google User",
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("user", JSON.stringify(googleUser));
    alert("Google login successful!");
    navigate("/seller/seller-home");
    navigate("/admin/profile");
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

          {/* Email */}
          <label className="block mb-2 font-medium text-black">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />

          {/* Password */}
          <label className="block mb-2 font-medium text-black">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-6 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition mb-4"
          >
            Login
          </button>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-black text-black py-3 rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white transition mb-4"
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

          {/* Demo Credentials */}
          <div className="text-xs text-gray-600">
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: admin@example.com / admin123</p>
            <p>Seller: seller@example.com / sell123</p>
            <p>Customer: customer@example.com / cust123</p>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Login;
