import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.name || !product.price || !product.stock || !product.description) {
      alert("⚠️ Please fill in all required fields before adding the product.");
      return;
    }

    const newProduct = {
      ...product,
      id: Date.now(),
      category: product.category || "Uncategorized",
      image: product.image || defaultProduct,
      ecoPoints: product.ecoPoints ? Number(product.ecoPoints) : 50,
      price: Number(product.price),
      stock: Number(product.stock),
      sold: 0, // default sold count
      dateAdded: new Date().toISOString(), // store ISO string
    };

    // Save product to localStorage (append)
    const existingProducts = JSON.parse(localStorage.getItem("ecoProducts")) || [];
    existingProducts.unshift(newProduct); // add to front
    localStorage.setItem("ecoProducts", JSON.stringify(existingProducts));

    // optional: trigger storage event for other tabs/components
    localStorage.setItem("refreshSellerPages", String(Date.now()));

    alert("✅ Product added successfully!");
    navigate("/my-products"); // take seller to MyProducts page
  };

  return (
    <div className="add-product-container">
      <SellerNavbar />
      <div className="form-wrapper">
        <h2>🌿 Add New Eco Product</h2>

        <form onSubmit={handleSubmit} className="add-form">
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

          <button type="submit">Add Product</button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AddProduct;
