import React from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen overflow-hidden">
      <Nav />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-36 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Smarter Commerce Starts with GoCart
          </h1>

          <p className="text-lg md:text-xl opacity-90 mb-10">
            AI-powered inventory management, personalized shopping,
            and powerful analytics — all in one platform.
          </p>

          <div className="flex justify-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/register")}
              className="border border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 blur-3xl rounded-full -z-10"></div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Powerful Features Built for Growth
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to scale your business, manage inventory,
            and deliver a premium shopping experience.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3">Smart Inventory</h3>
            <p className="text-gray-600 text-sm">
              Predict demand and prevent stockouts using intelligent tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3">Personalization</h3>
            <p className="text-gray-600 text-sm">
              Dynamic product recommendations tailored for each user.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
            <p className="text-gray-600 text-sm">
              Real-time charts, insights, and business performance tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-3">Multi-Role System</h3>
            <p className="text-gray-600 text-sm">
              Dedicated experiences for customers, sellers, and admins.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-white px-6">
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto text-center">
          <div>
            <h3 className="text-5xl font-bold text-indigo-600">1000+</h3>
            <p className="text-gray-600 mt-3">Active Sellers</p>
          </div>

          <div>
            <h3 className="text-5xl font-bold text-indigo-600">50K+</h3>
            <p className="text-gray-600 mt-3">Products Managed</p>
          </div>

          <div>
            <h3 className="text-5xl font-bold text-indigo-600">98%</h3>
            <p className="text-gray-600 mt-3">Stock Accuracy</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24 bg-gradient-to-r from-indigo-50 to-purple-50 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl italic text-gray-700 mb-6">
            “GoCart transformed the way we manage inventory and improved
            customer satisfaction dramatically.”
          </p>
          <div className="font-semibold text-indigo-600">
            — Verified Seller
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600 text-white text-center px-6">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Scale Your Business?
        </h2>
        <button
          onClick={() => navigate("/register")}
          className="bg-white text-indigo-600 px-10 py-3 rounded-full font-semibold hover:scale-105 transition"
        >
          Join GoCart Today
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
