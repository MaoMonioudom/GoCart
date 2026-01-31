import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../../../components/layout/Footer";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Load cart from localStorage on mount, location change, and custom events
  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(savedCart);
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    return () => window.removeEventListener("cartUpdated", loadCart);
  }, [location]);

  const updateQuantity = (productId, delta) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (productId) => setCart(prev => prev.filter(item => item.id !== productId));

  const handleCheckout = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/checkout");
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);

  // ✅ Sync cart with localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-700 text-lg">
          Your cart is empty 🛒
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        <h2 className="text-2xl font-semibold mb-6">Shopping Cart</h2>
        <div className="grid grid-cols-12 gap-6">
          {/* Items */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-md flex flex-col md:flex-row items-center gap-4 p-4">
                <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-lg" />
                <div className="flex-1 flex flex-col gap-2">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  {item.selectedSize && <span className="text-sm text-gray-500">Size: {item.selectedSize}</span>}
                  <div className="flex items-center gap-4 mt-1">
                    <span className="font-semibold text-gray-900">${item.price}</span>
                    {item.originalPrice && <span className="line-through text-gray-400 text-sm">${item.originalPrice}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 border rounded hover:bg-gray-100">−</button>
                    <span className="px-3 py-1 border rounded">{item.qty}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 border rounded hover:bg-gray-100">+</button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Summary</h3>
            <div className="flex justify-between"><span>Subtotal</span><span>${totalAmount}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>${totalAmount}</span></div>
            <button onClick={handleCheckout} className="mt-4 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900">Proceed to Checkout</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
