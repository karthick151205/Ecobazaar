// src/pages/SellerOrders.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerOrders.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);
  const prevOrdersRef = useRef([]);

  // Load orders initially
  const loadOrders = () => {
    const stored = JSON.parse(localStorage.getItem("ecoOrders")) || [];
    setOrders(stored);
    prevOrdersRef.current = stored;
  };

  // Setup sound + initial load
  useEffect(() => {
    loadOrders();
    audioRef.current = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1b9a26b7eb.mp3?filename=notification-tone-28644.mp3"
    );

    const enableSound = () => {
      setSoundEnabled(true);
      window.removeEventListener("click", enableSound);
    };
    window.addEventListener("click", enableSound);

    return () => window.removeEventListener("click", enableSound);
  }, []);

  // Update stock by product id
  const adjustStock = (productId, amount) => {
    const items = JSON.parse(localStorage.getItem("ecoProducts")) || [];
    const updated = items.map((p) =>
      p.id === productId || p.name === productId
        ? { ...p, stock: Math.max((p.stock || 0) + amount, 0) }
        : p
    );
    localStorage.setItem("ecoProducts", JSON.stringify(updated));
    localStorage.setItem("refreshSellerPages", Date.now());
    localStorage.setItem("refreshBuyerPages", Date.now());
  };

  // Detect new orders from buyers
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e) return;

      if (e.key === "ecoOrders") {
        const updated = JSON.parse(localStorage.getItem("ecoOrders")) || [];

        const prev = prevOrdersRef.current;
        if (updated.length > prev.length) {
          const newOnes = updated.filter(
            (o) => !prev.some((old) => old.id === o.id)
          );

          if (newOnes.length > 0) {
            const newest = newOnes[0];
            setNewOrderAlert(newest);

            adjustStock(
              newest.productId || newest.product,
              -Number(newest.quantity || 1)
            );

            if (soundEnabled && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }

            setTimeout(() => setNewOrderAlert(null), 5000);
          }
        }

        setOrders(updated);
        prevOrdersRef.current = updated;
      }

      if (e.key === "refreshSellerPages") {
        loadOrders();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [soundEnabled]);

  // Filtered orders
  const filteredOrders =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  // Update order status + sync buyer pages + stock
  const updateStatus = (id, newStatus) => {
    const current = JSON.parse(localStorage.getItem("ecoOrders")) || [];
    const updated = current.map((o) =>
      o.id === id ? { ...o, status: newStatus } : o
    );

    localStorage.setItem("ecoOrders", JSON.stringify(updated));

    // Sync to buyerOrders
    const buyerOrders = JSON.parse(localStorage.getItem("buyerOrders")) || [];
    const synced = buyerOrders.map((o) =>
      o.id === id ? { ...o, status: newStatus } : o
    );
    localStorage.setItem("buyerOrders", JSON.stringify(synced));

    const target = current.find((o) => o.id === id);

    if (target) {
      if (newStatus === "Cancelled" || newStatus === "Returned") {
        adjustStock(target.productId || target.product, Number(target.quantity));
      }
    }

    setOrders(updated);
    prevOrdersRef.current = updated;
    localStorage.setItem("refreshSellerPages", Date.now());
    localStorage.setItem("refreshBuyerPages", Date.now());
  };

  // Navigate to Track page
  const goToTrack = (order) => {
    navigate(`/seller/track/${order.id}`, {
      state: {
        orderId: order.id,
        productId: order.productId,
        product: order.product,
        image: order.image,
        status: order.status,
        customer: order.customer,
        quantity: order.quantity,
        total: order.total,
        date: order.date,
      },
    });
  };

  return (
    <div className="seller-orders-container">
      <SellerNavbar />

      {/* POPUP */}
      {newOrderAlert && (
        <div className="order-alert-popup">
          <div className="alert-left">
            <img
              src={
                newOrderAlert.image || "https://via.placeholder.com/80"
              }
              alt=""
            />
          </div>
          <div className="alert-right">
            <div className="title">🛒 New Order Received!</div>
            <div className="meta">
              {newOrderAlert.product} — Qty: {newOrderAlert.quantity}
            </div>
            <div className="sub">
              From: {newOrderAlert.customer || "Buyer"}
            </div>
          </div>
        </div>
      )}

      <section className="orders-wrapper">
        <header className="orders-header">
          <h1>📦 Orders Received</h1>
          <p>Track and manage all incoming orders.</p>
        </header>

        {/* FILTER BAR */}
        <div className="filter-bar">
          {[
            "All",
            "Pending",
            "Processing",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
          ].map((status) => (
            <button
              key={status}
              className={`filter-btn ${
                filter === status ? "active" : ""
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* ORDERS GRID */}
        <div className="orders-grid">
          {filteredOrders.length === 0 ? (
            <p className="no-orders">No orders found.</p>
          ) : (
            filteredOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <img
                  className="order-img"
                  src={order.image || "https://via.placeholder.com/200"}
                  alt=""
                />

                <div className="order-details">
                  <div className="order-top">
                    <h3 className="order-product">{order.product}</h3>
                    <span
                      className={`status-badge ${order.status
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="order-meta">
                    <strong>Buyer:</strong> {order.customer}
                  </p>
                  <p className="order-meta">
                    <strong>Qty:</strong> {order.quantity}
                  </p>
                  <p className="order-meta">
                    <strong>Amount:</strong> ₹{order.total}
                  </p>
                  <p className="order-date">
                    <strong>Date:</strong>{" "}
                    {new Date(order.date).toLocaleString()}
                  </p>

                  <div className="order-actions">
                    <button
                      className="action-btn"
                      onClick={() => updateStatus(order.id, "Processing")}
                    >
                      Processing
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => updateStatus(order.id, "Shipped")}
                    >
                      Shipped
                    </button>
                    <button
                      className="action-btn"
                      onClick={() =>
                        updateStatus(order.id, "Out for Delivery")
                      }
                    >
                      Out for Delivery
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => updateStatus(order.id, "Delivered")}
                    >
                      Delivered
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => updateStatus(order.id, "Cancelled")}
                    >
                      ❌ Cancel
                    </button>

                    <button
                      className="track-btn"
                      onClick={() => goToTrack(order)}
                    >
                      📍 Track
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SellerOrders;
