export default function StatCard({ title, value, change }) {
  const isIncrease = change >= 0;

  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500 mb-2">{title}</p>

      {/* VALUE + PERCENTAGE (same row) */}
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-gray-900 leading-none">
          {value}
        </h2>

        {change !== undefined && (
          <div
            className={`text-sm flex items-center gap-1 leading-none ${
              isIncrease ? "text-green-600" : "text-red-500"
            }`}
          >
            <span>{isIncrease ? "↑" : "↓"}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
