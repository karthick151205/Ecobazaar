import React, { useEffect, useState } from "react";
import "./AdminProducts.css";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(`http://localhost:8080/api/admin/products/${id}`);
    loadProducts();
  };

  const saveUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/products/update/${editProduct.id}`,
        editProduct,
        { headers: { "Content-Type": "application/json" } }
      );
      setEditProduct(null);
      loadProducts();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="admin-products-page">
      <h2 className="section-title">📦 Product Moderation</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="admin-products-grid">
          {products.map((p) => (
            <div className="admin-product-card" key={p.id}>
              <img
                src={p.image}
                alt={p.name}
                className="admin-product-img"
                onError={(e) => (e.target.style.display = "none")}
              />

              <h3>{p.name}</h3>
              <p>Seller: {p.sellerId}</p>
              <p>Price: ₹{p.price}</p>
              <p>Stock: {p.stock}</p>
              <p>Category: {p.category}</p>

              <div className="admin-actions">
                <button
                  className="edit-btn"
                  onClick={() => setEditProduct({ ...p })}
                >
                  ✏ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ EDIT POPUP */}
      {editProduct && (
        <div className="edit-popup-overlay">
          <div className="edit-popup">
            <h3>Edit Product</h3>

            <label>Name</label>
            <input
              type="text"
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })
              }
            />

            <label>Price</label>
            <input
              type="number"
              value={editProduct.price}
              onChange={(e) =>
                setEditProduct({ ...editProduct, price: e.target.value })
              }
            />

            <label>Stock</label>
            <input
              type="number"
              value={editProduct.stock}
              onChange={(e) =>
                setEditProduct({ ...editProduct, stock: e.target.value })
              }
            />

            {/* ⭐⭐ FREE TEXT CATEGORY FIELD */}
            <label>Category</label>
            <input
              type="text"
              placeholder="Enter or add new category"
              value={editProduct.category}
              onChange={(e) =>
                setEditProduct({ ...editProduct, category: e.target.value })
              }
            />

            <label>Description</label>
            <textarea
              value={editProduct.description}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  description: e.target.value,
                })
              }
            ></textarea>

            <div className="popup-actions">
              <button className="save-btn" onClick={saveUpdate}>
                Save ✔
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditProduct(null)}
              >
                Cancel ✖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
