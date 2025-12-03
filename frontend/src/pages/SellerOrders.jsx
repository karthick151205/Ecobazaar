// src/pages/SellerOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";
import "./SellerOrders.css";

function SellerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read logged-in seller user
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  /* ------------------------------------
     🔊 Play notification ONCE on login
  -------------------------------------- */
  useEffect(() => {
    const loggedIn = localStorage.getItem("sellerLoggedIn");

    if (loggedIn === "true") {
      const audio = new Audio("/audio/new_order.mp3");
      audio.volume = 1;
      audio
        .play()
        .catch((err) => console.log("Autoplay blocked:", err));

      localStorage.removeItem("sellerLoggedIn");
    }
  }, []);

  /* ------------------------------------
     🔥 Fetch seller-specific orders
  -------------------------------------- */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/orders/seller/${user.id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error("Error fetching seller orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  if (!user) {
    return (
      <div className="seller-orders-page">
        <SellerNavbar />
        <div className="seller-orders-container">
          <div className="seller-orders-empty">
            <p>Please login as seller to view your orders.</p>
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ------------------------------------
       Render Seller Orders
  -------------------------------------- */

  return (
    <div className="seller-orders-page">
      <SellerNavbar />

      <div className="seller-orders-container">
        <h2>Orders for Your Products</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="seller-orders-empty">
            <p>No orders for your products yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const sellerItems =
                order.items?.filter((item) => item.sellerId === user.id) || [];

              if (sellerItems.length === 0) return null;

              const sellerTotal = sellerItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              return (
                <div className="order-card" key={order.id}>
                  {/* ------ Order Header ------ */}
                  <div className="order-header">
                    <div>
                      <h4>Order ID: {order.id}</h4>
                      <p>
                        Buyer: <strong>{order.buyerName}</strong> (
                        {order.buyerEmail})
                      </p>
                      <p>
                        Order Date:{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>

                    {/* ⭐ Show Seller Status (Not Buyer Status) ⭐ */}
                    <div
                      className={`status-pill status-${sellerItems[0].sellerStatus
                        ?.toLowerCase()
                        ?.replace(/_/g, "-")}`}
                    >
                      {sellerItems[0].sellerStatus?.replace(/_/g, " ")}
                    </div>
                  </div>

                  {/* ------ Items for this seller ------ */}
                  <div className="order-items">
                    {sellerItems.map((item, index) => {
                      const image =
                        item.imageUrl ||
                        "https://via.placeholder.com/100?text=No+Image";

                      return (
                        <div className="order-item-row" key={index}>
                          <img
                            src={image}
                            alt={item.productName}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                          <div className="item-info">
                            <h5>{item.productName}</h5>
                            <p>Qty: {item.quantity}</p>
                            <p>Price: ₹{item.price}</p>

                            {/* ⭐ Item-Level Status Display ⭐ */}
                            <p className="seller-status-line">
                              Status:{" "}
                              <strong>
                                {item.sellerStatus?.replace(/_/g, " ")}
                              </strong>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ------ Footer ------ */}
                  <div className="order-footer">
                    <div className="order-amount">
                      <p>Your total for this order</p>
                      <h4>₹{sellerTotal.toFixed(2)}</h4>
                    </div>

                    {/* ⭐⭐⭐ Track Button — Correct Seller Status ⭐⭐⭐ */}
                    <button
                      className="track-btn"
                      onClick={() =>
                        navigate(`/seller/track/${order.id}`, {
                          state: {
                            orderId: order.id,
                            sellerId: user.id,
                            productId: sellerItems[0].productId,
                            sellerStatus: sellerItems[0].sellerStatus,
                            date: order.createdAt,
                            buyerName: order.buyerName,
                            buyerEmail: order.buyerEmail,
                            totalAmount: sellerTotal,
                          },
                        })
                      }
                    >
                      📍 Track Order
                    </button>
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

export default SellerOrders;
