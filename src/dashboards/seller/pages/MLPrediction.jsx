import React, { useState } from "react";
import SellerNav from "../components/Navbar";
import { mlPredictionItems } from "../data/mlPredictionData";

/* =========================
   STOCK BAR
========================= */
const StockBar = ({ current, max }) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm text-gray-600">
        <span>Current Stock Level</span>
        <span>
          {current} / {max} units
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
const PredictionItemCard = ({ item, index, onUpdateStock }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStock, setNewStock] = useState(item.currentStock);

  const handleUpdate = () => {
    onUpdateStock(index, newStock);
    setIsModalOpen(false);
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
          <p className="text-sm font-medium">{item.predictedDemand} units (30 days)</p>
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
            className="w-[300px] rounded-xl bg-white p-5 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">
              Update Stock for {item.name}
            </h3>

            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) =>
                setNewStock(parseInt(e.target.value || 0))
              }
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 rounded bg-green-500 py-2 text-white hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded bg-red-500 py-2 text-white hover:bg-red-600"
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
  const [items, setItems] = useState(mlPredictionItems);

  const handleUpdateStock = (index, newStock) => {
    const updated = [...items];
    updated[index].currentStock = newStock;
    setItems(updated);
  };

  return (
    <>
      <SellerNav />

      {/* Wrapper with smaller padding */}
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-3 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold">
              ML Demand Predictions
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              AI-powered insights to optimize inventory and maximize sales
            </p>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-6">
            {items.map((item, index) => (
              <PredictionItemCard
                key={item.id}
                item={item}
                index={index}
                onUpdateStock={handleUpdateStock}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MLPrediction;
