import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Checkout() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);

    if (savedCart.length === 0) {
      navigate("/");
    }
  }, [navigate]);

  const totalAmount = cart
    .reduce((acc, item) => acc + (item.price || item.displayPrice || 0) * item.qty, 0)
    .toFixed(2);

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const handlePlaceOrder = () => {
    alert("🎉 Payment successful! Order placed.");
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/");
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        <h2 className="text-2xl font-semibold mb-6">Checkout</h2>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Form */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-md p-6 space-y-6">
            {/* Shipping Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border rounded px-4 py-3" placeholder="First Name" />
                <input className="border rounded px-4 py-3" placeholder="Last Name" />
                <input className="border rounded px-4 py-3 md:col-span-2" placeholder="Address" />
                <input className="border rounded px-4 py-3" placeholder="City" />
                <input className="border rounded px-4 py-3" placeholder="Phone Number" />
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <input className="border rounded px-4 py-3" placeholder="Card Number" />
                <div className="grid grid-cols-2 gap-4">
                  <input className="border rounded px-4 py-3" placeholder="MM / YY" />
                  <input className="border rounded px-4 py-3" placeholder="CVV" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 space-y-4">
              <h3 className="text-xl font-semibold">Order Summary</h3>

              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} × {item.qty}</span>
                    <span>
                      ${((item.price || item.displayPrice) * item.qty).toFixed(2)}
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
                className="w-full mt-4 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Place Order
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

