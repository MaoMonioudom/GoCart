<<<<<<< HEAD
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";
import LineChartBox from "../components/charts/LineChartBox";
import BarChartBox from "../components/charts/BarChartBox";

import {
  mlStats,
  mlAccuracyData,
  userBehaviorData,
} from "../admindata/ml";

export default function MLInsights() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          ML Insights
        </h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {mlStats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
            />
          ))}
        </div>

        {/* ML Accuracy */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Product Recommendation Accuracy
          </h3>

          <LineChartBox
            data={mlAccuracyData}
            color="#0ea5e9"
          />

          <p className="text-sm text-gray-500 mt-4">
            Line chart represents the monthly accuracy of the ML
            recommendation system. Higher accuracy indicates better
            personalized product suggestion for customers.
          </p>
        </div>

        {/* User Behavior Overview */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            User Behavior Overview
          </h3>

          <BarChartBox
            data={userBehaviorData}
            colors={["#F87171", "#60A5FA", "#34D399", "#FBBF24"]}
          />

          <p className="text-sm text-gray-500 mt-4">
            This chart shows the number of user interactions such as
            views, add-to-cart actions, purchases, and searches.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
=======
// import { useEffect, useState } from "react";
// import DashboardLayout from "../components/layout/DashboardLayout";
// import StatCard from "../components/cards/StatCard";
// import LineChartBox from "../components/charts/LineChartBox";
// import BarChartBox from "../components/charts/BarChartBox";
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNSwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzczNzQxOTY4fQ.nNOHYhysqZX_RpHlM2XEtFN4vpu17h05Cy9MF7Z-1ho";
// export default function MLInsights() {
//   // const token = localStorage.getItem("token");

//   const [mlStats, setMlStats] = useState([]);
//   const [mlAccuracyData, setMlAccuracyData] = useState([]);
//   const [userBehaviorData, setUserBehaviorData] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     const headers = {
//       Authorization: `Bearer ${token}`,
//     };

//     try {
//       // =========================
//       // FETCH STAT CARDS
//       // =========================
//       const viewedRes = await fetch(
//         "http://localhost:5000/admin/ml/most-viewed",
//         { headers }
//       );
//       const viewed = await viewedRes.json();

//       const purchasedRes = await fetch(
//         "http://localhost:5000/admin/ml/most-purchased",
//         { headers }
//       );
//       const purchased = await purchasedRes.json();

//       const freqRes = await fetch(
//         "http://localhost:5000/admin/ml/purchase-frequency",
//         { headers }
//       );
//       const frequency = await freqRes.json();

//       const convRes = await fetch(
//         "http://localhost:5000/admin/ml/conversion-rate",
//         { headers }
//       );
//       const conversion = await convRes.json();

//       setMlStats([
//         {
//           title: `Top Viewed: ${viewed.product}`,
//           value: viewed.views,
//         },
//         {
//           title: `Top Purchased: ${purchased.product}`,
//           value: purchased.purchased,
//         },
//         {
//           title: "Avg Orders / User",
//           value: frequency.averageOrdersPerUser,
//         },
//         {
//           title: "Conversion Rate (%)",
//           value: `${conversion.conversionRate}%`,
//         },
//       ]);

//       // =========================
//       // FETCH LINE CHART
//       // =========================
//       const accRes = await fetch(
//         "http://localhost:5000/admin/ml/recommendation-accuracy",
//         { headers }
//       );
//       const accuracy = await accRes.json();
//       setMlAccuracyData(accuracy);

//       // =========================
//       // FETCH BAR CHART
//       // =========================
//       const behaviorRes = await fetch(
//         "http://localhost:5000/admin/ml/user-behavior",
//         { headers }
//       );
//       const behavior = await behaviorRes.json();
//       setUserBehaviorData(behavior);

//     } catch (error) {
//       console.error("ML Dashboard Error:", error);
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="max-w-7xl mx-auto space-y-8">

//         {/* Title */}
//         <h1 className="text-2xl font-semibold text-gray-800">
//           ML Insights
//         </h1>

//         {/* Top Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {mlStats.map((item) => (
//             <StatCard
//               key={item.title}
//               title={item.title}
//               value={item.value}
//             />
//           ))}
//         </div>

//         {/* ML Accuracy */}
//         <div className="bg-white rounded-xl border p-6">
//           <h3 className="font-semibold text-gray-700 mb-4">
//             Product Recommendation Accuracy
//           </h3>

//           <LineChartBox
//             data={mlAccuracyData}
//             color="#0ea5e9"
//           />

//           <p className="text-sm text-gray-500 mt-4">
//             Line chart represents the monthly accuracy of the ML
//             recommendation system. Higher accuracy indicates better
//             personalized product suggestion for customers.
//           </p>
//         </div>

//         {/* User Behavior Overview */}
//         <div className="bg-white rounded-xl border p-6">
//           <h3 className="font-semibold text-gray-700 mb-4">
//             User Behavior Overview
//           </h3>

//           <BarChartBox
//             data={userBehaviorData}
//             colors={["#F87171", "#60A5FA", "#34D399", "#FBBF24"]}
//           />

//           <p className="text-sm text-gray-500 mt-4">
//             This chart shows the number of user interactions such as
//             views, add-to-cart actions, purchases, and searches.
//           </p>
//         </div>

//       </div>
//     </DashboardLayout>
//   );
// }
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
