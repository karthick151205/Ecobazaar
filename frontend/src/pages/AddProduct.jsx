import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // <-- Import axios
import "./AddProduct.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";
import defaultProduct from "../assets/default-product.png";

const AddProduct = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    ecoPoints: "",
    description: "",
    image: "",
  });
  const [error, setError] = useState(""); // For showing errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProduct((p) => ({ ...p, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // --- THIS IS THE UPDATED SUBMIT FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear old errors

    // 1. Get the JWT token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠️ You must be logged in as a Seller to add a product.");
      navigate("/login"); // Redirect to login
      return;
    }

    // 2. Create the data object to send (must match ProductRequest.java)
    const productData = {
      name: product.name,
      price: Number(product.price),
      stock: Number(product.stock),
      category: product.category || "Uncategorized",
      description: product.description,
      ecoPoints: Number(product.ecoPoints) || 50, // Default to 50
      image: product.image || defaultProduct, // Send the Base64 string
    };

    try {
      // 3. Make the API call, sending the token in the header
      const response = await axios.post(
        "http://localhost:3080/api/products",
        productData,
        {
          headers: {
            "Authorization": `Bearer ${token}`, // This is the security!
          },
        }
      );

      // It worked!
      alert("✅ Product added successfully!");
      console.log("Server response:", response.data);
      navigate("/my-products"); // take seller to MyProducts page

    } catch (err) {
      // 4. Handle errors
      console.error("Failed to add product:", err);
      if (err.response && err.response.status === 403) {
        // 403 Forbidden means they are not a SELLER
        alert("Error: You do not have permission to add a product. Please log in as a Seller.");
        setError("You do not have permission to add a product.");
      } else {
        alert("Error adding product. Please try again.");
        setError("An error occurred. Please try again.");
      }
    }
  };
  // --- END OF UPDATE ---

  return (
    <div className="add-product-container">
      <SellerNavbar />
      <div className="form-wrapper">
        <h2>🌿 Add New Eco Product</h2>

        <form onSubmit={handleSubmit} className="add-form">
          {/* All your form inputs are the same */}
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={product.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={product.price}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="stock"
            placeholder="Available Stock"
            value={product.stock}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="ecoPoints"
            placeholder="Eco Points (1 - 100)"
            value={product.ecoPoints}
            onChange={handleChange}
            min="1"
            max="100"
          />
          <textarea
            name="description"
            placeholder="Enter product description..."
            value={product.description}
            onChange={handleChange}
            required
            rows="4"
          />
          <select name="category" value={product.category} onChange={handleChange}>
            <option value="">Select Category (optional)</option>
            <option>Accessories</option>
            <option>Home</option>
            <option>Electronics</option>
            <option>Stationery</option>
            <option>Clothing</option>
          </select>

          <input type="file" accept="image/*" onChange={handleImage} />
          <img src={product.image || defaultProduct} alt="Preview" className="preview" />
          
          {error && <p className="auth-error">{error}</p>}

          <button type="submit">Add Product</button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AddProduct;