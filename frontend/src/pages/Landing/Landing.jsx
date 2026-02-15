import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-white px-4">
      {/* Logo */}
      <img src={Logo} alt="GoCart Logo" className="w-72 mb-10 md:w-80" />

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-medium text-black mb-5">
        Smarter Shopping, Smarter Selling
      </h1>

      {/* Description */}
      <p className="text-lg md:text-2xl text-gray-500 font-normal mb-12 max-w-xl">
        Predictive insights, personalized recommendations, and seamless e-commerce experiences - all in one platform.
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/home")}
        className="bg-black text-white font-semibold text-lg md:text-xl px-10 py-5 rounded-lg hover:bg-gray-800 transition"
      >
        Enter GoCart Now
      </button>
    </div>
  );
};

export default Landing;
