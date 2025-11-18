import React from "react";
import "../pages/AdminDashboard.css";

export default function AdminTopbar() {
  return (
    <header className="admin-topbar">
      <h2>EcoBazaarX Admin Dashboard</h2>

      <div className="admin-profile">
        <span>🌱 SUPER ADMIN</span>
        <img src="https://i.pravatar.cc/40" alt="admin" />
      </div>
    </header>
  );
}
