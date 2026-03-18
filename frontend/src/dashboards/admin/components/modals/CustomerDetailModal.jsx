import { useState, useEffect } from "react";

export default function CustomerDetailModal({
  customer,
  onClose,
  onSave,
  onDelete,
}) {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
    });
  }, [customer]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {

    setLoading(true);

    await onSave({
      ...customer,
      ...formData,
    });

    setLoading(false);
  };

  const handleDelete = async () => {

    if (!window.confirm(`Delete ${customer.name}?`)) return;

    setLoading(true);

    await onDelete(customer.id);

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-xl w-full max-w-lg p-5 sm:p-6 relative">

        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-black">✕</button>

        <h2 className="text-lg font-semibold mb-6">Customer Details</h2>

        <div className="space-y-4 text-sm">

          {[
            { label: "Name", name: "name" },
            { label: "Phone", name: "phone" },
            { label: "Email", name: "email" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-500">{label}</span>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="border px-3 py-1 rounded w-full sm:w-48 sm:text-right"
              />
            </div>
          ))}

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-500">Orders</span>
            <span>{customer.orders}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-500">Total Spend</span>
            <span>${customer.totalSpend}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-500">Status</span>
            <span className={customer.status === "Active" ? "text-green-600" : "text-red-600"}>
              ● {customer.status}
            </span>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6 sm:mt-8">

          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 order-2 sm:order-1"
          >
            Remove Customer
          </button>

          <div className="flex gap-2 order-1 sm:order-2">
            <button onClick={onClose} className="flex-1 sm:flex-none border px-4 py-2 rounded">Close</button>
            <button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none bg-black text-white px-4 py-2 rounded">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
