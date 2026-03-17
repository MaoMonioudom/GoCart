<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28

export default function CustomerDetailModal({
  customer,
  onClose,
  onSave,
  onDelete,
}) {
<<<<<<< HEAD
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...customer });
=======

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
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

<<<<<<< HEAD
  const handleSave = () => {
    onSave({
      ...formData,
      orders: Number(formData.orders),
      totalSpend: Number(formData.totalSpend),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(`Remove ${customer.name}?`)
    ) {
      onDelete(customer.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
=======
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
      <div className="bg-white rounded-xl w-[520px] p-6 relative">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-6">
          Customer Details
        </h2>

        <div className="space-y-4 text-sm">
<<<<<<< HEAD
          {[
            ["Name", "name"],
            ["Phone", "phone"],
            ["Orders", "orders"],
            ["Total Spend", "totalSpend"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="flex justify-between items-center"
            >
              <span className="text-gray-500">{label}</span>

              {isEditing ? (
                <input
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded text-right w-40"
                />
              ) : (
                <span className="font-medium">
                  {key === "totalSpend"
                    ? `$${Number(formData[key]).toLocaleString()}`
                    : formData[key]}
                </span>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status</span>

            {isEditing ? (
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border px-2 py-1 rounded"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            ) : (
              <span
                className={`font-medium ${
                  formData.status === "Active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ● {formData.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleDelete}
=======

          {/* Editable Fields */}

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Name</span>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border px-3 py-1 rounded w-48 text-right"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Phone</span>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="border px-3 py-1 rounded w-48 text-right"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Email</span>

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border px-3 py-1 rounded w-48 text-right"
            />
          </div>

          {/* Read Only Fields */}

          <div className="flex justify-between">
            <span className="text-gray-500">Orders</span>
            <span>{customer.orders}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Total Spend</span>
            <span>${customer.totalSpend}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>

            <span
              className={
                customer.status === "Active"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              ● {customer.status}
            </span>

          </div>

        </div>

        {/* Buttons */}

        <div className="flex justify-between mt-8">

          <button
            onClick={handleDelete}
            disabled={loading}
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
            className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50"
          >
            Remove Customer
          </button>

          <div className="flex gap-2">
<<<<<<< HEAD
=======

>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
            <button
              onClick={onClose}
              className="border px-4 py-2 rounded"
            >
              Close
            </button>

<<<<<<< HEAD
            {isEditing ? (
              <button
                onClick={handleSave}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Edit Customer
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
=======
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
