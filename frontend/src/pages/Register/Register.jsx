import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import google_icon from "../../assets/images/google-icon.png";

function Register() {
  const navigate = useNavigate();

  const handleGoogleRegister = () => {
    alert("Google OAuth integration will go here!");
  };

  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 py-10">
        <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

          {/* First and Last Name */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-black">First Name</label>
              <input
                type="text"
                placeholder="First Name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-black">Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Gender and DOB */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-black">Gender</label>
              <select
                required
                defaultValue=""
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium text-black">Date of Birth</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col mb-4">
            <label className="mb-1 font-medium text-black">Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col mb-6">
            <label className="mb-1 font-medium text-black">Address</label>
            <input
              type="text"
              placeholder="Enter your address"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mb-4 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Sign Up
          </button>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full py-3 mb-4 border border-black text-black rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white transition"
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
