// import React, { useEffect, useMemo, useState } from "react";
// import SellerNav from "../components/Navbar";

// import {
//   getSellerStats,
//   getSellerLowStockAlerts,
//   getSellerSalesTrend,
//   getSellerQuantityAnalytics,
//   getSellerComparisonAnalytics,
// } from "../../../services/sellerDashboardService";

// import { getSellerProducts, getCategories } from "../../../services/productService";

// // Optional: keep charts only if your project already has these installed.
// import { Line, Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function SellerHome() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [stats, setStats] = useState({});
//   const [alerts, setAlerts] = useState([]);
//   const [salesTrend, setSalesTrend] = useState([]);
//   const [quantityAnalytics, setQuantityAnalytics] = useState([]);
//   const [comparisonAnalytics, setComparisonAnalytics] = useState([]);

//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchAll = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const [
//           statsData,
//           alertsData,
//           trendData,
//           quantityData,
//           comparisonData,
//           productsData,
//           categoriesData,
//         ] = await Promise.all([
//           getSellerStats(),
//           getSellerLowStockAlerts(),
//           getSellerSalesTrend(),
//           getSellerQuantityAnalytics(),
//           getSellerComparisonAnalytics(),
//           getSellerProducts(),
//           getCategories(),
//         ]);

//         if (cancelled) return;

//         // Stats are typically an object
//         setStats(statsData || {});

//         // These should be arrays; ensure fallback to []
//         setAlerts(alertsData || []);
//         setSalesTrend(trendData || []);
//         setQuantityAnalytics(quantityData || []);
//         setComparisonAnalytics(comparisonData || []);

//         // Match Product.jsx behavior exactly
//         setProducts(productsData?.products || []);
//         setCategories(categoriesData?.categories || []);
//       } catch (e) {
//         const msg =
//           e?.response?.data?.message ||
//           e?.response?.data?.error ||
//           e?.message ||
//           "Unable to load dashboard.";
//         setError(String(msg));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchAll();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // Build category map (safe: categories always array)
//   const categoryNameById = useMemo(() => {
//     const map = {};
//     (categories || []).forEach((c) => {
//       // Your category object uses: category_id, category_name
//       if (c?.category_id != null) map[c.category_id] = c.category_name;
//     });
//     return map;
//   }, [categories]);

//   // Build product map
//   const productById = useMemo(() => {
//     const map = {};
//     (products || []).forEach((p) => {
//       if (p?.product_id != null) map[p.product_id] = p;
//     });
//     return map;
//   }, [products]);

//   // KPI values (use stats first, fallback to computed)
//   const totalProducts = Number(stats?.total_products ?? products.length ?? 0);
//   const activeProducts = Number(
//     stats?.active_products ?? products.filter((p) => (p.stock_quantity ?? 0) > 0).length
//   );
//   const lowStockCount = Number(
//     stats?.low_stock ?? products.filter((p) => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) < 10).length
//   );
//   const outOfStockCount = Number(
//     stats?.out_of_stock ?? products.filter((p) => (p.stock_quantity ?? 0) === 0).length
//   );

//   // Charts (safe defaults)
//   const salesTrendChart = useMemo(() => {
//     const labels = (salesTrend || [])
//       .map((t) => String(t?.date ?? "").slice(0, 10))
//       .filter(Boolean);

//     const values = (salesTrend || []).map((t) => Number(t?.quantity ?? 0));

//     return {
//       labels,
//       datasets: [{ label: "Units Sold", data: values }],
//     };
//   }, [salesTrend]);

//   const quantityChart = useMemo(() => {
//     const labels = (quantityAnalytics || []).map((x) => {
//       const pid = x?.product_id;
//       const p = pid != null ? productById[pid] : null;
//       return p?.name ?? x?.product_name ?? `Product ${pid ?? ""}`.trim();
//     });

//     const values = (quantityAnalytics || []).map((x) =>
//       Number(x?.quantity ?? x?.total_quantity ?? 0)
//     );

//     return {
//       labels,
//       datasets: [{ label: "Total Units Sold", data: values }],
//     };
//   }, [quantityAnalytics, productById]);

//   return (
//     <>
//       <SellerNav />
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
//           <div className="mb-6">
//             <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
//               Seller Dashboard
//             </h1>
//             <p className="text-gray-600 mt-1">Performance Overview</p>
//           </div>

//           {loading && (
//             <div className="flex items-center justify-center py-20">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//           )}

//           {!loading && error && (
//             <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//               {error}
//             </div>
//           )}

//           {!loading && !error && (
//             <>
//               {/* KPI cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//                 <StatCard title="Total Products" value={totalProducts} />
//                 <StatCard title="Active" value={activeProducts} />
//                 <StatCard title="Low Stock" value={lowStockCount} />
//                 <StatCard title="Out Of Stock" value={outOfStockCount} />
//               </div>

//               {/* Charts */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                 <Panel title="Sales Trend (Units)">
//                   {salesTrendChart.labels.length === 0 ? (
//                     <EmptyState text="No sales trend data available." />
//                   ) : (
//                     <Line data={salesTrendChart} />
//                   )}
//                 </Panel>

//                 <Panel title="Units Sold by Product">
//                   {quantityChart.labels.length === 0 ? (
//                     <EmptyState text="No quantity analytics available." />
//                   ) : (
//                     <Bar data={quantityChart} />
//                   )}
//                 </Panel>
//               </div>

//               {/* Restock Alerts */}
//               <Panel title="Restock Alerts">
//                 {(alerts || []).length === 0 ? (
//                   <EmptyState text="No low stock alerts." />
//                 ) : (
//                   <div className="space-y-3">
//                     {(alerts || []).map((a, idx) => {
//                       const pid = a?.product_id;
//                       const p = pid != null ? productById[pid] : null;

