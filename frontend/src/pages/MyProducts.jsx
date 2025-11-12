import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyProducts.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";
import defaultProduct from "../assets/default-product.png";
import { FaLeaf, FaTag, FaCalendarAlt, FaBox, FaMoneyBillWave, FaRecycle } from "react-icons/fa";

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({ totalProducts: 0, totalRevenue: 0, avgEcoPoints: 0 });

  // 🌿 Load products from localStorage
  const loadProducts = () => {
    const stored = JSON.parse(localStorage.getItem("ecoProducts")) || [];
    setProducts(stored);
    if (stored.length > 0) {
      const totalRevenue = stored.reduce((sum, p) => sum + p.price * (p.sold || 0), 0);
      const totalEco = stored.reduce((sum, p) => sum + (p.ecoPoints || 0), 0);
      const avgEco = (totalEco / stored.length).toFixed(1);
      setStats({ totalProducts: stored.length, totalRevenue, avgEcoPoints: avgEco });
    } else {
      setStats({ totalProducts: 0, totalRevenue: 0, avgEcoPoints: 0 });
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
    if (!window.confirm("🗑 Are you sure you want to delete this product?")) return;
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("ecoProducts", JSON.stringify(updated));
    localStorage.setItem("refreshSellerPages", String(Date.now()));
    loadProducts();
    alert("✅ Product deleted successfully!");
  };

  // ✏️ Edit Modal
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
    reader.onload = () => setFormData((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updatedProduct = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      ecoPoints: Number(formData.ecoPoints || 0),
      sold: Number(formData.sold || 0),
      dateAdded: formData.dateAdded || new Date().toISOString(),
    };

    const updated = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(updated);
    localStorage.setItem("ecoProducts", JSON.stringify(updated));
    localStorage.setItem("refreshSellerPages", String(Date.now()));
    loadProducts();
    alert("✅ Product updated successfully!");
    closeModal();
  };

  return (
    <div className="my-products-page">
      <SellerNavbar />

      {/* 🌿 Header */}
      <header className="my-products-header">
        <h1>🌱 My Eco Products</h1>
        <p>Track, edit, and monitor your sustainable product journey.</p>
      </header>

      {/* 📊 Seller Stats Panel */}
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

      {/* 📦 Product Grid Section */}
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
              <div className="product-card" key={p.id}>
                <div className="product-image-wrap">
                  <img src={p.image || defaultProduct} alt={p.name} className="product-image" />
                </div>

                <div className="product-info">
                  <h3>{p.name}</h3>
                  <div className="meta">
                    <span className="category"><FaTag /> {p.category || "Uncategorized"}</span>
                    <span className="eco"><FaLeaf /> {p.ecoPoints ?? "—"} EP</span>
                  </div>

                  <p className="desc">{p.description || "No description provided."}</p>

                  <div className="info-box">
                    <p><strong>₹{p.price}</strong></p>
                    <p>Stock: {p.stock}</p>
                  </div>

                  <div className="footer-row">
                    <small>Sold: {p.sold ?? 0}</small>
                    <small className="date">
                      <FaCalendarAlt />{" "}
                      {p.dateAdded
                        ? new Date(p.dateAdded).toLocaleDateString()
                        : "—"}
                    </small>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="edit-btn" onClick={() => openEditModal(p)}>✏️ Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Add Button */}
      <button
        className="floating-add-btn"
        onClick={() => navigate("/seller/add-product")}
      >
        ➕
      </button>

      {/* ✏️ Edit Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit Product</h2>
            <div className="modal-content">
              <label>Product Name</label>
              <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />

              <label>Price (₹)</label>
              <input type="number" name="price" value={formData.price || ""} onChange={handleChange} />

              <label>Stock</label>
              <input type="number" name="stock" value={formData.stock || ""} onChange={handleChange} />

              <label>Sold</label>
              <input type="number" name="sold" value={formData.sold ?? 0} onChange={handleChange} />

              <label>Category</label>
              <select name="category" value={formData.category || ""} onChange={handleChange}>
                <option>Accessories</option>
                <option>Home</option>
                <option>Electronics</option>
                <option>Stationery</option>
                <option>Clothing</option>
              </select>

              <label>Eco Points</label>
              <input type="number" name="ecoPoints" value={formData.ecoPoints || ""} onChange={handleChange} />

              <label>Description</label>
              <textarea name="description" value={formData.description || ""} onChange={handleChange} rows="3" />

              <label>Product Image</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {formData.image && <img src={formData.image} alt="Preview" className="modal-preview" />}
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>💾 Save</button>
              <button className="cancel-btn" onClick={closeModal}>✖ Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyProducts;
