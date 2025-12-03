import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";
import SellerNavbar from "../components/SellerNavbar.jsx";
import Footer from "../components/Footer.jsx";
import defaultProduct from "../assets/default-product.png";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sellerId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    ecoPoints: "",
    description: "",
    image: "",
  });

  const [carbonRules, setCarbonRules] = useState(null);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/admin/carbon-rules", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setCarbonRules(res.data);
      } catch (err) {
        console.log("⚠️ Carbon rules not found, using default.");
      }
    };
    loadRules();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setProduct((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const calculateEcoPoints = () => {
    if (!carbonRules) return product.ecoPoints ? Number(product.ecoPoints) : 50;

    let base = carbonRules.baseEcoPoints || 10;
    let multiplier = 1;

    switch (product.category?.toLowerCase()) {
      case "accessories":
        multiplier = carbonRules.accessoriesMultiplier || 1;
        break;
      case "clothing":
        multiplier = carbonRules.clothingMultiplier || 1;
        break;
      case "electronics":
        multiplier = carbonRules.electronicsMultiplier || 1;
        break;
      case "home":
        multiplier = carbonRules.plasticMultiplier || 1;
        break;
      default:
        multiplier = 1;
    }

    return Math.min(100, Math.round(base * multiplier));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!sellerId) {
      alert("⚠️ You must login as seller.");
      navigate("/");
      return;
    }

    if (!product.name || !product.price || !product.stock || !product.description) {
      alert("⚠️ Fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    const finalEcoPoints =
      product.ecoPoints && product.ecoPoints !== ""
        ? Number(product.ecoPoints)
        : calculateEcoPoints();

    const productData = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      category: product.category || "General",
      ecoPoints: finalEcoPoints,
      image: product.image,
    };

    try {
      const response = await axios.post(
        `http://localhost:8080/api/seller/product/${sellerId}`,
        productData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("✅ Product added successfully!");
        navigate("/my-products");
      } else {
        alert("⚠️ Failed to add product.");
      }
    } catch (error) {
      console.error("Add Product Error:", error);
      alert("⚠️ Error adding product.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="add-product-page">
      <SellerNavbar />

      <div className="add-modal-overlay">
        <div className="add-modal">
          <div className="modal-header">
            <h2>🌱 Add New Product</h2>
            <button className="close-btn" onClick={() => navigate("/my-products")}>
              ✖
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="image-section">
              <img
                src={product.image || defaultProduct}
                alt="Preview"
                className="preview-image"
              />

              <label className="upload-btn">
                📸 Upload Image
                <input type="file" accept="image/*" onChange={handleImage} />
              </label>
            </div>

            <div className="input-grid">
              <div className="input-field">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="input-field">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={product.stock}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              {/* ⭐ Updated: Manual category text input */}
              <div className="input-field">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Enter or create new category"
                  value={product.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>Eco Points (optional)</label>
                <input
                  type="number"
                  name="ecoPoints"
                  value={product.ecoPoints}
                  onChange={handleChange}
                  min="1"
                  max="100"
                />

                {product.category && !product.ecoPoints && carbonRules && (
                  <p className="hint">
                    Auto Eco Points: <strong>{calculateEcoPoints()}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="input-field full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                value={product.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="action-buttons">
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "➕ Add Product"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/my-products")}
                disabled={isSubmitting}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddProduct;
