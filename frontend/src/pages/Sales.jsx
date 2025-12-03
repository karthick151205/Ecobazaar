import React, { useEffect, useState } from "react";
import {
  FaMoneyBillWave,
  FaBox,
  FaLeaf,
  FaChartLine,
} from "react-icons/fa";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";
import "./Sales.css";

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSold: 0,
    avgEcoPoints: 0,
  });

  const [loading, setLoading] = useState(true);

  // ⭐ Logged-in seller
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const sellerId = user?.id || null;
  const token = localStorage.getItem("token");

  // ⭐ Safely build image path
  const safeImage = (img) => {
    if (!img) return "https://via.placeholder.com/150";
    if (img.startsWith("data:image")) return img;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `http://localhost:8080${img}`;
    return "https://via.placeholder.com/150";
  };

  // ⭐ Load seller-specific order items from backend
  const loadSales = async () => {
    if (!sellerId) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/orders/seller/${sellerId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const orders = await res.json();
      console.log("Seller Sales Orders:", orders);

      if (!Array.isArray(orders)) {
        setSalesData([]);
        return;
      }

      // Extract only this seller's items from all orders
      const sellerItems = orders.flatMap((order) =>
        (order.items || [])
          .filter((item) => String(item.sellerId) === String(sellerId))
          .map((item) => ({
            ...item,
            orderId: order.id,
            date: order.createdAt,
          }))
      );

      setSalesData(sellerItems);

      // ====== CALCULATE STATS ======
      const totalRevenue = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      );

      const totalSold = sellerItems.reduce(
        (sum, item) => sum + item.quantity, 0
      );

      const avgEco =
        sellerItems.length > 0
          ? (
              sellerItems.reduce(
                (sum, item) => sum + (item.carbonPoints || 0),
                0
              ) / sellerItems.length
            ).toFixed(1)
          : 0;

      setStats({
        totalRevenue,
        totalSold,
        avgEcoPoints: avgEco,
      });

    } catch (err) {
      console.error("Sales load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <div className="sales-page">
      <SellerNavbar />

      {/* HEADER */}
      <header className="sales-header">
        <h1>📈 Sales & Performance</h1>
        <p>Track your revenue, product sales and eco impact.</p>
      </header>

      {/* Stats Cards */}
      <div className="sales-stats">
        <div className="stat-card">
          <FaMoneyBillWave className="icon money" />
          <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>

        <div className="stat-card">
          <FaBox className="icon box" />
          <h3>{stats.totalSold}</h3>
          <p>Total Units Sold</p>
        </div>

        <div className="stat-card">
          <FaLeaf className="icon leaf" />
          <h3>{stats.avgEcoPoints}</h3>
          <p>Avg Eco Points</p>
        </div>

        <div className="stat-card">
          <FaChartLine className="icon chart" />
          <h3>{(stats.totalRevenue / 1000).toFixed(2)}k</h3>
          <p>Growth Indicator</p>
        </div>
      </div>

      {/* BEST SELLING PRODUCTS */}
      <section className="top-selling">
        <h2>🔥 Best-Selling Products</h2>

        {loading ? (
          <p>Loading...</p>
        ) : salesData.length === 0 ? (
          <p className="no-sales">No sales recorded yet 😢</p>
        ) : (
          <div className="product-grid">
            {salesData
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 4)
              .map((item, index) => (
                <div className="product-card" key={index}>
                  <img src={safeImage(item.imageUrl)} alt={item.productName} />
                  <div className="info">
                    <h3>{item.productName}</h3>
                    <p>Sold: {item.quantity}</p>
                    <p>₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* RECENT TRANSACTIONS */}
      <section className="recent-transactions">
        <h2>🧾 Recent Transactions</h2>

        {loading ? (
          <p>Loading...</p>
        ) : salesData.length === 0 ? (
          <p className="no-sales">No recent transactions available.</p>
        ) : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Eco Points</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {salesData
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
                )
                .map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price * item.quantity}</td>
                    <td>{item.carbonPoints}</td>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Sales;
