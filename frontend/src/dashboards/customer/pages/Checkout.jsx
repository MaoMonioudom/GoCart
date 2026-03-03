import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import { getAddresses, createOrder, addAddress } from "../../../services/productService";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form fields matching database: street_address, city_province
  const [form, setForm] = useState({
    street_address: "",
    city_province: ""
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);

    if (savedCart.length === 0) {
      navigate("/cart");
      return;
    }

    // Fetch and auto-fill from default address
    const fetchDefaultAddress = async () => {
      try {
        const response = await getAddresses();
        const addresses = response.addresses || [];
        
        // Find default address or use first one
        const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
        
        if (defaultAddress) {
          setAddressId(defaultAddress.address_id);
          setForm({
            street_address: defaultAddress.street_address || "",
            city_province: defaultAddress.city_province || ""
          });
        }
      } catch (err) {
        console.error("Error fetching address:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDefaultAddress();
    } else {
      setLoading(false);
    }
  }, [navigate, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const totalAmount = cart
    .reduce((acc, item) => acc + (item.price || 0) * item.qty, 0)
    .toFixed(2);

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Validate form
    if (!form.street_address || !form.city_province) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // If no address exists, create one first
      let currentAddressId = addressId;
      if (!currentAddressId) {
        const addressResponse = await addAddress({
          street_address: form.street_address,
          city_province: form.city_province,
          is_default: true
        });
        currentAddressId = addressResponse.address?.[0]?.address_id;
        
        if (!currentAddressId) {
          throw new Error("Failed to create shipping address");
        }
      }

      const orderData = {
        address_id: currentAddressId,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.qty,
          price: item.price,
          promo_id: item.promo_id || null
        }))
      };

      const response = await createOrder(orderData);
      
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      
      navigate("/orders", { 
        state: { 
          success: true, 
          orderId: response.order_id,
          message: "Order placed successfully!" 
        } 
      });
    } catch (err) {
      console.error("Order error:", err);
      setError(err.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        <h2 className="text-2xl font-semibold mb-6">Checkout</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Form */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-md p-6 space-y-6">
            
            {/* Shipping Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input 
                    name="street_address"
                    value={form.street_address}
                    onChange={handleChange}
                    className="w-full border rounded px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent" 
                    placeholder="Enter your street address" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City / Province *
                  </label>
                  <input 
                    name="city_province"
                    value={form.city_province}
                    onChange={handleChange}
                    className="w-full border rounded px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent" 
                    placeholder="Enter city or province" 
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "cod" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "aba" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="aba"
                    checked={paymentMethod === "aba"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">ABA</span>
                    </div>
                    <div>
                      <p className="font-medium">ABA Pay</p>
                      <p className="text-sm text-gray-500">Scan QR code to pay</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "bank" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-gray-500">Transfer to our account</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 space-y-4">
              <h3 className="text-xl font-semibold">Order Summary</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img 
                      src={item.image || "/placeholder.png"} 
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm font-medium">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full mt-4 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="w-full border border-black py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;
