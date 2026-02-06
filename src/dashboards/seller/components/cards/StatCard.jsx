export default function StatCard({ title, value, change }) {
  const isPositive = change > 0;

  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500 mb-1">
        {title}
      </p>

      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          {value}
        </h2>

        {change !== undefined && (
          <span
            className={`text-sm font-medium flex items-center gap-1 ${
              isPositive ? "text-green-600" : "text-red-500"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
