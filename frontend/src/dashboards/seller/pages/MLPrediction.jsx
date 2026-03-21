import React, { useEffect, useMemo, useState } from "react";
import SellerNav from "../components/Navbar";

import {
  getSellerProducts,
  getCategories,
  updateProduct,
} from "../../../services/productService";

import { getSellerMlPredictions } from "../../../services/sellerDashboardService";

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
        <span>Current vs Recommended</span>
        <span>
          {safeCurrent} / {safeMax} units
        </span>
      </div>

      <div className="h-5 w-full overflow-hidden rounded bg-gray-200">
        <div
          className={`h-full transition-all ${
            percentage < 60
              ? "bg-red-500"
              : percentage < 100
              ? "bg-amber-500"
              : "bg-green-500"
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
    <div className="flex flex-col gap-4 rounded-2xl bg-white px-4 sm:px-5 py-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">{item.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{item.category}</p>
          <p className="mt-0.5 text-xs text-gray-400">Prediction Month: {item.predictionMonth}</p>
        </div>
        <img
          src={item.image}
          alt={item.name}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover"
        />
      </div>

      {/* Stock */}
      <StockBar current={item.currentStock} max={item.recommendedStock} />

      {/* Prediction Info */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded bg-gray-100 p-3">
          <p className="text-xs text-gray-500">Next Month Forecast</p>
          <p className="text-sm font-medium">{item.predictedDemand} units</p>
        </div>
        <div className="rounded bg-gray-100 p-3">
          <p className="text-xs text-gray-500">Recommended Stock</p>
          <p className="text-sm font-medium">{item.recommendedStock} units</p>
        </div>
        <div className="rounded bg-gray-100 p-3">
          <p className="text-xs text-gray-500">Need To Replenish</p>
          <p
            className={`text-sm font-semibold ${
              item.replenishQty > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {item.replenishQty} units
          </p>
        </div>
      </div>

      {/* Model Signals */}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded bg-gray-50 px-3 py-2 border border-gray-100">
          <p className="text-xs text-gray-500">Recent Avg (3M)</p>
          <p className="text-sm font-medium">{item.recentAvg3mDisplay}</p>
        </div>
        <div className="rounded bg-gray-50 px-3 py-2 border border-gray-100">
          <p className="text-xs text-gray-500">Seasonal Avg (12M)</p>
          <p className="text-sm font-medium">{item.seasonalAvg12mDisplay}</p>
        </div>
        <div className="rounded bg-gray-50 px-3 py-2 border border-gray-100">
          <p className="text-xs text-gray-500">Monthly Trend</p>
          <p
            className={`text-sm font-medium ${
              item.hasHistory
                ? item.trend1m >= 0
                  ? "text-green-700"
                  : "text-red-700"
                : "text-gray-500"
            }`}
          >
            {item.trend1mDisplay}
          </p>
        </div>
        <div className="rounded bg-gray-50 px-3 py-2 border border-gray-100">
          <p className="text-xs text-gray-500">Price Change (MoM)</p>
          <p
            className={`text-sm font-medium ${
              item.hasHistory
                ? item.priceChangeMom <= 0
                  ? "text-green-700"
                  : "text-amber-700"
                : "text-gray-500"
            }`}
          >
            {item.priceChangeMomPercentDisplay}
          </p>
        </div>
      </div>

      <div className="rounded bg-blue-50 border border-blue-100 px-3 py-2">
        <p className="text-xs text-blue-700">Promo Effect Signal</p>
        <p className="text-sm font-medium text-blue-900">
          {item.promoShareLast3mPercentDisplay} promo-line share in last 3 months
        </p>
      </div>

      {!item.hasHistory && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No sales history yet for this product. Model signals will appear after orders are recorded.
        </div>
      )}

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xs sm:max-w-sm rounded-xl bg-white p-5 flex flex-col gap-3"
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
  const [predictions, setPredictions] = useState([]);

  // Build category map: id -> name
  const categoryNameById = useMemo(() => {
    const map = {};
    (categories || []).forEach((c) => {
      if (c?.category_id != null) map[c.category_id] = c.category_name;
    });
    return map;
  }, [categories]);

  // Convert product list into prediction items
  const items = useMemo(() => {
    const predictionByProductId = {};
    (predictions || []).forEach((x) => {
      if (x?.product_id != null) {
        predictionByProductId[x.product_id] = x;
      }
    });

    return (products || []).map((p) => {
      const mainImage =
        p.images?.find((img) => img.is_main)?.image_url ||
        p.images?.[0]?.image_url ||
        "/placeholder.png";

      const prediction = predictionByProductId[p.product_id] || {};
      const features = prediction.features || {};
      const historyMonthsCount = Number(prediction.history_months_count ?? 0);
      const hasHistory = historyMonthsCount > 0;

      const currentStock = Number(
        p.current_stock_level ?? p.stock_quantity ?? prediction.current_stock ?? 0
      );

      const predictedDemand = Math.max(Number(prediction.predicted_demand ?? 0), 0);
      const recommendedStock = Math.max(
        Number(prediction.recommended_stock ?? Math.ceil(predictedDemand * 1.2)),
        0
      );

      const trend1m = Number(features.trend_1m ?? 0);
      const priceChangeMom = Number(features.price_change_mom ?? 0);
      const promoShareLast3m = Number(features.promo_share_last_3m ?? 0);

      return {
        id: p.product_id,
        name: p.name,
        category:
          p.category_name ||
          categoryNameById[p.category_id] ||
          p.category ||
          "Unknown",
        image: mainImage,
        currentStock,
        predictionMonth: prediction.prediction_month || "Next Month",
        predictedDemand,
        recommendedStock,
        replenishQty: Number(prediction.replenish_quantity ?? 0),
        hasHistory,
        historyMonthsCount,
        recentAvg3m: Number(features.recent_avg_3m ?? 0),
        recentAvg3mDisplay: hasHistory
          ? Number(features.recent_avg_3m ?? 0).toFixed(1)
          : "N/A",
        seasonalAvg12m: Number(features.seasonal_avg_12m ?? 0),
        seasonalAvg12mDisplay: hasHistory
          ? Number(features.seasonal_avg_12m ?? 0).toFixed(1)
          : "N/A",
        trend1m: Number(trend1m.toFixed(1)),
        trend1mDisplay: hasHistory
          ? `${trend1m >= 0 ? "+" : ""}${Number(trend1m.toFixed(1))}`
          : "N/A",
        priceChangeMom,
        priceChangeMomPercentDisplay: hasHistory
          ? `${(priceChangeMom * 100).toFixed(1)}%`
          : "N/A",
        promoShareLast3mPercentDisplay: hasHistory
          ? `${(promoShareLast3m * 100).toFixed(1)}%`
          : "N/A",
      };
    });
  }, [products, predictions, categoryNameById]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsData, categoriesData, predictionData] = await Promise.all([
          getSellerProducts(),
          getCategories(),
          getSellerMlPredictions({ safety_buffer: 0.2 }),
        ]);

        if (cancelled) return;

        setProducts(productsData?.products || []);
        setCategories(categoriesData?.categories || []);
        setPredictions(predictionData?.predictions || []);
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
      await updateProduct(productId, { stock_quantity: Number(newStock) });

      setProducts((prev) =>
        (prev || []).map((p) =>
          p.product_id === productId
            ? { ...p, stock_quantity: Number(newStock), current_stock_level: Number(newStock) }
            : p
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                Forecasts are generated from your historical monthly sales, short-term trend, price
                movement, and past promo intensity. Recommended stock = predicted demand + safety
                buffer.
              </div>

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