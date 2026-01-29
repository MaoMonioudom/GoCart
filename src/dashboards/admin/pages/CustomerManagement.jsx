import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard"; // ✅ MISSING IMPORT
import DataTable from "../components/table/DataTable";
import CustomerAreaChart from "../components/charts/CustomerAreaChart";

import {
  customerStats,
  customersTable,
  customerOverviewThisWeek,
  customerOverviewLastWeek,
} from "../admindata/customer";

export default function CustomerManagement() {
  const [overviewView, setOverviewView] = useState("thisWeek");

  const customerColumns = [
    { label: "Customer ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Phone", key: "phone" },
    { label: "Order Count", key: "orders" },
    {
      label: "Total Spend",
      key: "totalSpend",
      render: (row) => `$${row.totalSpend.toLocaleString()}`,
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span
          className={`font-medium ${
            row.status === "Active"
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          ● {row.status}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Management
        </h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerStats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              change={item.change}
            />
          ))}
        </div>

        {/* Overview */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">
              Customer Overview
            </h3>

            {/* THIS WEEK / LAST WEEK */}
            <div className="flex gap-2">
              <button
                onClick={() => setOverviewView("thisWeek")}
                className={`px-4 py-1 text-xs rounded-full border transition ${
                  overviewView === "thisWeek"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                This week
              </button>

              <button
                onClick={() => setOverviewView("lastWeek")}
                className={`px-4 py-1 text-xs rounded-full border transition ${
                  overviewView === "lastWeek"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Last week
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-between text-sm mb-4 text-gray-600">
            <p><strong>25k</strong> Active Customers</p>
            <p><strong>5.6k</strong> Repeat Customers</p>
            <p><strong>250k</strong> Shop Visitors</p>
            <p><strong>5.5%</strong> Conversion Rate</p>
          </div>

          {/* Area Chart */}
          <CustomerAreaChart
            data={
              overviewView === "thisWeek"
                ? customerOverviewThisWeek
                : customerOverviewLastWeek
            }
          />
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-center mb-4">
            Customer Table
          </h3>

          <DataTable
            columns={customerColumns}
            data={customersTable}
          />
        </div>

      </div>
    </DashboardLayout>
  );
}
