import React, { useState } from "react";
import "../pages/AdminDashboard.css";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

/* Correct Section Imports */
import AdminOverview from "./sections/AdminOverview";
import AdminUsers from "./sections/AdminUsers";
import AdminSellers from "./sections/AdminSellers";
import AdminProducts from "./sections/AdminProducts";
import AdminCarbonRules from "./sections/AdminCarbonRules";
import AdminReviews from "./sections/AdminReviews";
import AdminSettings from "./sections/AdminSettings";

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
      
      {/* Sidebar */}
      <AdminSidebar active={active} setActive={setActive} />

      {/* Main Content */}
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">{renderSection()}</div>
      </div>
    </div>
  );
}
