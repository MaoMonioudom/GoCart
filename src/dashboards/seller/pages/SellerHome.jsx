import React from "react";
import SellerNav from "../components/Navbar";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { kpis, products, restockAlerts, salesTrendData, quantityData, comparisonData } from "../data";

/* Chart.js register */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SellerHome = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <SellerNav />

      <div className="max-w-[1440px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Performance Overview - October 2025</p>
          <select className="mt-3 px-3 py-2 border rounded-lg">
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl p-5 text-center shadow-sm">
              <p className="text-gray-500">{kpi.title}</p>
              <p className="text-2xl font-bold mt-2">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5">
            <h3 className="font-semibold mb-3">Sales Trend (Revenue $)</h3>
            <Line data={salesTrendData} />
          </div>

          <div className="bg-white rounded-xl p-5">
            <h3 className="font-semibold mb-3">Quantity Sold (Monthly Units)</h3>
            <Bar data={quantityData} />
          </div>
        </div>

        {/* Restock Alerts & Popular Products */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 mb-8">
          {/* Restock Alerts */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Restock Alerts</h2>
            <div className="grid grid-cols-4 font-bold text-sm border-b pb-2">
              <span>Product</span>
              <span>Category</span>
              <span>Stock</span>
              <span className="text-center">Status</span>
            </div>
            {restockAlerts.map((item, i) => (
              <div key={i} className="grid grid-cols-4 items-center text-sm py-3 border-b last:border-none">
                <span>{item.product}</span>
                <span>{item.category}</span>
                <span>{item.stockLeft}</span>
                <span className={`text-center px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Low" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* Popular Products */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Popular Products</h2>
            <div className="flex flex-col gap-3">
              {products.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 flex flex-col ml-3">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-semibold text-sm mb-1">${p.price}</p>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Monthly Product Comparison (This Year vs Last Year)</h2>
          <Bar data={comparisonData} />
        </div>
      </div>
    </div>
  );
};

export default SellerHome;
