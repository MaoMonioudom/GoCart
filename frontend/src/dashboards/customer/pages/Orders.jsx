import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import { getOrders } from "../../../services/productService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successOrderId, setSuccessOrderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check for success state from checkout
    if (location.state?.success) {
      setShowSuccess(true);
      setSuccessMessage(location.state.message || "Order placed successfully!");
      setSuccessOrderId(location.state.orderId);
      
      // Clear location state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide success after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }

    fetchOrders();
  }, [location.state]);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-orange-100 text-orange-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-semibold mb-4">Please login to view your orders</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900"
          >
            Login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 pb-8">
        {/* Success Banner */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 animate-fade-in">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800">Order Placed Successfully!</h3>
              <p className="text-green-700 mt-1">{successMessage}</p>
              {successOrderId && (
                <p className="text-green-600 text-sm mt-2">Order ID: #{successOrderId}</p>
              )}
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate("/product")}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.order_id}</h3>
                    <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-semibold">${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                    {order.payment_method && (
                      <div className="border-l pl-4">
                        <p className="text-sm text-gray-500">Payment</p>
                        <p className="text-sm font-medium capitalize">
                          {order.payment_method === "cod" ? "Cash on Delivery" : 
                           order.payment_method === "aba" ? "ABA Pay" : 
                           order.payment_method === "bank" ? "Bank Transfer" : 
                           order.payment_method}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/orders/${order.order_id}`)}
                    className="text-black border border-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Success Modal - Alternative full-screen celebration */}
      {showSuccess && successOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSuccess(false)}>
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Successful!</h2>
            <p className="text-gray-600 mb-4">Thank you for your purchase</p>
            <p className="text-sm text-gray-500 mb-6">Order ID: #{successOrderId}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate("/product");
                }}
                className="flex-1 border border-black py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.9); }
          50% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Orders;