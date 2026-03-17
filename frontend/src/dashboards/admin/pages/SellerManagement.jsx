import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";
import BarChartBox from "../components/charts/BarChartBox";
import PieChartBox from "../components/charts/PieChartBox";
import DataTable from "../components/table/DataTable";
import SellerDetailModal from "../components/modals/SellerDetailModal";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNSwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzczNzQxOTY4fQ.nNOHYhysqZX_RpHlM2XEtFN4vpu17h05Cy9MF7Z-1ho";

export default function SellerManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  const [sellerStats, setSellerStats] = useState([]);
  const [commissionYear, setCommissionYear] = useState([]);
  const [commissionMonth, setCommissionMonth] = useState([]);
  const [categoryYear, setCategoryYear] = useState([]);
  const [categoryMonth, setCategoryMonth] = useState([]);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [statusOverview, setStatusOverview] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [commissionView, setCommissionView] = useState("year");
  const [categoryView, setCategoryView] = useState("year");

  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user?.token, user?.role]);

  const fetchData = async () => {
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {

      // SELLER STATS
      const statsRes = await fetch(
        "http://localhost:5000/admin/seller/stats",
        { headers }
      );
      const statsData = await statsRes.json();

      setSellerStats([
        {
          title: "Total Sellers",
          value: statsData.totalSellers,
          change: statsData.growth?.sellers || 0,
        },
        {
          title: "Active Sellers",
          value: statsData.activeSellers,
          change: 0,
        },
        {
          title: "Inactive Sellers",
          value: statsData.inactiveSellers,
          change: 0,
        },
        {
          title: "Suspended Sellers",
          value: statsData.suspendedSellers,
          change: 0,
        },
        {
          title: "Total Commission",
          value: `$${statsData.totalCommission?.toLocaleString() || 0}`,
          change: statsData.growth?.commission || 0,
        },
      ]);

      // COMMISSION TREND
      const yearTrend = await fetch(
        "http://localhost:5000/admin/seller/commission-trend?group=year",
        { headers }
      );
      setCommissionYear(await yearTrend.json());

      const monthTrend = await fetch(
        "http://localhost:5000/admin/seller/commission-trend?group=month",
        { headers }
      );
      setCommissionMonth(await monthTrend.json());

      // CATEGORY COMMISSION
      const yearCategory = await fetch(
        "http://localhost:5000/admin/seller/category-commission?group=year",
        { headers }
      );
      setCategoryYear(await yearCategory.json());

      const monthCategory = await fetch(
        "http://localhost:5000/admin/seller/category-commission?group=month",
        { headers }
      );
      setCategoryMonth(await monthCategory.json());

      // REGISTRATION TREND
      const reg = await fetch(
        "http://localhost:5000/admin/seller/registration-trend",
        { headers }
      );
      setRegistrationTrend(await reg.json());

      // STATUS OVERVIEW
      const status = await fetch(
        "http://localhost:5000/admin/seller/status-overview",
        { headers }
      );
      setStatusOverview(await status.json());

      // TOP SELLERS
      const top = await fetch(
        "http://localhost:5000/admin/seller/top",
        { headers }
      );

      const topData = await top.json();

      setSellers(
        topData.map((s) => ({
          id: s.sellerId,
          name: s.sellerName,
          store: s.store,
          status: s.status,
          totalSale: s.totalSale,
          commission: s.commission,
        }))
      );

    } catch (error) {

      console.error("Failed to fetch seller data:", error);

    }

  };

  const handleSaveSeller = async (seller) => {

    await fetch(
      `http://localhost:5000/admin/seller/${seller.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shop_name: seller.shop_name,
          status: seller.status,
        }),
      }
    );

    fetchData();
    setSelectedSeller(null);

  };

  const handleDeleteSeller = async (sellerId) => {

    await fetch(
      `http://localhost:5000/admin/seller/${sellerId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchData();
    setSelectedSeller(null);

  };

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
      render: (row) => {

        const status = (row.status || "").toLowerCase();

        let color = "text-yellow-600";

        if (status === "active") color = "text-green-600";
        if (status === "inactive") color = "text-red-600";

        const label =
          status.charAt(0).toUpperCase() + status.slice(1);

        return (
          <span className={`font-medium ${color}`}>
            ● {label}
          </span>
        );
      },
    },
    {
      label: "Action",
      key: "action",
      render: (row) => (
        <button
          onClick={() => setSelectedSeller({ ...row })}
          className="px-4 py-1 text-sm border rounded-md hover:bg-gray-100 transition"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>

      <div className="top-20 max-w-7xl mx-auto space-y-8">

        <h1 className="text-2xl font-semibold text-gray-800">
          Seller Management
        </h1>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                  ? commissionYear
                  : commissionMonth
              }
            />
          </div>

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
                  ? categoryYear
                  : categoryMonth
              }
            />
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Seller Registration Trend
            </h3>

            <BarChartBox data={registrationTrend} color="#10B981" />
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Sellers Status Overview
            </h3>

            <PieChartBox data={statusOverview} />
          </div>

        </div>

        <div className="bg-white rounded-xl border p-6">

          <h3 className="font-semibold text-center mb-4">
            Top Seller Table
          </h3>

          <DataTable columns={sellerColumns} data={sellers} />

        </div>

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
