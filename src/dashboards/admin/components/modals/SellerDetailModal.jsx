import { useState } from "react";

export default function SellerDetailModal({
  seller,
  onClose,
  onSave,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...seller });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
            className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50"
          >
            Remove Seller
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="border px-4 py-2 rounded"
            >
              Close
            </button>

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
