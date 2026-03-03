import React from "react";
import Nav from "../Nav/Nav";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Online Shopping Tips",
      description:
        "Discover smart strategies to save money and shop safely online.",
      date: "March 10, 2026",
    },
    {
      id: 2,
      title: "How GoCart Ensures Secure Payments",
      description:
        "Learn how our authentication and system design protect your transactions.",
      date: "March 15, 2026",
    },
    {
      id: 3,
      title: "Why Online Shopping is the Future",
      description:
        "Explore how digital commerce is transforming global markets.",
      date: "March 20, 2026",
    },
    {
      id: 4,
      title: "Managing Your Orders Easily",
      description:
        "Track, manage, and review your purchases in a few simple steps.",
      date: "March 25, 2026",
    },
    {
      id: 5,
      title: "The Importance of Role-Based Systems",
      description:
        "Understand how secure access control improves platform safety.",
      date: "April 1, 2026",
    },
    {
      id: 6,
      title: "Building a Modern E-Commerce Platform",
      description:
        "A behind-the-scenes look at the technology powering GoCart.",
      date: "April 5, 2026",
    },
  ];

  return (
    <>
      <Nav />

      <div className="pt-24 bg-gray-50 min-h-screen">

        {/* Hero Section */}
        <section className="text-center py-16 px-6 bg-white shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            GoCart Blog
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            Insights, tips, and updates about online shopping and digital commerce
          </p>
        </section>

        {/* Blog Grid */}
        <section className="py-16 px-6 container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.description}
                  </p>
                  <button className="text-indigo-600 font-semibold hover:underline">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
};

export default Blog;