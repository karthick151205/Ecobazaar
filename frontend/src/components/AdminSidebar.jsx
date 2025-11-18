import React from "react";
import "../pages/AdminDashboard.css";

export default function AdminSidebar({ active, setActive }) {
  const menu = [
    { id: "overview", label: "📊 Overview" },
    { id: "users", label: "👥 Manage Users" },
    { id: "sellers", label: "🏪 Sellers" },
    { id: "products", label: "📦 Products" },
    { id: "carbon", label: "🌱 Carbon Rules" },
    { id: "reviews", label: "📝 Reviews" },
    { id: "settings", label: "⚙ Settings" },
  ];

  return (
    <aside className="admin-sidebar">
      <h2 className="sidebar-title">⚙ Admin Panel</h2>

      {menu.map((m) => (
        <button
          key={m.id}
          className={`sidebar-btn ${active === m.id ? "active-tab" : ""}`}
          onClick={() => setActive(m.id)}
        >
          {m.label}
        </button>
      ))}
    </aside>
  );
}
