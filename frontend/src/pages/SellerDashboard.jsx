import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";

/* 📊 Recharts for Sales Analytics */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* 🌿 Ads */
import ad1 from "../assets/seller_ad1.avif";
import ad2 from "../assets/seller_ad2.jpeg";
import ad3 from "../assets/seller_ad3.avif";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [currentAd, setCurrentAd] = useState(0);
  const ads = [ad1, ad2, ad3];

  // 🌿 Load products from localStorage
  const loadProducts = () => {
    const storedProducts = JSON.parse(localStorage.getItem("ecoProducts")) || [];
    setProducts(storedProducts);
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

  // 🌿 Calculate stats
  useEffect(() => {
    const totalSales = products.reduce((acc, p) => acc + (p.sold || 0), 0);
    const totalRevenue = products.reduce(
      (acc, p) => acc + (p.price * (p.sold || 0)),
      0
    );
    setSales(totalSales);
    setRevenue(totalRevenue);
    setNewOrders(Math.floor(Math.random() * 15) + 2);

    const adTimer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 4000);

    return () => clearInterval(adTimer);
  }, [products]);

  // 🌿 Prepare sales data for chart
  const chartData = products.map((p) => ({
    name: p.name.length > 10 ? p.name.slice(0, 10) + "..." : p.name,
    sold: p.sold || 0,
    revenue: (p.price || 0) * (p.sold || 0),
  }));

  return (
    <div className="seller-dashboard-container">
      <SellerNavbar />

      <div className="dashboard-wrapper">
        {/* 🌱 Dashboard Header */}
        <header className="dashboard-header">
          <h1>🌱 Seller Dashboard</h1>
          <p>Track your performance and manage your eco-friendly business efficiently.</p>
        </header>

        {/* 🌿 Statistics Section */}
        <div className="overview-section">
          <div className="stat-card green">
            <h3>Total Sales</h3>
            <p>{sales}</p>
          </div>
          <div className="stat-card blue">
            <h3>Total Revenue</h3>
            <p>₹{revenue}</p>
          </div>
          <div className="stat-card orange">
            <h3>New Orders</h3>
            <p>{newOrders}</p>
          </div>
          <div className="stat-card violet">
            <h3>Total Products</h3>
            <p>{products.length}</p>
          </div>
        </div>

        {/* 🌍 Rotating Banner */}
        <div className="seller-ad-banner">
          <img src={ads[currentAd]} alt="Eco Ad" className="ad-image" />
          <div className="ad-caption">🌿 Grow Green, Sell Smart — EcoBazaarX Seller Hub 🚀</div>
        </div>

        {/* 📊 Sales Chart */}
        <section className="sales-chart-section">
          <h2>📈 Sales Analytics</h2>
          {products.length === 0 ? (
            <p className="no-data">No data available. Add products to see analytics.</p>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#4caf50" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* 🧺 Product Section */}
        <section className="product-section">
          <div className="section-header">
            <h2>🧺 My Products</h2>
            <button
              className="add-btn"
              onClick={() => navigate("/seller/add-product")}
            >
              ➕ Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="no-products">
              <h3>No products yet 😢</h3>
              <button onClick={() => navigate("/seller/add-product")}>
                ➕ Add Now
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div className="product-card" key={p.id}>
                  <div className="product-image-wrap">
                    <img
                      src={p.image || "https://via.placeholder.com/200"}
                      alt={p.name}
                      className="product-img"
                    />
                  </div>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p className="category">{p.category}</p>
                    <div className="info-box">
                      <p>₹{p.price}</p>
                      <p>Stock: {p.stock}</p>
                      <p>Sold: {p.sold}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
