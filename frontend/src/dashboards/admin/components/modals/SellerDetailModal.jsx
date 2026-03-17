import { useState, useEffect } from "react";

export default function SellerDetailModal({
  seller,
  onClose,
  onSave,
  onDelete,
}) {

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
