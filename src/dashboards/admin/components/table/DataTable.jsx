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
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
