import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";
import BarChartBox from "../components/charts/BarChartBox";
import PieChartBox from "../components/charts/PieChartBox";
import DataTable from "../components/table/DataTable";

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
  // ✅ STATE MUST BE INSIDE COMPONENT
  const [commissionView, setCommissionView] = useState("year");
  const [categoryView, setCategoryView] = useState("year");

  const sellerColumns = [
    { label: "Seller Name", key: "name" },
    { label: "Store", key: "store" },
    {
      label: "Total Sale",
      key: "totalSale",
      render: (row) => `$${Number(row.totalSale).toLocaleString()}`,
    },
    {
      label: "Commission Earned",
      key: "commission",
      render: (row) => `$${Number(row.commission).toLocaleString()}`,
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span className="font-medium text-green-600">
          ● {row.status}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Seller Management
        </h1>

        {/* Stat Cards */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Commission Trend */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Commission Trends
              </h3>
              <select
                value={commissionView}
                onChange={(e) => setCommissionView(e.target.value)}
                className="text-xs border rounded-full px-3 py-1 bg-white"
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

          {/* Commission by Category */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Commission Earn by Categories
              </h3>
              <select
                value={categoryView}
                onChange={(e) => setCategoryView(e.target.value)}
                className="text-xs border rounded-full px-3 py-1 bg-white"
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

        {/* Seller Registration + Status */}
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

        {/* Top Seller Table */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-center mb-4">
            Top Seller Table
          </h3>
          <DataTable
            columns={sellerColumns}
            data={topSellers}
          />
        </div>

      </div>
    </DashboardLayout>
  );
}
