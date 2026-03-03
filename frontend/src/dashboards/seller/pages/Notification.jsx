// Notification.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getSellerNotifications,
  updateNotificationStatus,
} from "../../../services/notificationService";
import { Bell, CheckCircle } from "lucide-react";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getSellerNotifications();

      // Map backend fields safely
      const formatted = (data || []).map((n) => ({
        id: n.id,
        product_name: n.product_name || n.product?.name || "Unknown Product",
        quantity: n.quantity ?? n.product?.quantity ?? 0,
        price: n.price ?? n.product?.price ?? 0,
        is_read: Boolean(n.is_read),
        created_at: n.created_at || n.createdAt || null,
      }));

      // Sort unread first
      formatted.sort((a, b) => (a.is_read === b.is_read ? 0 : a.is_read ? 1 : -1));
      setNotifications(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle read/unread
  const toggleReadStatus = async (id, currentStatus) => {
    try {
      // Update backend
      await updateNotificationStatus(id, !currentStatus);

      // Update frontend instantly
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, is_read: !currentStatus } : n
        );
        // Keep unread on top
        updated.sort((a, b) => (a.is_read === b.is_read ? 0 : a.is_read ? 1 : -1));
        return updated;
      });
    } catch (err) {
      console.error("Failed to update notification status", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
              <p className="text-gray-500 mt-1">
                Click a notification to mark it as read or unread
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-full">
              <Bell className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {unreadCount} Unread
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-lg">{error}</div>
          )}

          {/* Empty */}
          {!loading && !error && notifications.length === 0 && (
            <div className="bg-white shadow rounded-xl p-12 text-center">
              <Bell className="mx-auto w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No notifications yet</h3>
              <p className="text-gray-500 mt-2">
                When new orders arrive, they will appear here.
              </p>
            </div>
          )}

          {/* Notification List */}
          {!loading && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toggleReadStatus(n.id, n.is_read)}
                  className={`rounded-xl p-6 border shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                    n.is_read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    {/* Left Section */}
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {n.is_read ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Bell className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg text-gray-800">
                          New Order Received
                        </h2>
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <p>
                            <strong>Product:</strong> {n.product_name}
                          </p>
                          <p>
                            <strong>Quantity:</strong> {n.quantity}
                          </p>
                          <p>
                            <strong>Price:</strong> ${n.price.toFixed(2)}
                          </p>
                        </div>
                        {!n.is_read && (
                          <span className="inline-block mt-3 text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            UNREAD
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Date */}
                    <div className="text-sm text-gray-400">
                      {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notification;