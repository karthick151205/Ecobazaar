// src/pages/BuyerTrackPage.jsx
import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./BuyerTrackPage.css";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";

// 🚀 Icons for timeline
import {
  FaClock,
  FaTools,
  FaTruck,
  FaMotorcycle,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
} from "react-icons/fa";

// Step definitions with icons
const steps = [
  { label: "Pending", icon: <FaClock /> },
  { label: "Processing", icon: <FaTools /> },
  { label: "Shipped", icon: <FaTruck /> },
  { label: "Out for Delivery", icon: <FaMotorcycle /> },
  { label: "Delivered", icon: <FaCheckCircle /> },
];

const BuyerTrackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  // ❌ If opened directly, no data
  if (!order) {
    return (
      <div className="track-error">
        <h2>⚠ Order Not Found</h2>
        <button className="back-btn" onClick={() => navigate("/buyer/orders")}>
          ⬅ Back to Orders
        </button>
      </div>
    );
  }

  const status = order.status;
  const isCancelled = status === "Cancelled";
  const isReturned = status === "Returned";

  const currentIndex = steps.findIndex(
    (s) => s.label.toLowerCase() === status.toLowerCase()
  );

  return (
    <div className="buyer-track-page">
      <BuyerNavbar />

      <div className="track-wrapper">
        <h1 className="track-title">📍 Tracking Your Order</h1>
        <p className="order-id-line">
          Order ID: <strong>{order.id}</strong>
        </p>

        {/* ORDER CARD */}
        <div className="track-card">
          <img
            src={order.image}
            alt={order.productName}
            className="track-image"
          />

          <div className="track-info">
            <h2>{order.productName}</h2>

            {/* STATUS BADGE */}
            <span className={`track-status-badge ${status.toLowerCase().replace(/\s/g, "-")}`}>
              {status}
            </span>

            <p><strong>Price:</strong> ₹{order.price} × {order.quantity}</p>
            <p><strong>Total Paid:</strong> ₹{order.price * order.quantity}</p>
            <p><strong>Ordered On:</strong> {order.date}</p>
            <p><strong>Category:</strong> {order.category || "General"}</p>
            <p><strong>Carbon Footprint:</strong> {order.carbonPoints} kg CO₂</p>
          </div>
        </div>

        {/* TIMELINE */}
        <h2 className="progress-title">Order Journey</h2>

        <div className="timeline">
          {/* If Cancelled or Returned */}
          {isCancelled || isReturned ? (
            <div className="cancel-return-box">
              {isCancelled ? (
                <>
                  <FaTimesCircle className="cancel-icon" />
                  <h3 className="cancel-text">Order Cancelled</h3>
                  <p>This order was cancelled and will not be delivered.</p>
                </>
              ) : (
                <>
                  <FaUndo className="return-icon" />
                  <h3 className="return-text">Order Returned</h3>
                  <p>The item has been returned successfully.</p>
                </>
              )}
            </div>
          ) : (
            <div className="timeline-inner">
              {steps.map((step, index) => (
                <div className="timeline-step" key={index}>
                  <div
                    className={`timeline-icon ${
                      index <= currentIndex ? "active" : ""
                    }`}
                  >
                    {step.icon}
                  </div>

                  <span
                    className={`timeline-label ${
                      index <= currentIndex ? "active" : ""
                    }`}
                  >
                    {step.label}
                  </span>

                  {index < steps.length - 1 && (
                    <div
                      className={`timeline-line ${
                        index < currentIndex ? "active" : ""
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="back-btn" onClick={() => navigate("/buyer/orders")}>
          ⬅ Back to My Orders
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default BuyerTrackPage;
