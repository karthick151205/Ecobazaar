import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SellerTrackPage.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";

const orderSteps = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const SellerTrackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Coming from SellerOrders.jsx
  const order = location.state || null;

  const orderId = order?.orderId || order?.id;
  const sellerId = order?.sellerId;
  const productId = order?.productId;

  const buyerName = order?.buyerName || "";
  const buyerEmail = order?.buyerEmail || "";
  const createdAt = order?.createdAt;
  const totalAmount = order?.totalAmount;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Seller Item Tracking
  useEffect(() => {
    if (!orderId || !sellerId || !productId) {
      setLoading(false);
      return;
    }

    const loadTracking = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/orders/track/${orderId}/${sellerId}/${productId}`
        );
        setItem(res.data);
      } catch (err) {
        console.error("Failed to load tracking:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, [orderId, sellerId, productId]);

  // Error when opening directly
  if (!order) {
    return (
      <div className="track-error">
        <h2>⚠ Order Not Found</h2>
        <p>This page must be opened from the Orders page.</p>
        <button className="back-btn" onClick={() => navigate("/seller-orders")}>
          ⬅ Return to Orders
        </button>
      </div>
    );
  }

  if (loading || !item) {
    return <p className="loading-text">Loading tracking info...</p>;
  }

  // Use SELLER STATUS, not buyer status
  const sellerStatus = item?.sellerStatus || "CONFIRMED";
  const currentStepIndex = orderSteps.findIndex((s) => s === sellerStatus);

  // Update Seller's Individual Item Status
  const updateStatus = async (newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/orders/update-status/${orderId}/${sellerId}/${productId}`,
        null,
        { params: { status: newStatus } }
      );

      setItem((prev) => ({ ...prev, sellerStatus: newStatus }));
      alert("Seller status updated successfully!");
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="track-page-container">
      <SellerNavbar />

      <div className="track-wrapper">
        <h1 className="track-title">📍 Order Tracking</h1>

        <p className="order-id-line">
          Tracking Order: <strong>{orderId}</strong>
        </p>

        {/* MAIN CARD */}
        <div className="track-card">
          <img
            src={item?.imageUrl || "https://via.placeholder.com/180"}
            alt={item?.productName}
            className="track-image"
          />

          <div className="track-info">
            <h2>{item?.productName}</h2>

            <span
              className={`track-status-badge ${sellerStatus
                .toLowerCase()
                .replace(/_/g, "-")}`}
            >
              {sellerStatus.replace(/_/g, " ")}
            </span>

            <p>
              <strong>Buyer:</strong> {buyerName} ({buyerEmail})
            </p>

            <p>
              <strong>Quantity:</strong> {item?.quantity}
            </p>

            <p>
              <strong>Total Amount:</strong> ₹{totalAmount}
            </p>

            <p>
              <strong>Placed On:</strong>{" "}
              {createdAt ? new Date(createdAt).toLocaleString() : "--"}
            </p>
          </div>
        </div>

        {/* TIMELINE */}
        <h2 className="progress-title">Order Progress</h2>

        <div className="timeline">
          {orderSteps.map((step, index) => (
            <div className="timeline-step" key={step}>
              <div
                className={`circle ${
                  index <= currentStepIndex ? "active" : ""
                }`}
              ></div>

              <span
                className={`label ${
                  index <= currentStepIndex ? "active" : ""
                }`}
              >
                {step.replace(/_/g, " ")}
              </span>

              {index < orderSteps.length - 1 && (
                <div
                  className={`line ${
                    index < currentStepIndex ? "active" : ""
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* STATUS BUTTONS */}
        <h2 className="progress-title">Update Status</h2>

        <div className="status-buttons">
          <button onClick={() => updateStatus("PROCESSING")}>Processing</button>
          <button onClick={() => updateStatus("SHIPPED")}>Shipped</button>
          <button onClick={() => updateStatus("OUT_FOR_DELIVERY")}>
            Out for Delivery
          </button>
          <button onClick={() => updateStatus("DELIVERED")}>Delivered</button>
        </div>

        <button className="back-btn" onClick={() => navigate("/seller-orders")}>
          ⬅ Back to Orders
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default SellerTrackPage;
