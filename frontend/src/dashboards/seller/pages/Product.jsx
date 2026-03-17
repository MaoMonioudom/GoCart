import React, { useState, useEffect, useCallback } from "react";
import SellerNav from "../components/Navbar";
import {
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
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
const ProductCard = ({ product, onEdit, onDelete, onPromotion, onToggleStatus }) => {
  const allImages = product.images || [];
  const mainIdx = Math.max(0, allImages.findIndex((img) => img.is_main));
  const [hoverIdx, setHoverIdx] = useState(mainIdx);

  const displayImage =
    allImages[hoverIdx]?.image_url ||
    "/placeholder.png";

  const isActive = product.status === "active";

  return (
    <div className={`flex flex-col rounded-xl bg-white shadow-sm overflow-hidden border ${isActive ? "border-gray-100" : "border-gray-300 opacity-75"}`}>
      {/* Image area */}
      <div className="relative px-4 pt-4">
        <div className="w-full h-40 overflow-hidden rounded-lg bg-gray-50">
          <img src={displayImage} alt={product.name}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }}
            className={`w-full h-full object-cover transition-all duration-300 hover:scale-105 ${!isActive ? "grayscale" : ""}`} />
        </div>
        <span className={`absolute top-6 left-6 px-2 py-0.5 text-xs font-semibold rounded-full ${
          isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
        }`}>{isActive ? "Active" : "Inactive"}</span>
        {allImages.length > 1 && (
          <span className="absolute top-6 right-6 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
            {allImages.length} photos
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-1.5 px-4 pt-2 overflow-x-auto">
          {allImages.map((img, i) => (
            <button key={img.image_id ?? i}
              onMouseEnter={() => setHoverIdx(i)}
              onClick={() => setHoverIdx(i)}
              className={`flex-shrink-0 w-9 h-9 rounded border-2 overflow-hidden transition-all ${
                hoverIdx === i ? "border-black" : img.is_main ? "border-blue-400" : "border-transparent hover:border-gray-300"
              }`}>
              <img src={img.image_url} alt="" className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.png"; }} />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
        <span className="text-xs text-gray-500">{product.category_name || product.category}</span>
        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-bold text-gray-900">${product.price}</span>
          <span className="text-xs text-gray-500">Stock: {product.stock_quantity}</span>
        </div>

        {/* Spec tags — show up to 3 key specs as small pills */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
                <span className="text-gray-400 capitalize">{key.replace(/_/g, " ")}:</span>
                <span className="font-medium text-gray-700 truncate max-w-[80px]">{String(value)}</span>
              </span>
            ))}
          </div>
        )}

        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex gap-1.5">
          <button onClick={() => onEdit(product)}
            className="flex-1 bg-blue-50 text-blue-600 py-1.5 text-xs font-medium rounded hover:bg-blue-100 transition-colors border border-blue-200">Edit</button>
          <button onClick={() => onToggleStatus(product)}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors border ${
              isActive ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                       : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
            }`}>{isActive ? "Deactivate" : "Activate"}</button>
          <button onClick={() => onPromotion(product)}
            className="flex-1 bg-purple-50 text-purple-600 py-1.5 text-xs font-medium rounded hover:bg-purple-100 transition-colors border border-purple-200">Promo</button>
          <button onClick={() => onDelete(product.product_id)}
            className="flex-1 bg-red-50 text-red-600 py-1.5 text-xs font-medium rounded hover:bg-red-100 transition-colors border border-red-200">Delete</button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   CATEGORY SPECS CONFIG
   Maps category name keywords → array of field definitions
   Each field: { key, label, type: "text"|"number"|"select"|"date", options? }
========================= */
const CATEGORY_SPECS = {
  electronic: [
    { key: "type",     label: "Device Type",  type: "select",
      options: ["Phone","Laptop","Tablet","Smart TV","Camera","Headphones","Printer","Other"] },
    { key: "brand",    label: "Brand",         type: "text",   placeholder: "e.g. Samsung, Apple" },
    { key: "warranty", label: "Warranty",      type: "select",
      options: ["No Warranty","3 Months","6 Months","1 Year","2 Years"] },
  ],
  fashion: [
    { key: "type",     label: "Clothing Type", type: "select",
      options: ["T-Shirt","Shirt","Pants","Dress","Skirt","Jacket","Shoes","Bag","Other"] },
    { key: "size",     label: "Available Sizes", type: "select",
      options: ["One Size","XS","S","M","L","XL","XXL","XXXL"] },
    { key: "material", label: "Material / Fabric", type: "text", placeholder: "e.g. Cotton, Polyester" },
    { key: "color",    label: "Color",          type: "text",   placeholder: "e.g. Red, Navy Blue" },
  ],
  food: [
    { key: "type",     label: "Food Type",     type: "select",
      options: ["Fresh Food","Packaged","Beverage","Snack","Dairy","Bakery","Condiment","Other"] },
    { key: "weight",   label: "Weight / Volume", type: "text", placeholder: "e.g. 500g, 1L" },
    { key: "expiry",   label: "Expiry Date",   type: "date" },
  ],
  drink: [
    { key: "type",     label: "Drink Type",    type: "select",
      options: ["Water","Juice","Soda","Coffee","Tea","Energy Drink","Milk","Other"] },
    { key: "volume",   label: "Volume",        type: "text",   placeholder: "e.g. 330ml, 1L" },
    { key: "expiry",   label: "Expiry Date",   type: "date" },
  ],
  accessori: [
    { key: "type",     label: "Accessory Type", type: "select",
      options: ["Bag","Wallet","Belt","Watch","Jewelry","Hat","Sunglasses","Scarf","Other"] },
    { key: "material", label: "Material",       type: "text",  placeholder: "e.g. Leather, Gold" },
    { key: "color",    label: "Color",          type: "text",  placeholder: "e.g. Black, Silver" },
  ],
  skincare: [
    { key: "type",     label: "Product Type",  type: "select",
      options: ["Moisturizer","Cleanser","Serum","Sunscreen","Face Mask","Toner","Eye Cream","Other"] },
    { key: "skin_type",label: "Skin Type",     type: "select",
      options: ["All Skin Types","Oily","Dry","Combination","Sensitive"] },
    { key: "volume",   label: "Volume (ml)",   type: "text",  placeholder: "e.g. 50ml" },
  ],
  beauty: [
    { key: "type",     label: "Product Type",  type: "select",
      options: ["Lipstick","Foundation","Mascara","Perfume","Nail Polish","Eyeshadow","Other"] },
    { key: "skin_type",label: "Skin Type",     type: "select",
      options: ["All Skin Types","Oily","Dry","Combination","Sensitive"] },
    { key: "volume",   label: "Volume / Weight", type: "text", placeholder: "e.g. 30ml, 5g" },
  ],
  book: [
    { key: "author",   label: "Author",        type: "text",  placeholder: "e.g. J.K. Rowling" },
    { key: "genre",    label: "Genre",         type: "select",
      options: ["Fiction","Non-Fiction","Science","History","Biography","Self-Help","Children","Other"] },
    { key: "language", label: "Language",      type: "select",
      options: ["English","Khmer","Chinese","French","Japanese","Other"] },
    { key: "pages",    label: "Pages",         type: "number", placeholder: "e.g. 320" },
  ],
  household: [
    { key: "type",     label: "Item Type",     type: "select",
      options: ["Kitchen","Bathroom","Bedroom","Living Room","Storage","Garden","Lighting","Other"] },
    { key: "material", label: "Material",      type: "text",  placeholder: "e.g. Plastic, Wood" },
    { key: "dimensions",label: "Dimensions",  type: "text",  placeholder: "e.g. 30 x 20 x 10 cm" },
  ],
};

/** Match a category name to its spec fields by keyword */
function getSpecFields(categoryName) {
  if (!categoryName) return [];
  const lower = categoryName.toLowerCase();
  for (const [keyword, fields] of Object.entries(CATEGORY_SPECS)) {
    if (lower.includes(keyword)) return fields;
  }
  return [];
}

/* =========================
   PRODUCT MODAL (multi-image + category specs)
========================= */
const MAX_IMAGES = 6;

const ProductModal = ({ onClose, onSave, product, categories, loading }) => {
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name || "",
          category_id: product.category_id || "",
          price: product.price || "",
          stock_quantity: product.stock_quantity || "",
          description: product.description || "",
        }
      : { name: "", category_id: "", price: "", stock_quantity: "", description: "" }
  );

  // Dynamic spec values keyed by field.key
  const [specs, setSpecs] = useState(() => product?.specifications || {});
  const setSpec = (key, val) => setSpecs((prev) => ({ ...prev, [key]: val }));

  // Derive spec fields from the currently selected category name
  const selectedCategoryName = categories.find(
    (c) => String(c.category_id) === String(form.category_id)
  )?.category_name || "";
  const specFields = getSpecFields(selectedCategoryName);

  // When category changes, keep only specs that belong to the new category
  const handleCategoryChange = (newCatId) => {
    const newCatName = categories.find((c) => String(c.category_id) === String(newCatId))?.category_name || "";
    const newFields = getSpecFields(newCatName);
    const validKeys = new Set(newFields.map((f) => f.key));
    setSpecs((prev) => {
      const next = {};
      for (const k of Object.keys(prev)) {
        if (validKeys.has(k)) next[k] = prev[k];
      }
      return next;
    });
    setForm((f) => ({ ...f, category_id: newCatId }));
  };

  // Images state
  const [images, setImages] = useState(() => {
    if (!product?.images?.length) return [];
    return product.images.map((img, i) => ({
      uid: `existing-${img.image_id ?? i}`,
      preview: img.image_url,
      file: null,
      is_main: img.is_main || false,
      image_id: img.image_id,
    }));
  });

  const [activePreview, setActivePreview] = useState(0);

  useEffect(() => {
    if (activePreview >= images.length && images.length > 0)
      setActivePreview(images.length - 1);
  }, [images.length]);

  const handleFilesAdded = (files) => {
    const remaining = MAX_IMAGES - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      const uid = `new-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      setImages((prev) => {
        const isFirstEver = prev.length === 0;
        return [...prev, { uid, preview, file, is_main: isFirstEver, image_id: null }];
      });
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFilesAdded(e.dataTransfer.files);
  };

  const removeImage = (uid) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.uid !== uid);
      const anyMain = next.some((img) => img.is_main);
      if (!anyMain && next.length > 0) next[0] = { ...next[0], is_main: true };
      return next;
    });
  };

  const setMain = (uid) => {
    setImages((prev) => prev.map((img) => ({ ...img, is_main: img.uid === uid })));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category_id || !form.price) {
      alert("Please fill in required fields: Name, Category, and Price");
      return;
    }

    const imagePayload = await Promise.all(
      images.map(async (img) => {
        if (img.file) {
          const base64 = await fileToBase64(img.file);
          return { data: base64, is_main: img.is_main };
        }
        return { url: img.preview, is_main: img.is_main, image_id: img.image_id };
      })
    );

    // Strip empty spec values before saving
    const cleanSpecs = Object.fromEntries(
      Object.entries(specs).filter(([, v]) => v !== "" && v != null)
    );

    const productData = {
      name: form.name,
      category_id: parseInt(form.category_id),
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity) || 0,
      description: form.description || "",
      specifications: cleanSpecs,
      images: imagePayload,
    };

    onSave(productData);
  };

  // Render a single spec field
  const renderSpecField = (field) => {
    const val = specs[field.key] || "";
    const base = "border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";
    if (field.type === "select") {
      return (
        <div key={field.key} className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-gray-700">{field.label}</label>
          <select value={val} onChange={(e) => setSpec(field.key, e.target.value)} className={base}>
            <option value="">Select…</option>
            {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div key={field.key} className="flex flex-col">
        <label className="text-sm font-medium mb-1 text-gray-700">{field.label}</label>
        <input
          type={field.type || "text"}
          value={val}
          onChange={(e) => setSpec(field.key, e.target.value)}
          placeholder={field.placeholder || ""}
          className={base}
        />
      </div>
    );
  };

  const currentPreview = images[activePreview];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-8 space-y-6 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* LEFT: Basic Info + Specs */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-gray-700 pb-2 border-b border-gray-100">Basic Information</h3>

            {/* Name */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1.5 text-gray-700">Product Name *</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter product name"
                className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1.5 text-gray-700">Category *</label>
              <select value={form.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>

            {/* Dynamic spec fields */}
            {specFields.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {selectedCategoryName} Specifications
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {specFields.map(renderSpecField)}
                </div>
              </div>
            )}

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1.5 text-gray-700">Price *</label>
                <input type="number" value={form.price} min="0" step="0.01"
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1.5 text-gray-700">Stock</label>
                <input type="number" value={form.stock_quantity} min="0"
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  placeholder="0"
                  className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1.5 text-gray-700">Description</label>
              <textarea value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write something about your product"
                rows={5}
                className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* RIGHT: Images */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-700 pb-2 border-b border-gray-100">
              Product Images
              <span className="ml-2 text-xs font-normal text-gray-400">({images.length}/{MAX_IMAGES}) — click thumbnail to set as main</span>
            </h3>

            {/* Main preview */}
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden relative">
              {currentPreview ? (
                <>
                  <img src={currentPreview.preview} alt="preview" className="w-full h-full object-contain" />
                  {currentPreview.is_main && (
                    <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 rounded-full font-medium">Main</span>
                  )}
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setActivePreview((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-8 h-8 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button onClick={() => setActivePreview((i) => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-8 h-8 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-14 h-14 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No images yet</p>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={img.uid} className="relative group">
                  <button
                    onClick={() => { setActivePreview(i); setMain(img.uid); }}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                      activePreview === i ? "border-black" : img.is_main ? "border-blue-400" : "border-gray-200 hover:border-gray-400"
                    }`}>
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  </button>
                  {img.is_main && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] px-1 rounded-full leading-4">★</span>
                  )}
                  <button
                    onClick={() => removeImage(img.uid)}
                    className="absolute -top-1.5 -left-1.5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center shadow"
                    style={{ width: 18, height: 18 }}>
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => handleFilesAdded(e.target.files)} />
                </label>
              )}
            </div>

            {/* Drop zone when empty */}
            {images.length === 0 && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById("bulk-upload").click()}>
                <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500 mb-1">Drag & drop or <span className="text-blue-500 font-medium">browse</span></p>
                <p className="text-xs text-gray-400">PNG, JPG up to 10 MB · up to {MAX_IMAGES} images</p>
                <input id="bulk-upload" type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => handleFilesAdded(e.target.files)} />
              </div>
            )}

            <p className="text-xs text-gray-400">Click a thumbnail to preview &amp; set it as main (★). Hover to remove.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button onClick={onClose} disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-8 py-2.5 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? "Saving…" : product ? "Update Product" : "Create Product"}
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
  const [statusFilter, setStatusFilter] = useState("all");

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
    { title: "Total Products", value: products.length, change: null },
    { title: "Active",         value: products.filter((p) => p.status === "active").length, change: null },
    { title: "Inactive",       value: products.filter((p) => p.status === "inactive").length, change: null },
    { title: "Out Of Stock",   value: products.filter((p) => p.stock_quantity === 0).length, change: null },
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
      await fetchData();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.error || "Failed to delete product");
    }
  };

  const handleToggleStatus = async (product) => {
    const isActive = product.status === "active";
    const action = isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} "${product.name}"?${isActive ? " It will be hidden from customers." : " It will become visible to customers."}`)) {
      return;
    }
    try {
      setError(null);
      await toggleProductStatus(product.product_id);
      await fetchData();
    } catch (err) {
      console.error("Error toggling product status:", err);
      alert(err.response?.data?.error || "Failed to update product status");
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" ||
      p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

              {/* Search + Filter */}
              <div className="mb-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative w-full max-w-sm">
                  <input
                    className="w-full border border-gray-300 px-4 py-2.5 pl-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex gap-2">
                  {["all", "active", "inactive"].map((f) => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                        statusFilter === f ? "bg-black text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
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
                      onToggleStatus={handleToggleStatus}
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