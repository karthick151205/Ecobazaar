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
import SellerTrackPage from "./pages/SellerTrackPage";
import GoogleSuccess from "./pages/GoogleSuccess";
import Chatbot from "./components/ChatBot.jsx";

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

  // 🌿 Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // ✏️ Edit Product
  const handleEditProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:8080/api/products/${updatedProduct.id}`,
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

  // ❌ Delete Product
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(`http://localhost:8080/api/products/${id}`, {
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

  // 🔐 ROLE PROTECTION COMPONENT
  const ProtectedRoute = ({ element: Component, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      alert("Please login to continue.");
      return <Home />;
    }

    if (!allowedRoles.includes(role.toUpperCase())) {
      alert("Access denied.");
      return <Home />;
    }

    return <Component />;
  };

  return (
    <Router>
      <div className="app-wrapper">
        {/* Authentication popups */}
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

        {/* PAGE CONTENT WRAPPER (Important for footer) */}
        <div className="page-content">
          <Routes>
            {/* 🏠 Home */}
            <Route path="/" element={<Home />} />
            <Route path="/oauth-success" element={<GoogleSuccess />} />

            {/* 👤 Buyer Protected Routes */}
            <Route
              path="/BuyerDashboard"
              element={
                <ProtectedRoute
                  element={() => <BuyerDashboard onOpenSignup={openSignup} />}
                  allowedRoles={["BUYER"]}
                />
              }
            />

            <Route
              path="/buyer/profile"
              element={<ProtectedRoute element={BuyerProfile} allowedRoles={["BUYER"]} />}
            />

            <Route
              path="/buyer/orders"
              element={<ProtectedRoute element={BuyerOrders} allowedRoles={["BUYER"]} />}
            />

            <Route
              path="/buybox"
              element={<ProtectedRoute element={BuyBox} allowedRoles={["BUYER"]} />}
            />

            <Route
              path="/PaymentPortal"
              element={<ProtectedRoute element={PaymentPortal} allowedRoles={["BUYER"]} />}
            />

            <Route
              path="/EcoRankPage"
              element={<ProtectedRoute element={EcoRankPage} allowedRoles={["BUYER"]} />}
            />

            <Route
              path="/cart"
              element={<ProtectedRoute element={Cart} allowedRoles={["BUYER"]} />}
            />

            <Route
              path="/buyer/track/:id"
              element={<ProtectedRoute element={BuyerTrackPage} allowedRoles={["BUYER"]} />}
            />

            {/* 🏪 Seller Protected Routes */}
            <Route
              path="/SellerDashboard"
              element={
                <ProtectedRoute
                  element={() => (
                    <SellerDashboard
                      products={products}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  )}
                  allowedRoles={["SELLER"]}
                />
              }
            />

            <Route
              path="/my-products"
              element={
                <ProtectedRoute
                  element={() => (
                    <MyProducts
                      products={products}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  )}
                  allowedRoles={["SELLER"]}
                />
              }
            />

            <Route
              path="/view-sold-products"
              element={<ProtectedRoute element={ViewSoldProducts} allowedRoles={["SELLER"]} />}
            />

            <Route
              path="/seller-orders"
              element={<ProtectedRoute element={SellerOrders} allowedRoles={["SELLER"]} />}
            />

            <Route
              path="/seller/profile"
              element={<ProtectedRoute element={SellerProfile} allowedRoles={["SELLER"]} />}
            />

            <Route
              path="/seller/sales"
              element={<ProtectedRoute element={Sales} allowedRoles={["SELLER"]} />}
            />

            <Route
              path="/seller/add-product"
              element={<ProtectedRoute element={AddProduct} allowedRoles={["SELLER"]} />}
            />

            <Route
              path="/seller/track/:id"
              element={<ProtectedRoute element={SellerTrackPage} allowedRoles={["SELLER"]} />}
            />

            {/* 🧑‍💼 Admin */}
            <Route
              path="/AdminDashboard"
              element={<ProtectedRoute element={AdminDashboard} allowedRoles={["ADMIN"]} />}
            />

            {/* Product Details */}
            <Route path="/product/:id" element={<ProductDetails />} />
          </Routes>
        </div>

        {/* Chatbot is outside content but inside wrapper */}
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