//                       const name = p?.name ?? a?.product_name ?? "Unknown Product";
//                       const stock =
//                         a?.current_stock_level ?? a?.stock_quantity ?? p?.stock_quantity ?? "N/A";

//                       const categoryId = p?.category_id;
//                       const categoryName =
//                         categoryId != null ? categoryNameById[categoryId] : "";

//                       return (
//                         <div
//                           key={`${pid ?? "x"}-${idx}`}
//                           className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
//                         >
//                           <div>
//                             <div className="font-semibold text-gray-800">{name}</div>
//                             <div className="text-sm text-gray-500">
//                               {categoryName || "Unknown Category"}
//                             </div>
//                           </div>
//                           <div className="font-semibold text-gray-800">
//                             Stock: {stock}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </Panel>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// function StatCard({ title, value }) {
//   return (
//     <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
//       <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
//       <p className="text-2xl font-bold text-gray-900">{value}</p>
//     </div>
//   );
// }

// function Panel({ title, children }) {
//   return (
//     <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
//       <div className="font-semibold text-gray-800 mb-3">{title}</div>
//       {children}
//     </div>
//   );
// }

// function EmptyState({ text }) {
//   return (
//     <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-lg">
//       {text}
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import SellerNav from "../components/Navbar";

import {
  getSellerStats,
  getSellerLowStockAlerts,
  getSellerSalesTrend,
  getSellerQuantityAnalytics
} from "../../../services/sellerDashboardService";

import { getSellerProducts, getCategories } from "../../../services/productService";

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
  Legend
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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getSellerStats(),
        getSellerLowStockAlerts(),
        getSellerSalesTrend(),
        getSellerQuantityAnalytics(),
        getSellerProducts(),
        getCategories()
      ]);

      const [
        statsResult,
        alertsResult,
        trendResult,
        quantityResult,
        productsResult,
        categoriesResult
      ] = results;

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value || {});
      } else {
        setStats({});
      }

      if (alertsResult.status === "fulfilled") {
        setAlerts(alertsResult.value || []);
      } else {
        setAlerts([]);
      }

      if (trendResult.status === "fulfilled") {
        setSalesTrend(trendResult.value || []);
      } else {
        setSalesTrend([]);
      }

      if (quantityResult.status === "fulfilled") {
        setQuantityAnalytics(quantityResult.value || []);
      } else {
        setQuantityAnalytics([]);
      }

      if (productsResult.status === "fulfilled") {
        const productsData = productsResult.value;
        setProducts(Array.isArray(productsData) ? productsData : productsData?.products || []);
      } else {
        setProducts([]);
      }

      if (categoriesResult.status === "fulfilled") {
        const categoriesData = categoriesResult.value;
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || []);
      } else {
        setCategories([]);
      }

      const rejected = results.find((result) => result.status === "rejected");
      if (rejected) {
        const message =
          rejected.reason?.response?.data?.error ||
          rejected.reason?.response?.data?.message ||
          rejected.reason?.message ||
          "Failed to load dashboard";
        setError(message);
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

  const productById = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.product_id] = p;
    });
    return map;
  }, [products]);

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      map[c.category_id] = c.category_name;
    });
    return map;
  }, [categories]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    p => (p.stock_quantity ?? 0) > 0
  ).length;

  const lowStockCount = products.filter(
    p => (p.stock_quantity ?? 0) < 10 && (p.stock_quantity ?? 0) > 0
  ).length;

  const outOfStockCount = products.filter(
    p => (p.stock_quantity ?? 0) === 0
  ).length;

  const salesTrendChart = {
    labels: salesTrend.map(t => t.date?.slice(0, 10)),
    datasets: [
      {
        label: "Units Sold",
        data: salesTrend.map(t => t.quantity)
      }
    ]
  };

  const quantityChart = {
    labels: quantityAnalytics.map(q => {
      const p = productById[q.product_id];
      return p?.name || `Product ${q.product_id}`;
    }),
    datasets: [
      {
        label: "Units Sold",
        data: quantityAnalytics.map(q => q.quantity)
      }
    ]
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

          <h1 className="text-3xl font-bold mb-6">
            Seller Dashboard
          </h1>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* KPI CARDS */}

          <div className="grid grid-cols-4 gap-6 mb-8">

            <StatCard title="Total Products" value={totalProducts} />

            <StatCard title="Active Products" value={activeProducts} />

            <StatCard title="Low Stock" value={lowStockCount} />

            <StatCard title="Out Of Stock" value={outOfStockCount} />

          </div>

          {/* CHARTS */}

          <div className="grid grid-cols-2 gap-6 mb-8">

            <Panel title="Sales Trend">
              <Line data={salesTrendChart} />
            </Panel>

            <Panel title="Units Sold">
              <Bar data={quantityChart} />
            </Panel>

          </div>

          {/* LOW STOCK ALERTS */}

          <Panel title="Low Stock Alerts">

            {alerts.length === 0 ? (
              <p>No alerts</p>
            ) : (
              alerts.map(a => {

                const p = productById[a.product_id];

                return (
                  <div
                    key={a.product_id}
                    className="flex justify-between p-3 border rounded mb-2"
                  >

                    <div>

                      <div className="font-semibold">
                        {p?.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        {categoryNameById[p?.category_id]}
                      </div>

                    </div>

                    <div>
                      Stock: {p?.stock_quantity}
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

      <div className="text-gray-500 text-sm">
        {title}
      </div>

      <div className="text-2xl font-bold">
        {value}
      </div>

    </div>
  );
}

function Panel({ title, children }) {

  return (
    <div className="bg-white p-5 rounded shadow">

      <h3 className="font-semibold mb-3">
        {title}
      </h3>

      {children}

    </div>
  );
}