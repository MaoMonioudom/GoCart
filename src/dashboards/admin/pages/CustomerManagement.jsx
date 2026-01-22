import AdminNav from "../components/Navbar";
import DataTable from "../components/table/DataTable";
import CustomerAreaChart from "../components/charts/CustomerAreaChart";

import {
  customerStats,
  customerOverview,
  customersTable,
} from "../data/customer";

export default function CustomerManagement() {
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
    <>
      {/* Admin Navbar */}
      <AdminNav />

      {/* Page Content */}
      <main className="bg-gray-50 min-h-screen px-10 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-800">
            Customer Management
          </h1>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerStats.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border p-5 space-y-2"
              >
                <p className="text-sm text-gray-500">{item.title}</p>
                <h2 className="text-2xl font-bold">{item.value}</h2>
                <span className="text-sm text-green-600">
                  ↑ {item.change}
                </span>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Customer Overview
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border rounded-full bg-gray-100">
                  This week
                </button>
                <button className="px-3 py-1 text-xs border rounded-full">
                  Last week
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm mb-4 text-gray-600">
              <p><strong>25k</strong> Active Customers</p>
              <p><strong>5.6k</strong> Repeat Customers</p>
              <p><strong>250k</strong> Shop Visitors</p>
              <p><strong>5.5%</strong> Conversion Rate</p>
            </div>

            <CustomerAreaChart data={customerOverview} />
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-xl border p-6">
            <DataTable
              columns={customerColumns}
              data={customersTable}
            />
          </div>
        </div>
      </main>
    </>
  );
}
