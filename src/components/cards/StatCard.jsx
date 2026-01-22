export default function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-2 text-gray-900">
        {value}
      </p>
    </div>
  )
}
