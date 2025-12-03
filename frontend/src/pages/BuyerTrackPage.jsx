// src/pages/BuyerTrackPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BuyerTrackPage.css";

import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";

// Icons
import {
  FaClock,
  FaTools,
  FaTruck,
  FaMotorcycle,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
} from "react-icons/fa";

// Timeline steps
const steps = [
  { label: "CONFIRMED", icon: <FaClock /> },
  { label: "PROCESSING", icon: <FaTools /> },
  { label: "SHIPPED", icon: <FaTruck /> },
  { label: "OUT_FOR_DELIVERY", icon: <FaMotorcycle /> },
  { label: "DELIVERED", icon: <FaCheckCircle /> },
];

const BuyerTrackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Load order from backend
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        setOrder(await res.json());
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, token]);

  // UI Conditions
  if (loading) return <h2 className="loading">Loading tracking details...</h2>;

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

  // FIRST ITEM IN ORDER
  const firstItem = order.items?.[0] || {};

  // 🔥 MOST IMPORTANT — SHOW SELLER STATUS
  const safeStatus =
    firstItem.sellerStatus || order.status || "CONFIRMED";

  const isCancelled = safeStatus === "CANCELLED";
  const isReturned = safeStatus === "RETURNED";

  const currentIndex = steps.findIndex((s) => s.label === safeStatus);

  return (
    <div className="buyer-track-page">
      <BuyerNavbar />

      <div className="track-wrapper">
        <h1 className="track-title">📍 Tracking Your Order</h1>

        <p className="order-id-line">
          Order ID: <strong>{order.id}</strong>
        </p>

        {/* MAIN ORDER CARD */}
        <div className="track-card">
          <img
            src={firstItem.imageUrl}
            alt={firstItem.productName}
            className="track-image"
            onError={(e) => (e.target.style.display = "none")}
          />

          <div className="track-info">
            <h2>{firstItem.productName}</h2>

            {/* STATUS BADGE */}
            <span
              className={`track-status-badge ${safeStatus
                .toLowerCase()
                .replace(/_/g, "-")}`}
            >
              {safeStatus.replace(/_/g, " ")}
            </span>

            <p>
              <strong>Price:</strong> ₹{firstItem.price} × {firstItem.quantity}
            </p>

            <p>
              <strong>Total Paid:</strong> ₹{order.totalAmount}
            </p>

            <p>
              <strong>Ordered On:</strong>{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "—"}
            </p>

            <p>
              <strong>Carbon Points:</strong>{" "}
              {firstItem.carbonPoints || 0} EP
            </p>
          </div>
        </div>

        {/* TIMELINE */}
        <h2 className="progress-title">Order Journey</h2>

        <div className="timeline">
          {isCancelled || isReturned ? (
            // CANCELLED / RETURNED VIEW
            <div className="cancel-return-box">
              {isCancelled ? (
                <>
                  <FaTimesCircle className="cancel-icon" />
                  <h3>Order Cancelled</h3>
                </>
              ) : (
                <>
                  <FaUndo className="return-icon" />
                  <h3>Order Returned</h3>
                </>
              )}
            </div>
          ) : (
            // NORMAL PROGRESS
            <div className="timeline-inner">
              {steps.map((step, idx) => (
                <div className="timeline-step" key={idx}>
                  <div
                    className={`timeline-icon ${
                      idx <= currentIndex ? "active" : ""
                    }`}
                  >
                    {step.icon}
                  </div>

                  <span
                    className={`timeline-label ${
                      idx <= currentIndex ? "active" : ""
                    }`}
                  >
                    {step.label.replace(/_/g, " ")}
                  </span>

                  {idx < steps.length - 1 && (
                    <div
                      className={`timeline-line ${
                        idx < currentIndex ? "active" : ""
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
