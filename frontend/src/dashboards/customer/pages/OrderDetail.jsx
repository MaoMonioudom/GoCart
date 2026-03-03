import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import { getOrder, cancelOrder } from "../../../services/productService";

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await getOrder(orderId);
      setOrder(response.order);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setCancelling(true);
    try {
      await cancelOrder(orderId);
      fetchOrder(); // Refresh order data
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError(err.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "shipped": return "bg-blue-100 text-blue-800 border-blue-300";
      case "delivered": return "bg-green-100 text-green-800 border-green-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "unpaid": return "bg-orange-100 text-orange-800";
      case "refunded": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "cod": return "Cash on Delivery";
      case "aba": return "ABA Pay";
      case "bank": return "Bank Transfer";
      default: return method || "N/A";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-semibold mb-4">Please login to view order details</h2>
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

  if (error || !order) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-4">{error || "Order not found"}</h2>
          <button
            onClick={() => navigate("/orders")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900"
          >
            Back to Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_id}</h1>
              <p className="text-gray-500 mt-1">{formatDate(order.date)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          {/* Cancel Button */}
          {order.status === "pending" && (
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  "Cancel Order"
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items ({order.items?.length || 0})</h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div 
                    key={item.item_id || index} 
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                  >
                    <img
                      src={item.product_image || "/placeholder.png"}
                      alt={item.product_name || "Product"}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 hover:underline">
                        {item.product_name || `Product #${item.product_id}`}
                      </h3>
                      {item.product_description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {item.product_description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          Qty: <span className="font-medium">{item.quantity}</span>
                        </span>
                        <span className="text-gray-600">
                          @ ${parseFloat(item.unit_price).toFixed(2)} each
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="text-lg font-bold text-gray-900">
                        ${parseFloat(item.final_price).toFixed(2)}
                      </p>
                      {item.promo_id && (
                        <span className="text-xs text-green-600 font-medium">Promo Applied</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h2>
              {order.address ? (
                <div className="text-gray-600 space-y-1">
                  <p>{order.address.street_address}</p>
                  <p>{order.address.city_province}</p>
                </div>
              ) : (
                <p className="text-gray-500">No address information</p>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Information
              </h2>
              {order.payment ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium">{getPaymentMethodLabel(order.payment.payment_method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPaymentStatusColor(order.payment.status)}`}>
                      {order.payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">${parseFloat(order.payment.amount).toFixed(2)}</span>
                  </div>
                  {order.payment.transaction_id && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-500 text-sm">Transaction ID</span>
                      <p className="font-mono text-sm mt-1 break-all">{order.payment.transaction_id}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No payment information</p>
              )}
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Order Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                  </div>
                </div>
                {order.status === "shipped" && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Shipped</p>
                      <p className="text-sm text-gray-500">Your order is on the way</p>
                    </div>
                  </div>
                )}
                {order.status === "delivered" && (
                  <>
                    <div className="flex gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="font-medium text-gray-900">Shipped</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="font-medium text-gray-900">Delivered</p>
                        <p className="text-sm text-gray-500">Order completed</p>
                      </div>
                    </div>
                  </>
                )}
                {order.status === "cancelled" && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Cancelled</p>
                      <p className="text-sm text-gray-500">Order was cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OrderDetail;