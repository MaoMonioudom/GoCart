import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";
import DataTable from "../components/table/DataTable";
import CustomerAreaChart from "../components/charts/CustomerAreaChart";
import CustomerDetailModal from "../components/modals/CustomerDetailModal";

import {
  customerStats,
  customersTable,
  customerOverviewThisWeek,
  customerOverviewLastWeek,
} from "../admindata/customer";

export default function CustomerManagement() {
  const [overviewView, setOverviewView] = useState("thisWeek");

  // ✅ MAIN CUSTOMER STATE (VERY IMPORTANT)
  const [customers, setCustomers] = useState(customersTable);

  // ✅ MODAL STATE
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ✅ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = customers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ✅ SAVE CUSTOMER
  const handleSaveCustomer = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === updatedCustomer.id ? updatedCustomer : c
      )
    );
    setSelectedCustomer(null);
  };

  // ✅ DELETE CUSTOMER
  const handleDeleteCustomer = (customerId) => {
    setCustomers((prev) =>
      prev.filter((c) => c.id !== customerId)
    );
    setSelectedCustomer(null);
  };

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
    {
      label: "Action",
      key: "action",
      render: (row) => (
        <button
          onClick={() => setSelectedCustomer(row)}
          className="px-4 py-1 text-sm border rounded-md hover:bg-gray-100"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Management
        </h1>

        {/* STAT CARDS */}
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

        {/* OVERVIEW */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">
              Customer Overview
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setOverviewView("thisWeek")}
                className={`px-4 py-1 text-xs rounded-full border ${
                  overviewView === "thisWeek"
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                This week
              </button>
              <button
                onClick={() => setOverviewView("lastWeek")}
                className={`px-4 py-1 text-xs rounded-full border ${
                  overviewView === "lastWeek"
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                Last week
              </button>
            </div>
          </div>

          <CustomerAreaChart
            data={
              overviewView === "thisWeek"
                ? customerOverviewThisWeek
                : customerOverviewLastWeek
            }
          />
        </div>

        {/* CUSTOMER TABLE */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-center mb-4">
            Customer Table
          </h3>

          <DataTable
            columns={customerColumns}
            data={paginatedCustomers}
          />

          {/* PAGINATION */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onSave={handleSaveCustomer}
            onDelete={handleDeleteCustomer}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
