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
      console.log("Cart.jsx - Loading cart from localStorage:", savedCart);
      setCart(savedCart);
    };

    loadCart();
    
    // Listen for custom event from ProductDetail
    window.addEventListener("cartUpdated", loadCart);
    
    // Also listen for storage changes (in case of multiple tabs)
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, [location]);

  useEffect(() => {
    console.log("Cart.jsx - Cart state updated:", cart);
  }, [cart]);

  const updateQuantity = (itemIdentifier, delta) => {
    setCart(prev =>
      prev.map(item =>
        item.itemIdentifier === itemIdentifier || (item.id === itemIdentifier && !item.itemIdentifier) 
          ? { ...item, qty: Math.max(1, item.qty + delta) } 
          : item
      )
    );
  };

  const removeItem = (itemIdentifier) => {
    console.log("Removing item with identifier:", itemIdentifier);
    setCart(prev => prev.filter(item => 
      !(item.itemIdentifier === itemIdentifier || (item.id === itemIdentifier && !item.itemIdentifier))
    ));
  };

  const handleCheckout = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/checkout");
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price || item.displayPrice || 0) * item.qty, 0).toFixed(2);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  // ✅ Sync cart with localStorage on change
  useEffect(() => {
    if (cart.length > 0) {
      console.log("Cart.jsx - Saving cart to localStorage:", cart);
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  if (cart.length === 0) {
    console.log("Cart.jsx - Cart is empty");
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-700 p-4">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        <h2 className="text-2xl font-semibold mb-6">Shopping Cart ({totalItems} items)</h2>
        <div className="grid grid-cols-12 gap-6">
          {/* Items */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            {cart.map((item, index) => {
              const itemKey = item.itemIdentifier || `${item.id}-${item.selectedSize || 'default'}-${index}`;
              const displayPrice = item.price || item.displayPrice || 0;
              const displayOriginalPrice = item.originalPrice || item.displayOriginalPrice;
              
              return (
                <div key={itemKey} className="bg-white rounded-xl shadow-md flex flex-col md:flex-row items-center gap-4 p-6">
                  <img 
                    src={item.image || item.images?.[0] || "https://via.placeholder.com/150"} 
                    alt={item.name} 
                    className="w-32 h-32 object-cover rounded-lg" 
                  />
                  <div className="flex-1 flex flex-col gap-3">
                    <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.brand || 'No brand'}</p>
                    {item.selectedSize && (
                      <span className="text-sm text-gray-500">Size: {item.selectedSize}</span>
                    )}
                    
                    {/* Price display */}
                    <div className="flex items-center gap-4 mt-1">
                      {displayOriginalPrice ? (
                        <>
                          <span className="font-semibold text-gray-900 text-xl">
                            ${displayPrice.toFixed(2)}
                          </span>
                          <span className="line-through text-gray-400">
                            ${displayOriginalPrice.toFixed(2)}
                          </span>
                          {item.promotion && (
                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs">
                              {item.promotion}% OFF
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-semibold text-gray-900 text-xl">
                          ${displayPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.itemIdentifier || item.id, -1)} 
                        className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-12 h-10 border border-gray-300 rounded flex items-center justify-center">
                        {item.qty}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.itemIdentifier || item.id, 1)} 
                        className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <span className="font-semibold text-gray-900 text-xl">
                      ${(displayPrice * item.qty).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => removeItem(item.itemIdentifier || item.id)} 
                      className="text-red-500 text-sm hover:underline hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 sticky top-6">
              <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalAmount}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between text-gray-700 border-t pt-3 mt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${totalAmount}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout} 
                className="mt-4 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 w-full transition-colors"
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </button>
              
              <button 
                onClick={() => navigate("/")}
                className="mt-2 border border-black text-black py-3 rounded-lg font-medium hover:bg-gray-100 w-full transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
