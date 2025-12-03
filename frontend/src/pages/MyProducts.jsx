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

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const sellerId = user?.id || "";
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    avgEcoPoints: 0,
    ecoImpactScore: 0,
    totalSold: 0,
  });

  const loadProductsRaw = async () => {
    if (!sellerId) return [];

    try {
      const res = await fetch(
        `http://localhost:8080/api/seller/${sellerId}/products`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error loading products:", err);
      return [];
    }
  };

  const loadOrders = async () => {
    if (!sellerId) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/orders/seller/${sellerId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = await res.json();
      setSellerOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading seller orders:", err);
    }
  };

  const loadProducts = async () => {
    const rawProducts = await loadProductsRaw();
    if (!rawProducts.length) {
      setProducts([]);
      return;
    }

    let updatedProducts = [...rawProducts];

    const sellerItems = sellerOrders.flatMap((order) =>
      (order.items || []).filter(
        (item) => String(item.sellerId) === String(sellerId)
      )
    );

    updatedProducts = updatedProducts.map((prod) => {
      const soldItems = sellerItems.filter(
        (i) => String(i.productId) === String(prod.id)
      );

      const sold = soldItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      const updatedStock = prod.stock - sold;

      return {
        ...prod,
        sold: sold,
        stock: updatedStock < 0 ? 0 : updatedStock,
      };
    });

    setProducts(updatedProducts);
  };

  useEffect(() => {
    (async () => {
      await loadOrders();
    })();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [sellerOrders]);

  useEffect(() => {
    const sync = (e) => {
      if (e.key === "refreshSellerPages") {
        loadOrders();
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!products.length && !sellerOrders.length) return;

    const sellerItems = sellerOrders.flatMap((order) =>
      (order.items || []).filter(
        (item) => String(item.sellerId) === String(sellerId)
      )
    );

    const totalRevenue = sellerItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalSold = sellerItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const totalEco = products.reduce(
      (sum, p) => sum + Number(p.ecoPoints || 0),
      0
    );

    setStats({
      totalProducts: products.length,
      totalRevenue,
      avgEcoPoints: products.length ? (totalEco / products.length).toFixed(1) : 0,
      ecoImpactScore: totalEco,
      totalSold,
    });
  }, [products, sellerOrders]);

  const handleDelete = async (id) => {
    if (!window.confirm("🗑 Delete this product?")) return;

    await fetch(
      `http://localhost:8080/api/seller/products/${id}/${sellerId}`,
      {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    alert("Deleted!");
    loadOrders();
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData(product);
  };

  const closeModal = () => setEditingProduct(null);

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setFormData((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const updated = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      ecoPoints: Number(formData.ecoPoints),
      sold: Number(formData.sold || 0),
    };

    const res = await fetch(
      `http://localhost:8080/api/seller/products/${editingProduct.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(updated),
      }
    );

    if (!res.ok) return alert("❌ Update failed!");

    alert("Updated Successfully!");
    closeModal();
    loadOrders();
  };

  const safeImage = (img) => {
    if (!img) return defaultProduct;
    if (img.startsWith("data:image")) return img;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `http://localhost:8080${img}`;
    return defaultProduct;
  };

  return (
    <div className="my-products-page">
      <SellerNavbar />

      <div className="top-bar">
        <h1>🌱 My Eco Products</h1>
        <button
          className="top-add-btn"
          onClick={() => navigate("/seller/add-product")}
        >
          ➕ Add Product
        </button>
      </div>

      <div className="seller-stats">
        <div className="stat-card">
          <FaBox className="stat-icon box" />
          <h3>{stats.totalProducts}</h3>
          <p>Total Products</p>
        </div>

        <div className="stat-card">
          <FaMoneyBillWave className="stat-icon money" />
          <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>

        <div className="stat-card">
          <FaLeaf className="stat-icon leaf" />
          <h3>{stats.avgEcoPoints}</h3>
          <p>Avg. Eco Points</p>
        </div>

        <div className="stat-card">
          <FaRecycle className="stat-icon recycle" />
          <h3>{stats.ecoImpactScore}</h3>
          <p>Eco Impact Score</p>
        </div>

        <div className="stat-card">
          <FaBox className="stat-icon violet" />
          <h3>{stats.totalSold}</h3>
          <p>Total Sold</p>
        </div>
      </div>

      <section className="products-container">
        {products.length === 0 ? (
          <div className="no-products">
            <h3>No products yet 😢</h3>
            <button onClick={() => navigate("/seller/add-product")}>
              ➕ Add Product
            </button>
          </div>
        ) : (
          <div className="product-grid1">
            {products.map((p) => {
              const isOutOfStock = (p.stock || 0) <= 0;
              const isLowStock = !isOutOfStock && (p.stock || 0) < 5;

              return (
                <div className="product-card new-style" key={p.id}>
                  <div className="product-image-wrap">
                    <div className="stock-badges">
                      {isOutOfStock && (
                        <span className="badge badge-out">Out of Stock</span>
                      )}
                      {isLowStock && (
                        <span className="badge badge-low">Low Stock</span>
                      )}
                    </div>

                    <img
                      src={safeImage(p.image)}
                      alt={p.name}
                      className="product-image"
                    />

                    <div className="eco-badge">
                      <FaLeaf /> {p.ecoPoints || 0} EP
                    </div>

                    <div className="category-tag">
                      <FaTag /> {p.category || "General"}
                    </div>
                  </div>

                  <div className="product-info">
                    <h3 className="prod-name">{p.name}</h3>

                    <p className="prod-id">
                      <strong>ID:</strong> {p.id}
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
                        <h4>{p.sold || 0}</h4>
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
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(p)}
                    >
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
              );
            })}
          </div>
        )}
      </section>

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
                  src={safeImage(formData.image)}
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

                {/* ⭐ UPDATED — FREE TEXT CATEGORY INPUT */}
                <div className="input-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="Enter or create a category"
                    value={formData.category || ""}
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
