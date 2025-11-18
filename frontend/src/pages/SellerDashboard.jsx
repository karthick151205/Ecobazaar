import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";

/* 📊 Recharts */
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
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [topProduct, setTopProduct] = useState(null);
  const [currentAd, setCurrentAd] = useState(0);
  const [latestToast, setLatestToast] = useState(null);

  const ads = [ad1, ad2, ad3];
  const toastTimerRef = useRef(null);
  const newOrderAudioRef = useRef(null);

  // 🌿 Load all data
  const loadDashboardData = () => {
    const ecoProducts = JSON.parse(localStorage.getItem("ecoProducts")) || [];
    const ecoOrders = JSON.parse(localStorage.getItem("ecoOrders")) || [];

    setProducts(ecoProducts);
    setOrders(ecoOrders);

    // ✅ Calculate Analytics
    const totalSales = ecoProducts.reduce((sum, p) => sum + (p.sold || 0), 0);
    const totalRevenue = ecoProducts.reduce(
      (sum, p) => sum + (p.price || 0) * (p.sold || 0),
      0
    );
    const lowStock = ecoProducts.filter((p) => (p.stock || 0) < 5).length;
    const cancelled = ecoOrders.filter((o) => o.status === "Cancelled").length;
    const pending = ecoOrders.filter((o) => o.status === "Pending").length;

    // find top-selling product
    const topP =
      ecoProducts.length > 0
        ? ecoProducts.reduce((a, b) =>
            (a.sold || 0) > (b.sold || 0) ? a : b
          )
        : null;

    setSales(totalSales);
    setRevenue(totalRevenue);
    setLowStockCount(lowStock);
    setCancelledCount(cancelled);
    setNewOrdersCount(pending);
    setTopProduct(topP);
  };

  useEffect(() => {
    loadDashboardData();

    // Listen for storage updates (live sync)
    const handleStorage = (event) => {
      if (
        event.key === "ecoOrders" ||
        event.key === "ecoProducts" ||
        event.key === "refreshSellerPages"
      ) {
        loadDashboardData();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 🌿 Rotate Ads
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentAd((prev) => (prev + 1) % ads.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  // 🌿 Play alert when new order arrives
  const handleNewOrderArrived = (order) => {
    setLatestToast(order);
    newOrderAudioRef.current?.play().catch(() => {});
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setLatestToast(null), 4000);
    loadDashboardData();
  };

  // 🧮 Chart Data — Monthly Revenue
  const monthlyRevenue = Array.from({ length: 6 }).map((_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const mStr = month.toLocaleString("default", { month: "short" });

    // Filter orders by month
    const monthOrders = orders.filter(
      (o) => new Date(o.date).getMonth() === month.getMonth()
    );
    const monthRevenue = monthOrders.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    );

    return { name: mStr, revenue: monthRevenue };
  }).reverse();

  return (
    <div className="seller-dashboard-container">
      <SellerNavbar />

      <audio
        ref={newOrderAudioRef}
        src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_1b9a26b7eb.mp3?filename=notification-tone-28644.mp3"
        preload="auto"
      />

      <div className="dashboard-wrapper">
        {/* 🌿 Overview Cards */}
        <div className="overview-section">
          <div className="stat-card green">
            <h3>Total Sales</h3>
            <p>{sales}</p>
          </div>
          <div className="stat-card blue">
            <h3>Total Revenue</h3>
            <p>₹{revenue.toLocaleString()}</p>
          </div>
          <div className="stat-card orange">
            <h3>New Orders</h3>
            <p>{newOrdersCount}</p>
          </div>
          <div className="stat-card violet">
            <h3>Cancelled Orders</h3>
            <p>{cancelledCount}</p>
          </div>
          <div className="stat-card red">
            <h3>Low Stock</h3>
            <p>{lowStockCount}</p>
          </div>
        </div>

        {/* 🌿 Top Product */}
        {topProduct && (
          <div className="top-product-highlight">
            <h2>🏆 Top Performing Product</h2>
            <div className="top-product-card">
              <img
                src={topProduct.image}
                alt={topProduct.name}
                className="top-product-img"
              />
              <div>
                <h3>{topProduct.name}</h3>
                <p>Sold: {topProduct.sold}</p>
                <p>Revenue: ₹{(topProduct.price * topProduct.sold).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* 🌿 Ad Banner */}
        <div className="seller-ad-banner">
          <img src={ads[currentAd]} alt="Eco Ad" className="ad-image" />
          <div className="ad-caption">
            Empower Your Green Business with EcoBazaarX Seller Hub 🚀
          </div>
        </div>

        {/* 🌿 Monthly Revenue Chart */}
        <section className="sales-chart-section">
          <h2>📈 Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4caf50" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* 🌿 Products Overview */}
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
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div className="product-card" key={p.id}>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="product-img"
                  />
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p>₹{p.price}</p>
                    <p>Stock: {p.stock}</p>
                    <p>Sold: {p.sold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 🌿 Order Toast */}
      {latestToast && (
        <div className="order-toast">
          <img
            src={latestToast.image}
            alt="product"
            className="toast-img"
          />
          <div className="toast-text">
            <strong>🛒 New Order: {latestToast.productName}</strong>
            <p>{latestToast.buyer || "Customer"}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SellerDashboard;
