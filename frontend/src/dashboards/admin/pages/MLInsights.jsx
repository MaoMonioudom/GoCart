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
