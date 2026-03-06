import React, { useState, useEffect, useCallback } from "react";
import SellerNav from "../components/Navbar";
import {
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createPromotion,
  getProductPromotions,
  updatePromotion,
  deletePromotion,
} from "../../../services/productService";

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/* =========================
   PRODUCT CARD
========================= */
const ProductCard = ({ product, onEdit, onDelete, onPromotion }) => {
  // Get main image from images array
  const mainImage = product.images?.find((img) => img.is_main)?.image_url ||
    product.images?.[0]?.image_url ||
    "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="px-4 pt-4">
        <div className="w-full h-40 overflow-hidden rounded-lg">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        <h3 className="text-base font-semibold text-gray-800">{product.name}</h3>
        <span className="text-sm text-gray-500">{product.category_name || product.category}</span>

        <div className="flex items-center justify-between mt-1">
          {product.discount_percentage > 0 && (
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {product.discount_percentage}% OFF
            </span>
          )}
          <span className="text-sm text-gray-700">
            ⭐ {product.rating || "N/A"}
          </span>
        </div>

        <div className="mt-2">
          <span className="text-lg font-bold text-gray-900">${product.price}</span>
          <span className="text-sm text-gray-500 ml-2">Stock: {product.stock_quantity}</span>
        </div>

        {/* Show description if it exists */}
        {product.description && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <strong className="text-xs font-semibold text-gray-700">Description:</strong>
            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Horizontal buttons row */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex justify-between gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-blue-50 text-blue-600 py-2 text-xs font-medium rounded hover:bg-blue-100 transition-colors border border-blue-200"
          >
            Edit
          </button>

          <button
            onClick={() => onPromotion(product)}
            className="flex-1 bg-purple-50 text-purple-600 py-2 text-xs font-medium rounded hover:bg-purple-100 transition-colors border border-purple-200"
          >
            Promotion
          </button>

          <button
            onClick={() => onDelete(product.product_id)}
            className="flex-1 bg-red-50 text-red-600 py-2 text-xs font-medium rounded hover:bg-red-100 transition-colors border border-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MODAL
========================= */
const ProductModal = ({ onClose, onSave, product, categories, loading }) => {
  const emptyForm = {
    name: "",
    category_id: "",
    price: "",
    stock_quantity: "",
    description: "",
  };

  const [form, setForm] = useState(() => {
    if (product) {
      return {
        name: product.name || "",
        category_id: product.category_id || "",
        price: product.price || "",
        stock_quantity: product.stock_quantity || "",
        description: product.description || "",
      };
    }
    return emptyForm;
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => {
    if (product?.images?.length > 0) {
      const mainImg = product.images.find((img) => img.is_main) || product.images[0];
      return mainImg?.image_url || null;
    }
    return null;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category_id || !form.price) {
      alert("Please fill in required fields: Name, Category, and Price");
      return;
    }
    
    // Convert image to base64 if new image selected
    let images = [];
    if (imageFile) {
      try {
        const base64 = await fileToBase64(imageFile);
        images = [{ data: base64, is_main: true }];
      } catch (error) {
        console.error("Error converting image:", error);
        alert("Error processing image");
        return;
      }
    }

    const productData = {
      name: form.name,
      category_id: parseInt(form.category_id),
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity) || 0,
      description: form.description || "",
    };

    // Only include images if new image uploaded
    if (images.length > 0) {
      productData.images = images;
    }

    onSave(productData);
  };

  const renderInput = (label, value, onChange, type = "text", placeholder = "") => (
    <div className="flex flex-col w-full">
      <label className="text-base font-medium mb-3 text-gray-700">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-300 px-5 py-3.5 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );

  const renderTextarea = (label, value, onChange, placeholder = "") => (
    <div className="flex flex-col w-full">
      <label className="text-base font-semibold mb-3 text-gray-700">{label}</label>
      <textarea
        className="w-full border border-gray-300 px-5 py-3.5 rounded-lg text-base min-h-[180px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-10 space-y-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-semibold text-gray-800">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Left Column - Basic Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-6 pb-3 border-b border-gray-100">
                Basic Information
              </h3>
              <div className="space-y-6">
                {renderInput("Product Name *", form.name, (e) => setForm({ ...form, name: e.target.value }), "text", "Enter product name")}
                
                <div className="flex flex-col w-full">
                  <label className="text-base font-medium mb-3 text-gray-700">Category *</label>
                  <select
                    className="w-full border border-gray-300 px-5 py-3.5 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {renderInput("Price *", form.price, (e) => setForm({ ...form, price: e.target.value }), "number", "0.00")}
                  {renderInput("Stock *", form.stock_quantity, (e) => setForm({ ...form, stock_quantity: e.target.value }), "number", "0")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image & Description */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-6 pb-3 border-b border-gray-100">
                Product Image & Details
              </h3>
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="flex flex-col w-full">
                  <label className="text-base font-medium mb-3 text-gray-700">Product Image</label>
                  <label className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {renderTextarea(
                  "Description",
                  form.description,
                  (e) => setForm({ ...form, description: e.target.value }),
                  "Write something about your product"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-5 pt-8 border-t border-gray-200">
          <button 
            onClick={onClose} 
            className="px-8 py-3.5 text-base font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors hover:border-gray-400"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3.5 text-base font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   PROMOTION MODAL
========================= */
const PromotionModal = ({ product, onClose, onSave, loading }) => {
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [form, setForm] = useState({
    promo_name: "",
    discount_type: "percentage",
    discount_value: "",
    start_date: "",
    end_date: "",
  });
  const [editingPromo, setEditingPromo] = useState(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoadingPromotions(true);
      const data = await getProductPromotions(product.product_id);
      setPromotions(data.promotions || []);
    } catch (err) {
      console.error("Error fetching promotions:", err);
    } finally {
      setLoadingPromotions(false);
    }
  }, [product.product_id]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const resetForm = () => {
    setForm({
      promo_name: "",
      discount_type: "percentage",
      discount_value: "",
      start_date: "",
      end_date: "",
    });
    setEditingPromo(null);
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setForm({
      promo_name: promo.promo_name || "",
      discount_type: promo.disc_pct ? "percentage" : "fixed",
      discount_value: promo.disc_pct || promo.disc_amount || "",
      start_date: promo.start_date || "",
      end_date: promo.end_date || "",
    });
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await deletePromotion(promoId);
      await fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete promotion");
    }
  };

  const handleSubmit = async () => {
    if (!form.promo_name || !form.discount_value || !form.start_date || !form.end_date) {
      alert("Please fill in all fields");
      return;
    }

    const discountValue = parseFloat(form.discount_value);
    if (isNaN(discountValue) || discountValue <= 0) {
      alert("Discount value must be a positive number");
      return;
    }

    if (form.discount_type === "percentage" && discountValue > 100) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    if (form.discount_type === "fixed" && discountValue > parseFloat(product.price)) {
      alert(`Fixed discount cannot exceed product price ($${product.price})`);
      return;
    }

    const promoData = {
      promo_name: form.promo_name,
      discount_type: form.discount_type,
      discount_value: discountValue,
      start_date: form.start_date,
      end_date: form.end_date,
    };

    try {
      if (editingPromo) {
        await updatePromotion(editingPromo.promo_id, promoData);
      } else {
        await createPromotion(product.product_id, promoData);
      }
      await fetchPromotions();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save promotion");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Manage Promotions</h2>
            <p className="text-gray-500 text-sm mt-1">for {product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Existing Promotions */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">All Promotions</h3>
          <p className="text-sm text-gray-500 mb-3">Customer pages only show promotions while their date range is active.</p>
          {loadingPromotions ? (
            <p className="text-gray-500">Loading...</p>
          ) : promotions.length === 0 ? (
            <p className="text-gray-500 text-sm">No promotions yet</p>
          ) : (
            <div className="space-y-2">
              {promotions.map((promo) => {
                const statusLabel = promo.status === "active"
                  ? "Active"
                  : promo.status === "scheduled"
                    ? "Scheduled"
                    : "Expired";

                const statusClasses = promo.status === "active"
                  ? "bg-green-100 text-green-700"
                  : promo.status === "scheduled"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-200 text-gray-700";

                return (
                <div
                  key={promo.promo_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{promo.promo_name}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {promo.disc_pct ? `${promo.disc_pct}% off` : `$${promo.disc_amount} off`}
                      {" • "}
                      {promo.start_date} to {promo.end_date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(promo.promo_id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Promotion Form */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {editingPromo ? "Edit Promotion" : "Add New Promotion"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.promo_name}
                onChange={(e) => setForm({ ...form, promo_name: e.target.value })}
                placeholder="e.g., Summer Sale"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value ({form.discount_type === "percentage" ? "%" : "$"})
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  placeholder={form.discount_type === "percentage" ? "e.g., 20" : "e.g., 10.00"}
                  min="0"
                  max={form.discount_type === "percentage" ? "100" : undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {editingPromo && (
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {editingPromo ? "Update Promotion" : "Add Promotion"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MAIN PAGE
========================= */
const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoProduct, setPromoProduct] = useState(null);

  // Fetch products and categories on mount
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        getSellerProducts(),
        getCategories(),
      ]);
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.error || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate stats
  const productStats = [
    {
      title: "Total Products",
      value: products.length,
      change: null,
    },
    {
      title: "Active",
      value: products.filter((p) => p.stock_quantity > 0).length,
      change: null,
    },
    {
      title: "Low Stock",
      value: products.filter((p) => p.stock_quantity < 10 && p.stock_quantity > 0).length,
      change: null,
    },
    {
      title: "Out Of Stock",
      value: products.filter((p) => p.stock_quantity === 0).length,
      change: null,
    },
  ];

  const handleSave = async (data) => {
    try {
      setSaving(true);
      setError(null);

      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.product_id, data);
      } else {
        // Create new product
        await createProduct(data);
      }

      // Refresh products list
      await fetchData();
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Error saving product:", err);
      alert(err.response?.data?.error || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setError(null);
      await deleteProduct(productId);
      // Refresh products list
      await fetchData();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.error || "Failed to delete product");
    }
  };

  const handlePromotion = (product) => {
    setPromoProduct(product);
    setShowPromoModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <SellerNav />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">

          {/* Header Section */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory and details
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddProduct}
                className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
              <button
                onClick={fetchData}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* PRODUCT STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {productStats.map((stat) => (
                  <div 
                    key={stat.title} 
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                  >
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    {stat.change !== null && (
                      <div className="mt-3 flex items-center">
                        <span className={`text-sm font-medium ${
                          stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                        </span>
                        <span className="text-gray-500 text-sm ml-2">from last month</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Search Section */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <input
                    className="w-full border border-gray-300 px-4 py-2.5 pl-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {search && (
                  <p className="text-sm text-gray-500 mt-2">
                    Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for "{search}"
                  </p>
                )}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                  <div className="text-5xl mb-4 text-gray-300">📦</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {search ? "Try a different search term" : "Start by adding your first product"}
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    + Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPromotion={handlePromotion}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {showModal && (
            <ProductModal
              product={editingProduct}
              categories={categories}
              loading={saving}
              onClose={() => {
                setShowModal(false);
                setEditingProduct(null);
              }}
              onSave={handleSave}
            />
          )}

          {showPromoModal && promoProduct && (
            <PromotionModal
              product={promoProduct}
              onClose={() => {
                setShowPromoModal(false);
                setPromoProduct(null);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Product;