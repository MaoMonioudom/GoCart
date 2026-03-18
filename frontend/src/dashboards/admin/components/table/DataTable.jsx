export default function DataTable({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b text-xs sm:text-sm text-gray-500">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-3 sm:px-4 font-medium whitespace-nowrap"
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
                className="text-center py-6 text-gray-400 text-sm"
              >
                No data available
              </td>
            </tr>
          )}

          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b text-xs sm:text-sm hover:bg-gray-50"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-3 sm:px-4 whitespace-nowrap">
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
    </div>
  );
}
