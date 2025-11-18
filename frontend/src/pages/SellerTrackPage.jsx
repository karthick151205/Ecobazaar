import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./SellerTrackPage.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";

const orderSteps = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const SellerTrackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Order received from SellerOrders.jsx
  const order = location.state;

  // If direct page load → No order details
  if (!order) {
    return (
      <div className="track-error">
        <h2>⚠ Order Not Found</h2>
        <p>This page must be opened from the Orders page.</p>
        <button className="back-btn" onClick={() => navigate("/seller/orders")}>
          ⬅ Return to Orders
        </button>
      </div>
    );
  }

  // Determine progress stage
  const currentStepIndex = orderSteps.findIndex(
    (s) => s.toLowerCase() === order.status?.toLowerCase()
  );

  return (
    <div className="track-page-container">
      <SellerNavbar />

      <div className="track-wrapper">
        <h1 className="track-title">📍 Order Tracking</h1>

        {/* ORDER ID */}
        <p className="order-id-line">
          Tracking Order: <strong>{order.orderId || order.id}</strong>
        </p>

        {/* MAIN ORDER CARD */}
        <div className="track-card">
          <img
            src={order.image || "https://via.placeholder.com/180"}
            alt={order.product}
            className="track-image"
          />

          <div className="track-info">
            <h2>{order.product}</h2>

            {/* Status Badge */}
            <span
              className={`track-status-badge ${order.status
                .toLowerCase()
                .replace(/\s/g, "-")}`}
            >
              {order.status}
            </span>

            <p>
              <strong>Buyer:</strong> {order.customer}
            </p>
            <p>
              <strong>Quantity:</strong> {order.quantity}
            </p>
            <p>
              <strong>Total Amount:</strong> ₹{order.total}
            </p>
            <p>
              <strong>Placed On:</strong>{" "}
              {new Date(order.date).toLocaleString()}
            </p>

            {/* Product ID (optional) */}
            {order.productId && (
              <p>
                <strong>Product ID:</strong>{" "}
                <span className="track-product-id">{order.productId}</span>
              </p>
            )}
          </div>
        </div>

        {/* PROGRESS TITLE */}
        <h2 className="progress-title">Order Progress</h2>

        {/* TIMELINE */}
        <div className="timeline">
          {orderSteps.map((step, index) => (
            <div className="timeline-step" key={step}>
              {/* Animated Circle */}
              <div
                className={`circle ${
                  index <= currentStepIndex ? "active" : ""
                }`}
              ></div>

              {/* Label */}
              <span
                className={`label ${
                  index <= currentStepIndex ? "active" : ""
                }`}
              >
                {step}
              </span>

              {/* Connector Line */}
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

        {/* BACK BUTTON */}
        <button
          className="back-btn"
          onClick={() => navigate("/seller-orders")}
        >
          ⬅ Back to Orders
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default SellerTrackPage;
