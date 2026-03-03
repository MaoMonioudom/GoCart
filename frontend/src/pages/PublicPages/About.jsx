import React from "react";
import Nav from "../Nav/Nav";

const About = () => {
  return (
    <>
      <Nav />

      <div className="pt-24 bg-gray-50 min-h-screen">
        
        {/* Hero Section */}
        <section className="text-center py-16 px-6 bg-white shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            About GoCart
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            A Modern E-Commerce Platform Designed for Smart and Secure Online Shopping
          </p>
        </section>

        {/* Who We Are */}
        <section className="py-16 px-6 container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              GoCart is a modern web-based e-commerce platform developed to simplify
              online shopping and digital store management. The system provides a
              seamless experience for customers while offering structured management
              tools for administrators. Our goal is to build a secure, efficient,
              and user-friendly online shopping environment.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-white px-6">
          <div className="container mx-auto grid md:grid-cols-2 gap-12">
            
            <div className="bg-indigo-50 p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-bold text-indigo-700 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To create a reliable and accessible e-commerce platform that enhances
                the online shopping experience through simplicity, transparency,
                and security.
              </p>
            </div>

            <div className="bg-indigo-50 p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-bold text-indigo-700 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To become a smart digital commerce solution that supports both
                customers and businesses in the growing digital economy.
              </p>
            </div>

          </div>
        </section>

        {/* Why Choose GoCart */}
        <section className="py-16 px-6 container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose GoCart?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
              <h4 className="text-xl font-semibold text-indigo-600 mb-3">
                Secure Authentication
              </h4>
              <p className="text-gray-600">
                Role-based login system ensuring secure access and user protection.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
              <h4 className="text-xl font-semibold text-indigo-600 mb-3">
                Fast & Responsive
              </h4>
              <p className="text-gray-600">
                Optimized design for smooth performance across all devices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
              <h4 className="text-xl font-semibold text-indigo-600 mb-3">
                Structured Management
              </h4>
              <p className="text-gray-600">
                Organized dashboard for managing products, users, and orders.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
              <h4 className="text-xl font-semibold text-indigo-600 mb-3">
                User-Friendly Experience
              </h4>
              <p className="text-gray-600">
                Simple navigation and clean interface for enjoyable shopping.
              </p>
            </div>

          </div>
        </section>

        {/* System Overview */}
        <section className="py-16 bg-indigo-600 text-white px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">
              System Overview
            </h2>
            <p className="leading-relaxed text-lg">
              GoCart is developed using modern web technologies including React for
              frontend development, a structured backend API system, and a secure
              database architecture. The platform separates public pages and
              authenticated dashboards to ensure better security, scalability,
              and maintainability.
            </p>
          </div>
        </section>

      </div>
    </>
  );
};

export default About;