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

  const renderInput = (label, value, onChange, type = "text") => (
    <div className="flex flex-col w-full">
      <label className="text-base font-medium mb-2">{label}</label>
      <input
        type={type}
        className="w-full border px-4 py-3 rounded text-base"
        value={value}
        onChange={onChange}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[500px] rounded-xl bg-white p-8 space-y-5">
        <h2 className="text-xl font-semibold">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        {renderInput("Product Name", form.name, (e) => setForm({ ...form, name: e.target.value }))}
        
        <div className="flex flex-col w-full">
          <label className="text-base font-medium mb-2">Category</label>
          <select
            className="w-full border px-4 py-3 rounded text-base"
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

        {renderInput("Price", form.price, (e) => setForm({ ...form, price: e.target.value }), "number")}
        {renderInput("Stock", form.stock, (e) => setForm({ ...form, stock: e.target.value }), "number")}
        {renderInput("Image URL", form.image, (e) => setForm({ ...form, image: e.target.value }))}

        {/* Category Specific Fields */}
        {form.category === "Electronic" && (
          <>
            {renderInput("Brand", form.details.brand || "", (e) => updateDetails("brand", e.target.value))}
            {renderInput("Material", form.details.material || "", (e) => updateDetails("material", e.target.value))}
            {renderInput("Color", form.details.color || "", (e) => updateDetails("color", e.target.value))}
          </>
        )}

        {form.category === "Fashion and Clothing" && (
          <>
            {renderInput("Brand", form.details.brand || "", (e) => updateDetails("brand", e.target.value))}
            {renderInput("Size", form.details.size || "", (e) => updateDetails("size", e.target.value))}
            {renderInput("Fabric", form.details.fabric || "", (e) => updateDetails("fabric", e.target.value))}
          </>
        )}

        {form.category === "Food and Drink" && (
          <>
            {renderInput("Brand", form.details.brand || "", (e) => updateDetails("brand", e.target.value))}
            {renderInput("Ingredients", form.details.ingredients || "", (e) => updateDetails("ingredients", e.target.value))}
            {renderInput("Expiration Date", form.details.expirationDate || "", (e) => updateDetails("expirationDate", e.target.value))}
          </>
        )}

        {form.category === "Book" && (
          <>
            {renderInput("Author", form.details.author || "", (e) => updateDetails("author", e.target.value))}
            {renderInput("Pages", form.details.pages || "", (e) => updateDetails("pages", e.target.value))}
          </>
        )}

        <div className="flex justify-end gap-3 pt-3">
          <button onClick={onClose} className="text-base text-gray-600 px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-5 py-2 text-base rounded"
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
