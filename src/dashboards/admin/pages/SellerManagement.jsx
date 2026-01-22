import AdminNav from "../components/Navbar";
import StatCard from "../components/cards/StatCard";
import BarChartBox from "../components/charts/BarChartBox";
import PieChartBox from "../components/charts/PieChartBox";
import DataTable from "../components/table/DataTable";

import {
  sellerStats,
  commissionChart,
  commissionByCategory,
  sellerStatusData,
  sellerRegistrationChart,
  topSellers,
} from "../data/seller";

export default function SellerManagement() {
  const sellerColumns = [
    { label: "Seller Name", key: "name" },
    { label: "Store", key: "store" },
    {
      label: "Total Sale",
      key: "totalSale",
      render: (row) =>
        `$${Number(row.totalSale).toLocaleString()}`,
    },
    {
      label: "Commission Earned",
      key: "commission",
      render: (row) =>
        `$${Number(row.commission).toLocaleString()}`,
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
    <>
      {/* Admin Navbar */}
      <AdminNav />

      {/* Page Content */}
      <main className="bg-gray-50 min-h-screen px-10 py-8">
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
              />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                  Commission Trends
                </h3>
                <button className="text-xs border rounded-full px-3 py-1">
                  Year
                </button>
              </div>
              <BarChartBox data={commissionChart} />
            </div>

            <div className="bg-white rounded-xl border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                  Commission Earn by Categories
                </h3>
                <button className="text-xs border rounded-full px-3 py-1">
                  Monthly
                </button>
              </div>
              <PieChartBox data={commissionByCategory} />
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
      </main>
    </>
  );
}
