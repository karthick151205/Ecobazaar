// src/pages/BuyerOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";
import "./BuyerOrders.css";

function BuyerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  const calculateOrderEcoPoints = (order) => {
    if (!order || !Array.isArray(order.items)) return 0;

    return order.items.reduce(
      (sum, item) =>
        sum + (item.carbonPoints || 0) * (item.quantity || 1),
      0
    );
  };

  const calculateTotalEcoPoints = (allOrders) => {
    return (allOrders || []).reduce(
      (sum, o) => sum + calculateOrderEcoPoints(o),
      0
    );
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/orders/buyer/${user.id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  const handleCancelOrder = async (order) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.put(
        `http://localhost:8080/api/orders/cancel/${order.id}`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      alert("Order cancelled.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order.");
    }
  };

  const handleReturnOrder = async (order) => {
    if (!window.confirm("Start a return request?")) return;

    try {
      await axios.put(
        `http://localhost:8080/api/orders/return/${order.id}`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      alert("Return processed.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to return order.");
    }
  };

  const totalEcoPoints = calculateTotalEcoPoints(orders);

  return (
    <div className="buyer-orders-page">
      <BuyerNavbar />

      <div className="buyer-orders-container">
        <h2>My Orders</h2>

        {user && orders.length > 0 && (
          <div className="eco-summary-card">
            <p>
              🌿 <strong>Your Total Eco Points from Purchases:</strong>{" "}
              <span className="eco-total">{totalEcoPoints.toFixed(1)} EP</span>
            </p>
          </div>
        )}

        {loading ? (
          <p>Loading your orders...</p>
        ) : !user ? (
          <div className="buyer-orders-empty">
            <p>Please login to view your orders.</p>
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="buyer-orders-empty">
            <p>You have no orders yet.</p>
            <button onClick={() => navigate("/buyer-dashboard")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const orderEcoPoints = calculateOrderEcoPoints(order);

              return (
                <div className="order-card" key={order.id}>
                  {/* Header */}
                  <div className="order-header">
                    <div>
                      <h4>Order ID: {order.id}</h4>
                      <p>
                        Placed on:{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "—"}
                      </p>

                      <p className="eco-points-earned">
                        🌱 Eco Points from this order:{" "}
                        <strong>{orderEcoPoints.toFixed(1)}</strong>
                      </p>
                    </div>

                    <div
                      className={`status-pill status-${order.status
                        ?.toLowerCase()
                        ?.replace(/_/g, "-")}`}
                    >
                      {order.status}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="order-items">
                    {order.items?.map((item, index) => (
                      <div className="order-item-row" key={index}>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}

                        <div className="item-info">
                          <h5>{item.productName}</h5>
                          <p>Qty: {item.quantity}</p>
                          <p>Price: ₹{item.price}</p>
                          <p className="eco-small">
                            ♻ Eco: {item.carbonPoints || 0} / item
                          </p>

                          {/* ⭐⭐⭐ SHOW SELLER STATUS ⭐⭐⭐ */}
                          <p className="seller-status-line">
                            🚚 Seller Status:{" "}
                            <strong>
                              {item.sellerStatus
                                ? item.sellerStatus.replace(/_/g, " ")
                                : "CONFIRMED"}
                            </strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="order-footer">
                    <div className="order-amount">
                      <p>Total Amount</p>
                      <h4>₹{order.totalAmount?.toFixed(2)}</h4>
                    </div>

                    <div className="order-actions">
                      <button
                        className="track-btn"
                        onClick={() => navigate(`/buyer/track/${order.id}`)}
                      >
                        🚚 Track
                      </button>

                      {order.status === "DELIVERED" && (
                        <button
                          className="return-btn"
                          onClick={() => handleReturnOrder(order)}
                        >
                          🔄 Return
                        </button>
                      )}

                      {(order.status === "PENDING" ||
                        order.status === "CONFIRMED") && (
                        <button
                          className="cancel-btn-order"
                          onClick={() => handleCancelOrder(order)}
                        >
                          ❌ Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default BuyerOrders;
