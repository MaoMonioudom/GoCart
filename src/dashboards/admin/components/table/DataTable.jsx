export default function DataTable({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 font-medium"
              >
                {col.label}
              </th>
            ))}
            <th className="text-left py-3 px-4 font-medium">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-6 text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}

          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b text-sm hover:bg-gray-50"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4">
                  {col.render
                    ? col.render(row)
                    : row[col.key]}
                </td>
              ))}

              <td className="py-3 px-4">
                <button className="border px-3 py-1 rounded text-sm hover:bg-gray-100">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
