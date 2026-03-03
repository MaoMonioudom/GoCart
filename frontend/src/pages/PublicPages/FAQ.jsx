import React, { useState } from "react";
import Nav from "../Nav/Nav";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click on the Register button in the top right corner, fill in your details, and confirm your email to create an account.",
    },
    {
      question: "How can I track my orders?",
      answer:
        "Once logged in, go to your dashboard and click on 'Orders' to track your order status and history.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "GoCart supports major credit/debit cards and digital payment methods. All transactions are securely encrypted.",
    },
    {
      question: "Can I return or exchange a product?",
      answer:
        "Yes, you can request a return or exchange within 7 days of delivery. Check our Return Policy for details.",
    },
    {
      question: "How secure is my personal information?",
      answer:
        "We use role-based access and encrypted databases to ensure that your personal data is safe at all times.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach our support team via the Contact page or email us directly at support@gocart.com.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Nav />

      <div className="pt-24 bg-gray-50 min-h-screen">

        {/* Hero Section */}
        <section className="text-center py-16 px-6 bg-white shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            Answers to the most common questions about GoCart
          </p>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 container mx-auto max-w-4xl">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-gray-200 rounded-2xl bg-white shadow-sm"
            >
              <button
                className="w-full text-left p-6 flex justify-between items-center font-medium text-gray-800 focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <span className="text-indigo-600 font-bold text-xl">
                  {activeIndex === index ? "-" : "+"}
                </span>
              </button>
              {activeIndex === index && (
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </section>

      </div>
    </>
  );
};

export default FAQ;