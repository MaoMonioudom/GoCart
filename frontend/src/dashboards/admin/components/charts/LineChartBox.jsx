import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

export default function LineChartBox({
  data = [],
  color = "#0ea5e9", // default blue
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
          <YAxis tick={{ fill: "#6B7280" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
