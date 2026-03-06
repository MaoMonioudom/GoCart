import React, { useEffect, useMemo, useState } from "react";
import SellerNav from "../components/Navbar";
import { getSellerDashboard } from "../../../services/sellerDashboardService";

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

export default function SellerHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [quantityAnalytics, setQuantityAnalytics] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSellerDashboard();

        setStats(data?.stats || {});
        setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
        setSalesTrend(Array.isArray(data?.sales_trend) ? data.sales_trend : []);
        setQuantityAnalytics(Array.isArray(data?.quantity_analytics) ? data.quantity_analytics : []);
        setProducts(Array.isArray(data?.products) ? data.products : []);

        if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const productById = useMemo(() => {
    const map = {};
    products.forEach((product) => {
      if (product?.product_id != null) {
        map[product.product_id] = product;
      }
    });
    return map;
  }, [products]);

  const totalProducts = Number(stats?.total_products ?? products.length ?? 0);
  const activeProducts = Number(
    stats?.active_products ?? products.filter((product) => (product.stock_quantity ?? 0) > 0).length
  );
  const lowStockCount = Number(
    stats?.low_stock ?? products.filter((product) => {
      const stock = product.stock_quantity ?? 0;
      return stock > 0 && stock < 10;
    }).length
  );
  const outOfStockCount = Number(
    stats?.out_of_stock ?? products.filter((product) => (product.stock_quantity ?? 0) === 0).length
  );

  const salesTrendChart = {
    labels: salesTrend.map((item) => item.date?.slice(0, 10)),
    datasets: [
      {
        label: "Units Sold",
        data: salesTrend.map((item) => item.quantity),
      },
    ],
  };

  const quantityChart = {
    labels: quantityAnalytics.map((item) => {
      const product = productById[item.product_id];
      return product?.name || `Product ${item.product_id}`;
    }),
    datasets: [
      {
        label: "Units Sold",
        data: quantityAnalytics.map((item) => item.quantity),
      },
    ],
  };

  if (loading) {
    return (
      <>
        <SellerNav />
        <div className="p-10 text-center">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <SellerNav />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}</div>
          )}

          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Products" value={totalProducts} />
            <StatCard title="Active Products" value={activeProducts} />
            <StatCard title="Low Stock" value={lowStockCount} />
            <StatCard title="Out Of Stock" value={outOfStockCount} />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Panel title="Sales Trend">
              <Line data={salesTrendChart} />
            </Panel>

            <Panel title="Units Sold">
              <Bar data={quantityChart} />
            </Panel>
          </div>

          <Panel title="Low Stock Alerts">
            {alerts.length === 0 ? (
              <p>No alerts</p>
            ) : (
              alerts.map((alert) => {
                const product = productById[alert.product_id];
                return (
                  <div
                    key={alert.product_id}
                    className="flex justify-between p-3 border rounded mb-2"
                  >
                    <div>
                      <div className="font-semibold">
                        {alert.product_name || product?.name || `Product ${alert.product_id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {alert.category_name || product?.category_name || ""}
                      </div>
                    </div>

                    <div>
                      Stock: {alert.stock_quantity ?? product?.stock_quantity ?? 0}
                    </div>
                  </div>
                );
              })
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
