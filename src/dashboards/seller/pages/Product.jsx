import React, { useState } from "react";
import SellerNav from "../components/Navbar";
import { products as initialProducts } from "../data/products";

/* =========================
   PRODUCT CARD
========================= */
const ProductCard = ({ product, onEdit, onDelete, onPromotion }) => (
  <div className="flex flex-col gap-3 rounded-xl bg-white shadow-sm overflow-hidden">
    <img
      src={product.image}
      alt={product.name}
      className="h-40 w-full object-cover"
    />
    <div className="px-4 py-3 flex flex-col gap-1">
      <h3 className="text-base font-semibold">{product.name}</h3>
      <span className="text-sm text-gray-500">{product.category}</span>
      <span className="text-sm font-medium text-green-600">
        Discount: {product.discount}
      </span>
      <span className="text-sm text-gray-700">
        ${product.price} | Stock: {product.stock} | {product.rating} ⭐
      </span>
    </div>
    <div className="px-4 py-3 flex flex-col gap-2">
      <button
        onClick={() => onEdit(product)}
        className="rounded bg-black py-2 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(product.id)}
        className="rounded bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
      >
        Delete
      </button>
      <button
        onClick={() => onPromotion(product.id)}
        className="rounded bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600"
      >
        Add Promotion
      </button>
    </div>
  </div>
);

/* =========================
   MODAL
========================= */
const ProductModal = ({ onClose, onSave, product }) => {
  const [form, setForm] = useState(
    product || { name: "", category: "", price: "", stock: "", image: "" }
  );

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[320px] rounded-xl bg-white p-5 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
          type="number"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          type="number"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            {product ? "Update" : "Add"}
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
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleSave = (data) => {
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...p, ...data } : p
        )
      );
    } else {
      setProducts([
        ...products,
        { id: Date.now(), rating: 5, discount: "0%", ...data },
      ]);
    }
    setShowModal(false);
  };

  const handlePromotion = (id) => {
    const value = prompt("Enter discount (%)");
    if (!value) return;
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, discount: `${value}%` } : p
      )
    );
  };

  return (
    <>
      <SellerNav />

      {/* SAME WRAPPER AS SELLER HOME */}
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 py-6">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                Product Management
              </h1>
              <p className="text-gray-500">
                Manage your product inventory
              </p>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              + Add Product
            </button>
          </div>

          {/* Search */}
          <input
            className="mb-6 w-full max-w-sm rounded border border-gray-300 px-4 py-2 text-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products
              .filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setShowModal(true);
                  }}
                  onDelete={(id) =>
                    setProducts(
                      products.filter((p) => p.id !== id)
                    )
                  }
                  onPromotion={handlePromotion}
                />
              ))}
          </div>

          {showModal && (
            <ProductModal
              product={editingProduct}
              onClose={() => setShowModal(false)}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Product;
