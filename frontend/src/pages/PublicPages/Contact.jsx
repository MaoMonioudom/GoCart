import React, { useState } from "react";
import Nav from "../Nav/Nav";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! (This is just frontend demo)");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Nav />

      <div className="pt-24 bg-gray-50 min-h-screen">

        {/* Hero Section */}
        <section className="text-center py-16 px-6 bg-white shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Contact Us
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            We would love to hear from you! Fill out the form below or reach us directly.
          </p>
        </section>

        {/* Contact Info & Form */}
        <section className="py-16 px-6 container mx-auto max-w-4xl grid md:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">support@gocart.com</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Address</h3>
              <p className="text-gray-600">123 GoCart Street, Phnom Penh, Cambodia</p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-4 bg-white p-6 rounded-2xl shadow-md" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Send Message
            </button>
          </form>

        </section>

      </div>
    </>
  );
};

export default Contact;