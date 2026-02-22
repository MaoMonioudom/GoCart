import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Dark, professional dashboard colors
const COLORS = [
  "#60A5FA", // Blue
  "#FACC15", // Yellow
  "#34D399", // Green
  "#F87171", // Red
  "#A78BFA", // Purple
  "#38BDF8", // Sky
  "#FB923C", // Orange
]

export default function PieChartBox({ data = [] }) {
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
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={90}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              color: "#374151", // gray-700
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
