import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API calls
import "./AddProduct.css";
import SellerNavbar from "../components/SellerNavbar.jsx"; // Fixed import
import Footer from "../components/Footer.jsx"; // Fixed import
import defaultProduct from "../assets/default-product.png";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    ecoPoints: "",
    description: "",
    image: "", // This will hold the base64 string of the image
  });

  // This function is no longer needed, the backend will generate IDs
  // const generateProductId = () => { ... };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      // Convert image to a base64 string
      reader.onload = () => setProduct((p) => ({ ...p, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  /**
   * NEW: This function now sends data to the Spring Boot backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!product.name || !product.price || !product.stock || !product.description) {
      alert("⚠️ Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    // 1. Get the authentication token from localStorage
    // (This assumes you store the token as "token" after login)
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ You are not logged in. Please log in to add a product.");
      setIsSubmitting(false);
      navigate("/login"); // Redirect to login
      return;
    }

    // 2. Prepare the data payload for the backend
    // The backend will handle ID, sold, and dateAdded
    const productData = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      category: product.category || "Uncategorized",
      ecoPoints: product.ecoPoints ? Number(product.ecoPoints) : 50,
      // Send the base64 image string
      image: product.image || "", 
    };

    // 3. Make the API call in a try...catch block
    try {
      // We use the full URL to your Spring Boot backend (running on port 3080)
      // The endpoint is likely /api/products or /api/products/add
      const response = await axios.post(
        "http://localhost:3080/api/products/add",
        productData,
        {
          headers: {
            "Content-Type": "application/json",
            // This is the crucial part for Spring Security (JWT)
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      // Handle success
      if (response.status === 201 || response.status === 200) {
        alert("✅ Product added successfully!");
        navigate("/my-products");
      } else {
        alert(`⚠️ Error: ${response.data.message || "Could not add product."}`);
      }

    } catch (error) {
      // Handle errors
      console.error("Error adding product:", error);
      let errorMessage = "⚠️ An unexpected error occurred.";
      if (error.response) {
        // The server responded with an error
        errorMessage = `⚠️ Server Error: ${error.response.data.message || error.response.statusText}`;
      } else if (error.request) {
        // No response was received from the server
        errorMessage = "⚠️ No response from server. Is the backend running?";
      }
      alert(errorMessage);
    } finally {
      // This runs whether the call succeeded or failed
      setIsSubmitting(false);
    }
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
            {/* Product Image Upload */}
            <div className="image-section">
              <img
                src={product.image || defaultProduct}
                alt="Preview"
                className="preview-image"
                onError={(e) => { e.target.src = defaultProduct; }} // Fallback
              />
              <label className="upload-btn">
                📸 Upload Image
                <input type="file" accept="image/*" onChange={handleImage} />
              </label>
            </div>

            {/* Form Inputs (No changes needed here) */}
            <div className="input-grid">
              <div className="input-field">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  placeholder="Eco Bamboo Brush"
                  required
                />
              </div>

              <div className="input-field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={product.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={product.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>Category</label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option>Accessories</option>
                  <option>Home</option>
                  <option>Electronics</option>
                  <option>Stationery</option>
                  <option>Clothing</option>
                </select>
              </div>

              <div className="input-field">
                <label>Eco Points (1-100)</label>
                <input
                  type="number"
                  name="ecoPoints"
                  value={product.ecoPoints}
                  onChange={handleChange}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="input-field full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                value={product.description}
                onChange={handleChange}
                placeholder="Enter short product description..."
                required
              />
            </div>

            {/* Action Buttons */}
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