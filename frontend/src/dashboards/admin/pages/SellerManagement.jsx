import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";
import BarChartBox from "../components/charts/BarChartBox";
import PieChartBox from "../components/charts/PieChartBox";
import DataTable from "../components/table/DataTable";
import SellerDetailModal from "../components/modals/SellerDetailModal";

import {
  sellerStats,
  commissionChartYear,
  commissionChartMonth,
  commissionByCategoryYear,
  commissionByCategoryMonth,
  sellerStatusData,
  sellerRegistrationChart,
  topSellers,
} from "../admindata/seller";

export default function SellerManagement() {
  // 🔹 chart filters
  const [commissionView, setCommissionView] = useState("year");
  const [categoryView, setCategoryView] = useState("year");

  // 🔹 sellers state (source of truth)
  const [sellers, setSellers] = useState(topSellers);

  // 🔹 modal state
  const [selectedSeller, setSelectedSeller] = useState(null);

  // SAVE EDIT (update ONE seller only)
  const handleSaveSeller = (updatedSeller) => {
    setSellers((prev) =>
      prev.map((seller) =>
        seller.id === updatedSeller.id ? updatedSeller : seller
      )
    );
    setSelectedSeller(null);
  };

  // DELETE SELLER (remove ONE seller only)
  const handleDeleteSeller = (sellerId) => {
    setSellers((prev) =>
      prev.filter((seller) => seller.id !== sellerId)
    );
    setSelectedSeller(null);
  };

  // 🔹 table columns
  const sellerColumns = [
    { label: "Seller Name", key: "name" },
    { label: "Store", key: "store" },
    {
      label: "Total Sale",
      key: "totalSale",
      render: (row) => `$${row.totalSale.toLocaleString()}`,
    },
    {
      label: "Commission Earned",
      key: "commission",
      render: (row) => `$${row.commission.toLocaleString()}`,
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`font-medium ${
            row.status === "Active"
              ? "text-green-600"
              : row.status === "Inactive"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          ● {row.status}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (row) => (
        <button
          onClick={() => setSelectedSeller({ ...row })} // clone = safe
          className="px-4 py-1 text-sm border rounded-md hover:bg-gray-100 transition"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* PAGE TITLE */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Seller Management
        </h1>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {sellerStats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              change={item.change}
            />
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* COMMISSION TREND */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Commission Trends
              </h3>
              <select
                value={commissionView}
                onChange={(e) => setCommissionView(e.target.value)}
                className="text-xs border rounded-full px-3 py-1"
              >
                <option value="year">Year</option>
                <option value="month">Month</option>
              </select>
            </div>

            <BarChartBox
              data={
                commissionView === "year"
                  ? commissionChartYear
                  : commissionChartMonth
              }
            />
          </div>

          {/* COMMISSION BY CATEGORY */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Commission Earn by Categories
              </h3>
              <select
                value={categoryView}
                onChange={(e) => setCategoryView(e.target.value)}
                className="text-xs border rounded-full px-3 py-1"
              >
                <option value="year">Year</option>
                <option value="month">Month</option>
              </select>
            </div>

            <PieChartBox
              data={
                categoryView === "year"
                  ? commissionByCategoryYear
                  : commissionByCategoryMonth
              }
            />
          </div>
        </div>

        {/* REGISTRATION + STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Seller Registration Trend
            </h3>
            <BarChartBox
              data={sellerRegistrationChart}
              color="#10B981"
            />
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Sellers Status Overview
            </h3>
            <PieChartBox data={sellerStatusData} />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-center mb-4">
            Top Seller Table
          </h3>

          <DataTable
            columns={sellerColumns}
            data={sellers}
          />
        </div>

        {/* MODAL */}
        {selectedSeller && (
          <SellerDetailModal
            seller={selectedSeller}
            onClose={() => setSelectedSeller(null)}
            onSave={handleSaveSeller}
            onDelete={handleDeleteSeller}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
