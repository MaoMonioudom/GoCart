import React, { useState } from "react";
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
        ${product.price} | Stock: {product.stock} | ⭐ {product.rating}
      </span>

      {/* Details in ONE LINE */}
      {product.details && Object.keys(product.details).length > 0 && (
        <div className="mt-1 text-xs text-gray-600 space-y-0.5">
          {Object.entries(product.details).map(([k, v]) => (
            <div key={k}>
              {k.replace(/([A-Z])/g, " $1").toLowerCase()}: {v}
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="px-4 py-3 flex flex-col gap-2">
      <button
        onClick={() => onEdit(product)}
        className="rounded bg-black py-2 text-sm text-white hover:bg-gray-800"
      >
        Edit
      </button>

      <button
        onClick={() => onDelete(product.id)}
        className="rounded bg-red-500 py-2 text-sm text-white hover:bg-red-600"
      >
        Delete
      </button>

      <button
        onClick={() => onPromotion(product.id)}
        className="rounded bg-blue-500 py-2 text-sm text-white hover:bg-blue-600"
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
  const emptyForm = {
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[360px] rounded-xl bg-white p-5 space-y-3">

        <h2 className="text-lg font-semibold">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="w-full border px-3 py-2 rounded text-sm"
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

        <input
          type="number"
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          type="number"
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        {/* ================= CATEGORY FIELDS ================= */}
        {form.category === "Electronic" && (
          <>
            <input placeholder="Brand" value={form.details.brand || ""} onChange={e => updateDetails("brand", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
            <input placeholder="Material" value={form.details.material || ""} onChange={e => updateDetails("material", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
            <input placeholder="Color" value={form.details.color || ""} onChange={e => updateDetails("color", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
          </>
        )}

        {form.category === "Fashion and Clothing" && (
          <>
            <input placeholder="Brand" value={form.details.brand || ""} onChange={e => updateDetails("brand", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
            <input placeholder="Size" value={form.details.size || ""} onChange={e => updateDetails("size", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
            <input placeholder="Fabric" value={form.details.fabric || ""} onChange={e => updateDetails("fabric", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
          </>
        )}

        {form.category === "Food and Drink" && (
          <>
            <input placeholder="Brand" value={form.details.brand || ""} onChange={e => updateDetails("brand", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
            <input placeholder="Ingredients" value={form.details.ingredients || ""} onChange={e => updateDetails("ingredients", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
            <input placeholder="Expiration Date" value={form.details.expirationDate || ""} onChange={e => updateDetails("expirationDate", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
          </>
        )}

        {form.category === "Book" && (
          <>
            <input placeholder="Author" value={form.details.author || ""} onChange={e => updateDetails("author", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
            <input placeholder="Pages" value={form.details.pages || ""} onChange={e => updateDetails("pages", e.target.value)} className="input w-full border px-3 py-2 rounded text-sm" />
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="text-sm text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-4 py-2 text-sm rounded"
          >
            Save
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
      setProducts(products.map(p =>
        p.id === editingProduct.id ? { ...p, ...data } : p
      ));
    } else {
      setProducts([
        ...products,
        {
          id: Date.now(),
          rating: 5,
          discount: "0%",
          status: "Active",
          ...data,
        },
      ]);
    }
    setShowModal(false);
  };

  const handlePromotion = (id) => {
    const value = prompt("Enter discount (%)");
    if (!value) return;
    setProducts(products.map(p =>
      p.id === id ? { ...p, discount: `${value}%` } : p
    ));
  };

  return (
    <>
      <SellerNav />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 py-6">

          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-4xl font-bold">Product Management</h1>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="bg-black text-white px-4 py-2 rounded"
            >
              + Add Product
            </button>
          </div>

          <input
            className="mb-6 w-full max-w-sm border px-4 py-2 rounded text-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
              .map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setShowModal(true);
                  }}
                  onDelete={(id) =>
                    setProducts(products.filter(p => p.id !== id))
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
