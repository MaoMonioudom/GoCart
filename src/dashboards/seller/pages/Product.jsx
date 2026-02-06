import React, { useState, useEffect } from "react";
import SellerNav from "../components/Navbar";
import { products as initialProducts } from "../data/products";

/* =========================
   CONSTANTS
========================= */
const CATEGORIES = [
  "Electronic",
  "Fashion and Clothing",
  "Food and Drink",
  "Book",
  "Accessory",
  "Skincare and Beauty",
  "Household",
];

/* =========================
   PRODUCT CARD
========================= */
const ProductCard = ({ product, onEdit, onDelete, onPromotion }) => (
  <div className="flex flex-col gap-3 rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100">
    {/* Smaller image with padding */}
    <div className="px-4 pt-4">
      <div className="w-full h-40 overflow-hidden rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>

    <div className="px-4 py-3 flex flex-col gap-2">
      <h3 className="text-base font-semibold text-gray-800">{product.name}</h3>
      <span className="text-sm text-gray-500">{product.category}</span>

      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
          {product.discount} OFF
        </span>
        <span className="text-sm text-gray-700">
          ⭐ {product.rating}
        </span>
      </div>

      <div className="mt-2">
        <span className="text-lg font-bold text-gray-900">${product.price}</span>
        <span className="text-sm text-gray-500 ml-2">Stock: {product.stock}</span>
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

      {/* Details in ONE LINE - Fixed spacing */}
      {product.details && Object.keys(product.details).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-600 space-y-1">
            {Object.entries(product.details).map(([k, v]) => (
              <div key={k} className="flex items-start">
                <span className="font-medium text-gray-700 w-16 flex-shrink-0">
                  {k.replace(/([A-Z])/g, " $1").toLowerCase()}:
                </span>
                <span className="text-gray-600 ml-1">{v}</span>
              </div>
            ))}
          </div>
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
          onClick={() => onPromotion(product.id)}
          className="flex-1 bg-purple-50 text-purple-600 py-2 text-xs font-medium rounded hover:bg-purple-100 transition-colors border border-purple-200"
        >
          Promotion
        </button>

        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 bg-red-50 text-red-600 py-2 text-xs font-medium rounded hover:bg-red-100 transition-colors border border-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* =========================
   MODAL
========================= */
const ProductModal = ({ onClose, onSave, product }) => {
  const emptyForm = {
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    description: "",
    details: {},
  };

  const [form, setForm] = useState(product || emptyForm);

  const updateDetails = (key, value) => {
    setForm({
      ...form,
      details: { ...form.details, [key]: value },
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.price) return;
    onSave(form);
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
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value, details: {} })
                    }
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {renderInput("Price *", form.price, (e) => setForm({ ...form, price: e.target.value }), "number", "0.00")}
                  {renderInput("Stock *", form.stock, (e) => setForm({ ...form, stock: e.target.value }), "number", "0")}
                </div>

                {renderInput("Image URL *", form.image, (e) => setForm({ ...form, image: e.target.value }), "text", "https://example.com/image.jpg")}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-6 pb-3 border-b border-gray-100">
                Product Details
              </h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  {renderTextarea(
                    "Description", 
                    form.description, 
                    (e) => setForm({ ...form, description: e.target.value }),
                    "Write something about your product"
                  )}
                  <p className="text-sm text-gray-500 italic">Optional. Describe your product in detail.</p>
                </div>

                {/* Category Specific Fields */}
                {form.category === "Electronic" && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Electronic Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {renderInput("Brand", form.details.brand || "", (e) => updateDetails("brand", e.target.value), "text", "Apple")}
                      {renderInput("Material", form.details.material || "", (e) => updateDetails("material", e.target.value), "text", "Aluminum")}
                      {renderInput("Color", form.details.color || "", (e) => updateDetails("color", e.target.value), "text", "Silver")}
                    </div>
                  </div>
                )}

                {form.category === "Fashion and Clothing" && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Clothing Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {renderInput("Brand", form.details.brand || "", (e) => updateDetails("brand", e.target.value), "text", "ZARA")}
                      {renderInput("Size", form.details.size || "", (e) => updateDetails("size", e.target.value), "text", "M, L, XL")}
                      {renderInput("Fabric", form.details.fabric || "", (e) => updateDetails("fabric", e.target.value), "text", "Cotton")}
                    </div>
                  </div>
                )}

                {form.category === "Food and Drink" && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Food Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {renderInput("Brand", form.details.brand || "", (e) => updateDetails("brand", e.target.value), "text", "Local Farm")}
                      {renderInput("Ingredients", form.details.ingredients || "", (e) => updateDetails("ingredients", e.target.value), "text", "Wheat, Egg")}
                      {renderInput("Expiration Date", form.details.expirationDate || "", (e) => updateDetails("expirationDate", e.target.value), "text", "2026-01-01")}
                    </div>
                  </div>
                )}

                {form.category === "Book" && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-medium text-gray-700 mb-4">Book Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {renderInput("Author", form.details.author || "", (e) => updateDetails("author", e.target.value), "text", "Dale Carnegie")}
                      {renderInput("Pages", form.details.pages || "", (e) => updateDetails("pages", e.target.value), "text", "320")}
                    </div>
                  </div>
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
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3.5 text-base font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            {product ? "Update Product" : "Create Product"}
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
  // Load products from localStorage on initial render
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("sellerProducts");
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        // Ensure images are properly restored (they might be imported as module objects)
        const restoredProducts = parsed.map(product => ({
          ...product,
          image: product.image || initialProducts.find(p => p.id === product.id)?.image
        }));
        return restoredProducts;
      } catch (error) {
        console.error("Error parsing saved products:", error);
        return initialProducts;
      }
    }
    return initialProducts;
  });
  
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Calculate stats - same as KPI format
  const productStats = [
    {
      title: "Total Products",
      value: products.length,
      change: null,
    },
    {
      title: "Active",
      value: products.filter(p => p.status === "Active").length,
      change: null,
    },
    {
      title: "Low Stock",
      value: products.filter(p => p.stock < 100 && p.stock > 0).length,
      change: null,
    },
    {
      title: "Out Of Stock",
      value: products.filter(p => p.stock === 0).length,
      change: null,
    }
  ];

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("sellerProducts", JSON.stringify(products));
  }, [products]);

  const handleSave = (data) => {
    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { 
          ...p, 
          ...data,
          price: Number(data.price),
          stock: Number(data.stock)
        } : p
      );
      setProducts(updatedProducts);
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        rating: 5,
        discount: "0%",
        status: "Active",
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description || "", // Ensure description is included
      };
      setProducts([...products, newProduct]);
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
    }
  };

  const handlePromotion = (id) => {
    const value = prompt("Enter discount (%)");
    if (!value) return;
    
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, discount: `${value}%` } : p
    );
    setProducts(updatedProducts);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  // Reset to initial products
  const handleResetProducts = () => {
    if (window.confirm("Reset all products to initial state? This will remove any custom products you've added.")) {
      setProducts(initialProducts);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
    (p.details?.brand && p.details.brand.toLowerCase().includes(search.toLowerCase()))
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
                onClick={handleResetProducts}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {/* ✅ PRODUCT STAT CARDS - Same style as KPI */}
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
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPromotion={handlePromotion}
                />
              ))}
            </div>
          )}

          {showModal && (
            <ProductModal
              product={editingProduct}
              onClose={() => {
                setShowModal(false);
                setEditingProduct(null);
              }}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Product;