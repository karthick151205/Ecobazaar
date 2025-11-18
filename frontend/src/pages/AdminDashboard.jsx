import React, { useState } from "react";
import "../pages/AdminDashboard.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");

  const renderSection = () => {
    switch (active) {
      case "users":
        return <AdminUsers />;
      case "sellers":
        return <AdminSellers />;
      case "products":
        return <AdminProducts />;
      case "carbon":
        return <AdminCarbonRules />;
      case "reviews":
        return <AdminReviews />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar active={active} setActive={setActive} />

      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">{renderSection()}</div>
      </div>
    </div>
  );
}

/* ================== SECTIONS ================== */

function AdminOverview() {
  return (
    <div>
      <h2 className="section-title">📊 Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-box">👥 Users: <b>8341</b></div>
        <div className="stat-box">🏪 Sellers: <b>145</b></div>
        <div className="stat-box">📦 Products: <b>2590</b></div>
        <div className="stat-box">🌱 CO₂ Saved: <b>5.2 Tons</b></div>
      </div>
    </div>
  );
}

function AdminUsers() {
  return (
    <div>
      <h2 className="section-title">👥 Manage Users</h2>
      <div className="panel-box">User table will load here.</div>
    </div>
  );
}

function AdminSellers() {
  return (
    <div>
      <h2 className="section-title">🏪 Seller Verification</h2>
      <div className="panel-box">Pending sellers table...</div>
    </div>
  );
}

function AdminProducts() {
  return (
    <div>
      <h2 className="section-title">📦 Product Moderation</h2>
      <div className="panel-box">Approve / Delete Products</div>
    </div>
  );
}

function AdminCarbonRules() {
  return (
    <div>
      <h2 className="section-title">🌱 Carbon Footprint Rules</h2>
      <div className="panel-box">Adjust carbon scoring rules</div>
    </div>
  );
}

function AdminReviews() {
  return (
    <div>
      <h2 className="section-title">📝 Review Moderation</h2>
      <div className="panel-box">Reported reviews list</div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div>
      <h2 className="section-title">⚙ Platform Settings</h2>
      <div className="panel-box">Site config, permissions, tokens</div>
    </div>
  );
}
