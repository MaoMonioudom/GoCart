import React from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Nav />

      {/* Banner */}
      <section className="bg-gradient-to-br from-gray-300 to-gray-600 text-white text-center py-32 px-4">
        <h1 className="text-4xl md:text-5xl font-semibold mb-5">
          Welcome to Gocart
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Your intelligent e-commerce platform for smarter inventory management
          and personalized shopping experiences.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-black text-white px-10 py-3 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition"
        >
          Get Started
        </button>
      </section>

      {/* Features */}
      <section className="flex flex-wrap justify-center gap-8 py-20 px-4 md:px-8">
        <div className="flex-1 max-w-xs bg-white rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Smart Inventory</h3>
          <p className="text-gray-600 text-sm">
            Predict and optimize stock effortlessly to stay ahead of demand.
          </p>
        </div>
        <div className="flex-1 max-w-xs bg-white rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Personalized Shopping</h3>
          <p className="text-gray-600 text-sm">
            Tailored recommendations for each user for a fun shopping experience.
          </p>
        </div>
        <div className="flex-1 max-w-xs bg-white rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Seamless Experience</h3>
          <p className="text-gray-600 text-sm">
            Enjoy a vibrant and playful UI designed for modern users.
          </p>
        </div>
        <div className="flex-1 max-w-xs bg-white rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600 text-sm">
            Track performance and sales trends in real-time with detailed charts.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="flex flex-wrap justify-center gap-8 py-16 bg-gray-600 px-4 md:px-8">
        <div className="w-64 h-40 bg-white rounded-2xl shadow-xl flex flex-col justify-center items-center">
          <div className="text-3xl font-bold">1000+</div>
          <div className="text-lg font-semibold">Active Sellers</div>
        </div>
        <div className="w-64 h-40 bg-white rounded-2xl shadow-xl flex flex-col justify-center items-center">
          <div className="text-3xl font-bold">50,000+</div>
          <div className="text-lg font-semibold">Products Managed</div>
        </div>
        <div className="w-64 h-40 bg-white rounded-2xl shadow-xl flex flex-col justify-center items-center">
          <div className="text-3xl font-bold">98%</div>
          <div className="text-lg font-semibold">Stock Accuracy</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="flex flex-wrap justify-center gap-10 py-20 px-4 md:px-8">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl transform -rotate-3">
          <p className="text-gray-700 mb-4">
            “Gocart helped me avoid stockouts and keep my inventory optimized effortlessly!”
          </p>
          <div className="font-semibold">User 1</div>
        </div>
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl transform rotate-3">
          <p className="text-gray-700 mb-4">
            “I love the personalized recommendations – it made shopping fast and fun.”
          </p>
          <div className="font-semibold">User 2</div>
        </div>
      </section>

      {/* Pricing */}
      <section className="flex flex-wrap justify-center gap-8 py-20 bg-gray-300 px-4 md:px-8">
        <div className="max-w-xs bg-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Basic</h3>
          <p className="text-gray-600 mb-5">Essential features for new sellers.</p>
          <button className="bg-black text-white px-6 py-2 rounded-2xl font-semibold hover:bg-gray-800 transition">
            Start Free
          </button>
        </div>
        <div className="max-w-xs bg-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Pro</h3>
          <p className="text-gray-600 mb-5">Advanced analytics and recommendations.</p>
          <button className="bg-black text-white px-6 py-2 rounded-2xl font-semibold hover:bg-gray-800 transition">
            Get Pro
          </button>
        </div>
        <div className="max-w-xs bg-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Enterprise</h3>
          <p className="text-gray-600 mb-5">Full platform access for large operations.</p>
          <button className="bg-black text-white px-6 py-2 rounded-2xl font-semibold hover:bg-gray-800 transition">
            Contact Us
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
