import React, { useEffect, useMemo, useState } from "react";
import SellerNav from "../components/Navbar";

import {
  getSellerProducts,
  getCategories,
  updateProduct,
} from "../../../services/productService";

import { getSellerQuantityAnalytics } from "../../../services/sellerDashboardService";

/* =========================
   STOCK BAR
========================= */
const StockBar = ({ current, max }) => {
  const safeMax = Math.max(Number(max) || 0, 1);
  const safeCurrent = Math.max(Number(current) || 0, 0);
  const percentage = Math.min((safeCurrent / safeMax) * 100, 100);

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm text-gray-600">
        <span>Current Stock Level</span>
        <span>
          {safeCurrent} / {safeMax} units
        </span>
      </div>

      <div className="h-5 w-full overflow-hidden rounded bg-gray-200">
        <div
          className={`h-full transition-all ${
            percentage > 80 ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/* =========================
   ITEM CARD
========================= */
const PredictionItemCard = ({ item, onUpdateStock }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStock, setNewStock] = useState(item.currentStock);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNewStock(item.currentStock);
  }, [item.currentStock]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await onUpdateStock(item.id, newStock);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white px-4 py-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">{item.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{item.category}</p>
        </div>
        <img
          src={item.image}
          alt={item.name}
          className="h-24 w-24 rounded-lg object-cover"
        />
      </div>

      {/* Stock */}
      <StockBar current={item.currentStock} max={item.recommendedStock} />

      {/* Prediction Info */}
      <div className="mt-2 flex gap-2">
        <div className="flex-1 rounded bg-gray-100 p-3">
          <p className="text-xs text-gray-500">Predicted Demand</p>
          <p className="text-sm font-medium">
            {item.predictedDemand} units (estimate)
          </p>
        </div>
        <div className="flex-1 rounded bg-gray-100 p-3">
          <p className="text-xs text-gray-500">Recommended Stock</p>
          <p className="text-sm font-medium">{item.recommendedStock} units</p>
        </div>
      </div>

      {/* Factors */}
      <div className="mt-2 flex gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <div className="rounded bg-gray-100 px-2 py-1.5">
            <p className="text-xs text-gray-500">Seasonality</p>
            <p className="text-sm font-medium">{item.seasonality}</p>
          </div>
          <div className="rounded bg-gray-100 px-2 py-1.5">
            <p className="text-xs text-gray-500">Upcoming Events</p>
            <p className="text-sm font-medium">{item.events}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="rounded bg-gray-100 px-2 py-1.5">
            <p className="text-xs text-gray-500">Sales Trend</p>
            <p className="text-sm font-medium">{item.salesTrend}</p>
          </div>
          <div className="rounded bg-gray-100 px-2 py-1.5">
            <p className="text-xs text-gray-500">Weather Impact</p>
            <p className="text-sm font-medium">{item.weatherImpact}</p>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-3 w-full rounded bg-black py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Update Stock Now
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-5 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Update Stock for {item.name}</h3>

            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value || 0, 10))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 rounded bg-green-500 py-2 text-white hover:bg-green-600 disabled:bg-green-300"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="flex-1 rounded bg-red-500 py-2 text-white hover:bg-red-600 disabled:bg-red-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================
   MAIN PAGE
========================= */
const MLPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantityAnalytics, setQuantityAnalytics] = useState([]);

  // Build category map: id -> name (based on your Product.jsx shape)
  const categoryNameById = useMemo(() => {
    const map = {};
    (categories || []).forEach((c) => {
      if (c?.category_id != null) map[c.category_id] = c.category_name;
    });
    return map;
  }, [categories]);

  // Convert product list into prediction items (real data)
  const items = useMemo(() => {
    const qtyByProductId = {};
    (quantityAnalytics || []).forEach((x) => {
      if (x?.product_id != null) {
        qtyByProductId[x.product_id] = Number(x.quantity ?? x.total_quantity ?? 0);
      }
    });

    return (products || []).map((p) => {
      const mainImage =
        p.images?.find((img) => img.is_main)?.image_url ||
        p.images?.[0]?.image_url ||
        "/placeholder.png";

      // Demand estimate: if backend returns "quantity", use it; otherwise 0
      const predictedDemand = Math.max(qtyByProductId[p.product_id] || 0, 0);

      // Recommended stock: simple heuristic (demand + safety buffer)
      const recommendedStock = Math.max(Math.ceil(predictedDemand * 1.2), 10);

      // Optional “factor” placeholders (until you add real ML fields)
      const salesTrend =
        predictedDemand >= 30 ? "Increasing" : predictedDemand >= 10 ? "Stable" : "Low";

      return {
        id: p.product_id,
        name: p.name,
        category:
          p.category_name ||
          categoryNameById[p.category_id] ||
          p.category ||
          "Unknown",
        image: mainImage,
        currentStock: Number(p.stock_quantity ?? 0),
        predictedDemand,
        recommendedStock,
        seasonality: "N/A",
        events: "N/A",
        salesTrend,
        weatherImpact: "N/A",
      };
    });
  }, [products, quantityAnalytics, categoryNameById]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsData, categoriesData, quantityData] = await Promise.all([
          getSellerProducts(),
          getCategories(),
          getSellerQuantityAnalytics(),
        ]);

        if (cancelled) return;

        setProducts(productsData?.products || []);
        setCategories(categoriesData?.categories || []);
        setQuantityAnalytics(quantityData || []);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to load prediction data.";
        setError(String(msg));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update stock in backend and refresh local state
  const handleUpdateStock = async (productId, newStock) => {
    try {
      // If your backend requires full update payload, you must include other fields.
      // Many APIs accept partial update. This will work if your updateProduct supports partial.
      await updateProduct(productId, { stock_quantity: Number(newStock) });

      // Update local products state
      setProducts((prev) =>
        (prev || []).map((p) =>
          p.product_id === productId ? { ...p, stock_quantity: Number(newStock) } : p
        )
      );
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || "Failed to update stock.");
    }
  };

  return (
    <>
      <SellerNav />

      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-3 py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold">ML Demand Predictions</h1>
            <p className="mt-2 text-sm sm:text-lg text-gray-500">
              AI-powered insights to optimize inventory and maximize sales
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {!loading && error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500">
                    Please add products first, then return to this page.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <PredictionItemCard
                    key={item.id}
                    item={item}
                    onUpdateStock={handleUpdateStock}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MLPrediction;