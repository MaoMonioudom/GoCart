import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCartApi, placeOrderApi, setCartApi } from "../../../api/customer";

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
      name: p.name || `Product #${it.product_id}`,
      image: p.image_url || null,
      price,
      qty: Number(it.quantity || 1),
    };
  });
  return items;
}

function mapUiCartToBackendItems(uiCart) {
  return (uiCart || []).map((i) => ({
    product_id: i.id,
    quantity: i.qty,
  }));
}

function Checkout() {
  const navigate = useNavigate();
  const token = useMemo(() => getAuthToken(), []);
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError(null);

      // If logged in, use backend as source of truth
      if (token) {
        try {
          const resp = await getCartApi();
          if (!mounted) return;
          setCart(mapBackendCartToUi(resp));
          return;
        } catch (e) {
          console.warn("Failed to load backend cart in Checkout:", e);
        }
      }

      // Guest fallback
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (!mounted) return;
      setCart(savedCart);

      if (savedCart.length === 0) {
        navigate("/");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [navigate, token]);

  const totalAmount = cart
    .reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0)
    .toFixed(2);

  const totalItems = cart.reduce((acc, item) => acc + (item.qty || 1), 0);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    setError(null);

    // Require login for backend order placement
    if (!token) {
      setError("Please log in to place an order.");
      return;
    }

    if (!form.street || !form.city) {
      setError("Please enter your shipping address and city/province.");
      return;
    }

    setPlacing(true);
    try {
      // Ensure backend cart matches current UI cart (safety)
      await setCartApi(mapUiCartToBackendItems(cart));

      const resp = await placeOrderApi({
        address: {
          street_address: form.street,
          city_province: form.city,
        },
      });

      alert(`🎉 Order placed! Order ID: ${resp.order_id}`);

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/customer");
    } catch (e) {
      setError(e?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        <h2 className="text-2xl font-semibold mb-6">Checkout</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Form */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-md p-6 space-y-6">
            {/* Shipping Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="border rounded px-4 py-3"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                />
                <input
                  className="border rounded px-4 py-3"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                />
                <input
                  className="border rounded px-4 py-3 md:col-span-2"
                  placeholder="Address"
                  value={form.street}
                  onChange={handleChange("street")}
                />
                <input
                  className="border rounded px-4 py-3"
                  placeholder="City / Province"
                  value={form.city}
                  onChange={handleChange("city")}
                />
                <input
                  className="border rounded px-4 py-3"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange("phone")}
                />
              </div>
            </div>

            {/* Payment Info (UI only for now) */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  className="border rounded px-4 py-3"
                  placeholder="Card Number"
                  value={form.cardNumber}
                  onChange={handleChange("cardNumber")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="border rounded px-4 py-3"
                    placeholder="MM / YY"
                    value={form.expiry}
                    onChange={handleChange("expiry")}
                  />
                  <input
                    className="border rounded px-4 py-3"
                    placeholder="CVV"
                    value={form.cvv}
                    onChange={handleChange("cvv")}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Payment is mocked for now. The backend creates the order and updates stock.
                </p>
              </div>
            </div>
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
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>

              {!token && (
                <p className="text-xs text-gray-500 mt-3">
                  You must be logged in to place an order.
                </p>
              )}
            </div>

            {/* Items preview */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h4 className="font-semibold mb-3">Items</h4>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div>📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.qty} × ${Number(item.price || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      ${(Number(item.price || 0) * (item.qty || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;
