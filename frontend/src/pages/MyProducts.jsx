import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyProducts.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";
import defaultProduct from "../assets/default-product.png";
import {
  FaLeaf,
  FaTag,
  FaCalendarAlt,
  FaBox,
  FaMoneyBillWave,
  FaRecycle,
} from "react-icons/fa";

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    avgEcoPoints: 0,
  });

  // 🌿 Load Products
  const loadProducts = () => {
    const stored = JSON.parse(localStorage.getItem("ecoProducts")) || [];
    setProducts(stored);

    if (stored.length > 0) {
      const totalRevenue = stored.reduce(
        (sum, p) => sum + p.price * (p.sold || 0),
        0
      );
      const totalEco = stored.reduce((sum, p) => sum + (p.ecoPoints || 0), 0);
      const avgEco = (totalEco / stored.length).toFixed(1);

      setStats({
        totalProducts: stored.length,
        totalRevenue,
        avgEcoPoints: avgEco,
      });
    }
  };

  useEffect(() => {
    loadProducts();

    const handleStorage = (event) => {
      if (event.key === "ecoProducts" || event.key === "refreshSellerPages") {
        loadProducts();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 🌿 Delete Product
  const handleDelete = (id) => {
    if (!window.confirm("🗑 Delete this product?")) return;

    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);

    localStorage.setItem("ecoProducts", JSON.stringify(updated));
    localStorage.setItem("refreshSellerPages", Date.now());

    alert("✅ Product deleted!");
  };

  // 🌿 Edit Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
  };

  const closeModal = () => setEditingProduct(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setFormData((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updatedProduct = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      ecoPoints: Number(formData.ecoPoints),
      sold: Number(formData.sold || 0),
      dateAdded: formData.dateAdded || new Date().toISOString(),
      productId: formData.productId, // keep same ID
    };

    const updated = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );

    setProducts(updated);
    localStorage.setItem("ecoProducts", JSON.stringify(updated));
    localStorage.setItem("refreshSellerPages", Date.now());

    alert("✅ Product updated!");
    closeModal();
  };

  return (
    <div className="my-products-page">
      <SellerNavbar />

      {/* Top Bar */}
      <div className="top-bar">
        <h1>🌱 My Eco Products</h1>
        <button
          className="top-add-btn"
          onClick={() => navigate("/seller/add-product")}
        >
          ➕ Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="seller-stats">
        <div className="stat-card">
          <FaBox className="stat-icon box" />
          <h3>{stats.totalProducts}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <FaMoneyBillWave className="stat-icon money" />
          <h3>₹{stats.totalRevenue}</h3>
          <p>Total Revenue</p>
        </div>
        <div className="stat-card">
          <FaLeaf className="stat-icon leaf" />
          <h3>{stats.avgEcoPoints}</h3>
          <p>Avg. Eco Points</p>
        </div>
        <div className="stat-card">
          <FaRecycle className="stat-icon recycle" />
          <h3>{Math.round(stats.avgEcoPoints * stats.totalProducts)}</h3>
          <p>Eco Impact Score</p>
        </div>
      </div>

      {/* Product Grid */}
      <section className="products-container">
        {products.length === 0 ? (
          <div className="no-products">
            <h3>No products yet 😢</h3>
            <button onClick={() => navigate("/seller/add-product")}>
              ➕ Add Product
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div className="product-card new-style" key={p.id}>
                <div className="product-image-wrap">
                  <img
                    src={p.image || defaultProduct}
                    alt={p.name}
                    className="product-image"
                  />

                  {/* Eco Points */}
                  <div className="eco-badge">
                    <FaLeaf /> {p.ecoPoints ?? 0} EP
                  </div>

                  {/* Category */}
                  <div className="category-tag">
                    <FaTag /> {p.category || "General"}
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="prod-name">{p.name}</h3>

                  {/* Product ID */}
                  <p className="prod-id">
                    <strong>ID:</strong> {p.productId}
                  </p>

                  <p className="prod-desc">
                    {p.description?.slice(0, 60) || "No description"}...
                  </p>

                  <div className="price-stock-box">
                    <div>
                      <span className="label">Price</span>
                      <h4>₹{p.price}</h4>
                    </div>

                    <div>
                      <span className="label">Stock</span>
                      <h4>{p.stock}</h4>
                    </div>

                    <div>
                      <span className="label">Sold</span>
                      <h4>{p.sold ?? 0}</h4>
                    </div>
                  </div>

                  <div className="date-row">
                    <FaCalendarAlt />
                    {p.dateAdded
                      ? new Date(p.dateAdded).toLocaleDateString()
                      : "—"}
                  </div>
                </div>

                <div className="card-actions new-actions">
                  <button className="edit-btn" onClick={() => openEditModal(p)}>
                    ✏️ Edit
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
      </section>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="edit-modal unique"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>✏️ Edit Product</h2>
              <button className="close-icon" onClick={closeModal}>
                ✖
              </button>
            </div>

            <div className="modal-body">
              <div className="preview-section">
                <img
                  src={formData.image || defaultProduct}
                  alt="Preview"
                  className="modal-image-preview"
                />

                <label className="upload-btn">
                  📸 Change Image
                  <input type="file" accept="image/*" onChange={handleImage} />
                </label>
              </div>

              <div className="form-section">
                <div className="input-group">
                  <label>Product ID</label>
                  <input type="text" value={formData.productId} disabled />
                </div>

                <div className="input-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Eco Points</label>
                  <input
                    type="number"
                    name="ecoPoints"
                    value={formData.ecoPoints || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave}>
                💾 Save
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyProducts;
