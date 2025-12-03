import React, { useEffect, useState } from "react";
import "./AdminOverview.css"; // ⭐ Make sure you create this CSS file

export default function AdminOverview() {
  const [stats, setStats] = useState({
    users: 0,
    sellers: 0,
    products: 0,
    co2: 0
  });

  useEffect(() => {
    fetch("http://localhost:8080/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="overview-container">
      <h2 className="section-title">📊 Dashboard Overview</h2>

      <div className="stats-grid">
        
        <div className="stat-card users">
          <div className="icon">👥</div>
          <div className="value">{stats.users}</div>
          <div className="label">Total Users</div>
        </div>

        <div className="stat-card sellers">
          <div className="icon">🏪</div>
          <div className="value">{stats.sellers}</div>
          <div className="label">Total Sellers</div>
        </div>

        <div className="stat-card products">
          <div className="icon">📦</div>
          <div className="value">{stats.products}</div>
          <div className="label">Total Products</div>
        </div>

        <div className="stat-card eco">
          <div className="icon">🌱</div>
          <div className="value">{stats.co2} kg</div>
          <div className="label">CO₂ Saved</div>
        </div>

      </div>
    </div>
  );
}
