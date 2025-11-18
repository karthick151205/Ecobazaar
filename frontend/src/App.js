import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

/* 🌍 Pages */
import Home from "./pages/Home";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetails from "./pages/ProductDetails";
import ViewSoldProducts from "./pages/ViewSoldProducts";
import MyProducts from "./pages/MyProducts";
import SellerOrders from "./pages/SellerOrders";
import SellerProfile from "./pages/SellerProfile";
import BuyerProfile from "./pages/BuyerProfile";
import BuyerOrders from "./pages/BuyerOrders";
import BuyBox from "./pages/BuyBox";
import PaymentPortal from "./pages/PaymentPortal";
import Cart from "./pages/Cart";
import AddProduct from "./pages/AddProduct";
import EcoRankPage from "./pages/EcoRankPage";
import Sales from "./pages/Sales";
import BuyerTrackPage from "./pages/BuyerTrackPage";
import SellerTrackPage from "./pages/SellerTrackPage";  // ✅ FIXED IMPORT

/* 🔐 Popups */
import LoginPopup from "./LoginPopup";
import SignupPopup from "./SignupPopup";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3080/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleEditProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3080/api/products/${updatedProduct.id}`,
        updatedProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(`http://localhost:3080/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  return (
    <Router>
      {showLogin && (
        <LoginPopup
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={openSignup}
        />
      )}

      {showSignup && (
        <SignupPopup
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={openLogin}
        />
      )}

      <Routes>
        {/* 🏠 Home */}
        <Route path="/" element={<Home />} />

        {/* 👤 Buyer */}
        <Route
          path="/BuyerDashboard"
          element={<BuyerDashboard onOpenSignup={openSignup} />}
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/buyer/profile" element={<BuyerProfile />} /> {/* ❗ FIXED */}
        <Route path="/buyer/orders" element={<BuyerOrders />} />
        <Route path="/buybox" element={<BuyBox />} />
        <Route path="/PaymentPortal" element={<PaymentPortal />} />
        <Route path="/EcoRankPage" element={<EcoRankPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/buyer/track/:id" element={<BuyerTrackPage />} />

        {/* 🏪 Seller */}
        <Route
          path="/SellerDashboard"
          element={
            <SellerDashboard
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          }
        />
        <Route
          path="/my-products"
          element={
            <MyProducts
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          }
        />
        <Route path="/view-sold-products" element={<ViewSoldProducts />} />
        <Route path="/seller-orders" element={<SellerOrders />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
        <Route path="/seller/sales" element={<Sales />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/seller/track/:id" element={<SellerTrackPage />} /> {/* ✅ FIXED */}

        {/* 🧑‍💼 Admin */}
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
