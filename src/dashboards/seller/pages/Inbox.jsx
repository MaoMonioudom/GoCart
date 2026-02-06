import React, { useState } from "react";
import SellerNav from "../components/Navbar";

const messagesMock = [
  {
    id: 1,
    sender: "John Doe",
    subject: "Order Update",
    preview: "Your order #1234 has been shipped...",
    time: "10:45 AM",
    read: false,
  },
  {
    id: 2,
    sender: "Jane Smith",
    subject: "New Message",
    preview: "Hi! I wanted to check about your product...",
    time: "9:30 AM",
    read: true,
  },
  {
    id: 3,
    sender: "Michael Brown",
    subject: "Invoice Received",
    preview: "Please find attached your invoice...",
    time: "Yesterday",
    read: false,
  },
  {
    id: 4,
    sender: "Alice Johnson",
    subject: "Product Inquiry",
    preview: "Can you provide more details about...",
    time: "Dec 20",
    read: true,
  },
];

const Inbox = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <SellerNav />

      <div className="flex flex-wrap gap-5 px-12 py-5 max-[900px]:flex-col max-[900px]:px-5">
        {/* Messages List */}
        <div className="w-[300px] max-h-[80vh] overflow-y-auto rounded-xl border border-gray-300 bg-white shadow-sm max-[900px]:w-full max-[900px]:max-h-[300px]">
          {messagesMock.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`cursor-pointer border-b border-gray-200 p-4 transition hover:bg-gray-100
                ${selectedMessage?.id === msg.id ? "bg-gray-200" : ""}
              `}
            >
              <div className="text-sm text-gray-600">
                {msg.sender}
              </div>

              <div
                className={`mt-1 text-base ${
                  msg.read
                    ? "font-normal text-gray-800"
                    : "font-semibold text-black"
                }`}
              >
                {msg.subject}
              </div>

              <div className="mt-0.5 text-sm text-gray-500">
                {msg.preview}
              </div>

              <div className="mt-1 text-right text-xs text-gray-400">
                {msg.time}
              </div>
            </div>
          ))}
        </div>

        {/* Message Detail */}
        <div className="flex-1 min-h-[400px] rounded-xl border border-gray-300 bg-white p-6 shadow-sm max-[900px]:min-h-[300px]">
          {selectedMessage ? (
            <>
              <h2 className="mb-3 text-xl font-semibold">
                {selectedMessage.subject}
              </h2>

              <p className="mb-2 text-base">
                <strong>From:</strong> {selectedMessage.sender}
              </p>

              <p className="mb-2 text-base text-gray-700">
                {selectedMessage.preview}
              </p>

              <p className="italic text-gray-500">
                Full message content goes here...
              </p>
            </>
          ) : (
            <p className="mt-24 text-center text-base text-gray-500">
              Select a message to view details
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
