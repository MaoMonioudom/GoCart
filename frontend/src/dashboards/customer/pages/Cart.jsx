import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCartApi, setCartApi } from "../../../api/customer";

function getAuthToken() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.token || null;
  } catch {
    return null;
  }
}

function mapBackendCartToUi(cartResp) {
  const items = (cartResp?.items || []).map((it) => {
    const p = it.product || {};
    const price = Number(it.unit_price ?? p.price ?? 0);
    return {
      id: it.product_id,
      itemIdentifier: it.product_id,
      name: p.name || `Product #${it.product_id}`,
      image: p.image_url || p.image || null,
      price,
      qty: Number(it.quantity || 1),
    };
  });
  return items;
}

function mapUiCartToBackendItems(uiCart) {
  return (uiCart || []).map((i) => ({
    product_id: i.id ?? i.product_id,
    quantity: i.qty ?? i.quantity ?? 1,
  }));
}

function Cart() {
  const navigate = useNavigate();
  const token = useMemo(() => getAuthToken(), []);
  const [cart, setCart] = useState(() => {
    // Guest fallback
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const syncTimer = useRef(null);

  // Load cart from backend for logged-in customers
  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) return;
      try {
        const resp = await getCartApi();
        if (!mounted) return;
        const uiItems = mapBackendCartToUi(resp);
        setCart(uiItems);
      } catch (e) {
        // If backend fails, keep local cart (dev-friendly)
        console.warn("Failed to load cart from backend:", e);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Always keep localStorage updated (helps reload + guest mode)
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  // Sync cart to backend (debounced) when logged in
  useEffect(() => {
    if (!token) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        await setCartApi(mapUiCartToBackendItems(cart));
      } catch (e) {
        console.warn("Failed to sync cart to backend:", e);
      }
    }, 400);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [cart, token]);

  // Update quantity of an item
  const updateQuantity = (itemIdentifier, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.itemIdentifier === itemIdentifier || item.id === itemIdentifier
          ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) }
          : item
      )
    );
  };

  // Remove an item from the cart
  const removeItem = (itemIdentifier) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.itemIdentifier === itemIdentifier || item.id === itemIdentifier)
      )
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate("/checkout");
  };

  const totalAmount = cart
    .reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0)
    .toFixed(2);
  const totalItems = cart.reduce((acc, item) => acc + (item.qty || 1), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-700 p-4">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <button
            onClick={() => navigate("/customer")}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Go Shopping
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
        <h2 className="text-2xl font-semibold mb-6">
          Shopping Cart ({totalItems} items)
        </h2>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Cart Items */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.itemIdentifier || item.id}
                className="bg-white rounded-xl shadow-md p-4 flex gap-4 items-center"
              >
                <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl">📦</div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-500">${Number(item.price || 0).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.itemIdentifier || item.id, -1)}
                    className="w-9 h-9 rounded-lg border hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQuantity(item.itemIdentifier || item.id, 1)}
                    className="w-9 h-9 rounded-lg border hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>

                <div className="w-24 text-right font-semibold">
                  ${(Number(item.price || 0) * (item.qty || 1)).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(item.itemIdentifier || item.id)}
                  className="text-red-500 hover:text-red-600 px-2"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Right: Summary */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="flex justify-between text-gray-600 mb-2">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex justify-between text-gray-600 mb-4">
                <span>Total</span>
                <span className="font-semibold text-black">${totalAmount}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Proceed to Checkout
              </button>

              {!token && (
                <p className="text-xs text-gray-500 mt-3">
                  Tip: Log in to sync your cart to the backend.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
