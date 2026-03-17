<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28

export default function SellerDetailModal({
  seller,
  onClose,
  onSave,
  onDelete,
}) {
<<<<<<< HEAD
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...seller });
=======

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    store: "",
    status: "inactive",
  });

  useEffect(() => {
    setFormData({
      store: seller.store || "",
      status: seller.status?.toLowerCase() || "inactive",
    });
  }, [seller]);
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
      totalSale: Number(formData.totalSale),
      commission: Number(formData.commission),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Remove ${seller.name}?`)) {
      onDelete(seller.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
=======
  const handleSave = async () => {

    setLoading(true);

    await onSave({
      id: seller.id,
      shop_name: formData.store,
      status: formData.status,
    });

    setLoading(false);

  };

  const handleDelete = async () => {

    const confirmDelete = window.confirm(
      `Remove ${seller.name}?`
    );

    if (!confirmDelete) return;

    await onDelete(seller.id);

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
          Seller Details
        </h2>

        <div className="space-y-4 text-sm">
<<<<<<< HEAD
          {[
            ["Seller Name", "name"],
            ["Store", "store"],
            ["Total Sales", "totalSale"],
            ["Commission Earned", "commission"],
          ].map(([label, key]) => (
            <div key={key} className="flex justify-between">
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
                  {key === "totalSale" || key === "commission"
                    ? `$${Number(formData[key]).toLocaleString()}`
                    : formData[key]}
                </span>
              )}
            </div>
          ))}

          <div className="flex justify-between">
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
                <option>Suspended</option>
              </select>
            ) : (
              <span className="text-green-600 font-medium">
                ● {formData.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleDelete}
=======

          <div className="flex justify-between">
            <span className="text-gray-500">Seller Name</span>
            <span className="font-medium">{seller.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Store</span>

            <input
              name="store"
              value={formData.store}
              onChange={handleChange}
              className="border px-3 py-1 rounded w-48 text-right"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status</span>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border px-3 py-1 rounded w-48 text-right"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Total Sales</span>
            <span>${Number(seller.totalSale || 0).toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Commission Earned</span>
            <span>${Number(seller.commission || 0).toLocaleString()}</span>
          </div>

        </div>

        <div className="flex justify-between mt-8">

          <button
            onClick={handleDelete}
            disabled={loading}
>>>>>>> b0d9770e90d8509e66ceac4c26030556bd6c4b28
            className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50"
          >
            Remove Seller
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
                Edit Seller
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
