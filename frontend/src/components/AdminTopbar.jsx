import React from "react";
import { useNavigate } from "react-router-dom";
import "../pages/AdminDashboard.css";
import admin from "../assets/admin.jpg";

export default function AdminTopbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear stored authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    alert("Logged out successfully!");

    // Redirect to Home page
    navigate("/");
  };

  return (
    <header className="admin-topbar">
      <h2>EcoBazaarX Admin Dashboard</h2>

      <div className="admin-profile">
        <span>🌱 SUPER ADMIN</span>
        <img src={admin} alt="admin" />

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
