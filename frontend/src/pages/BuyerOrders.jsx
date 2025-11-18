import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";
import "./BuyerOrders.css";

// import product images
import kurtiImg from "../assets/kurthi.webp";
import bagImg from "../assets/cotton_bag.jpg";
import coverImg from "../assets/cover.webp";

function BuyerOrders() {
  const navigate = useNavigate();

  // Load orders from localStorage or demo
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("buyerOrders");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "ORD-1001",
        productName: "Organic Cotton Kurti",
        image: kurtiImg,
        price: 335,
        quantity: 1,
        date: "2025-11-05",
        status: "Delivered",
        category: "Women",
        rating: 4.2,
        carbonPoints: 1.3,
      },
      {
        id: "ORD-1002",
        productName: "Recycled Tote Bag",
        image: bagImg,
        price: 210,
        quantity: 2,
        date: "2025-11-03",
        status: "Shipped",
        category: "Accessories",
        rating: 4.3,
        carbonPoints: 1.0,
      },
      {
        id: "ORD-1003",
        productName: "Eco Phone Cover",
        image: coverImg,
        price: 163,
        quantity: 1,
        date: "2025-11-01",
        status: "Pending",
        category: "Accessories",
        rating: 3.9,
        carbonPoints: 0.6,
      },
    ];
  });

  // Save initial data
  useEffect(() => {
    localStorage.setItem("buyerOrders", JSON.stringify(orders));
  }, []);

  const updateOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem("buyerOrders", JSON.stringify(updated));
  };

  // Sync to seller side
  const syncSellerOrders = (orderId, newStatus) => {
    const ecoOrders = JSON.parse(localStorage.getItem("ecoOrders")) || [];
    const updatedEco = ecoOrders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    localStorage.setItem("ecoOrders", JSON.stringify(updatedEco));

    localStorage.setItem("refreshBuyerPages", String(Date.now()));
    localStorage.setItem("refreshSellerPages", String(Date.now()));
  };

  // Cancel pending
  const cancelOrder = (id) => {
    if (!window.confirm("Cancel order?")) return;
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: "Cancelled" } : o
    );
    updateOrders(updated);
    syncSellerOrders(id, "Cancelled");
    alert("Order cancelled.");
  };

  // Return delivered
  const returnOrder = (id) => {
    if (!window.confirm("Return this order?")) return;
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: "Returned" } : o
    );
    updateOrders(updated);
    syncSellerOrders(id, "Returned");
    alert("Return processed.");
  };

  // Reorder (demo)
  const reorder = (order) => {
    alert(`Reorder placed for ${order.productName}`);
  };

  // React to seller updates
  useEffect(() => {
    const handleStorage = () => {
      const updated = JSON.parse(localStorage.getItem("buyerOrders")) || [];
      setOrders(updated);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ===========================
  // ⭐ NEW – Navigate to tracking
  // ===========================
  const goToTrack = (order) => {
    navigate(`/buyer/track/${order.id}`, { state: { order } });
  };

  // View product details
  const viewProductDetails = (order) => {
    const product = {
      name: order.productName,
      image: order.image,
      price: order.price,
      category: order.category,
      rating: order.rating,
      carbonFootprint: order.carbonPoints,
    };
    navigate("/product/:id", { state: { product } });
  };

  return (
    <div className="buyer-container">
      <BuyerNavbar />

      <div className="orders-section">
        <h2>🧾 My Orders</h2>
        <p className="order-subtext">
          Track your eco-friendly purchases and manage cancellations/returns.
        </p>

        {orders.length === 0 ? (
          <p className="no-orders">No orders placed yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <img
                  src={order.image}
                  alt={order.productName}
                  className="order-img clickable"
                  onClick={() => viewProductDetails(order)}
                />

                <div className="order-details">
                  <h3>{order.productName}</h3>

                  <p>
                    <strong>Amount:</strong> ₹{order.price * order.quantity}
                  </p>
                  <p>
                    <strong>Date:</strong> {order.date}
                  </p>

                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>

                  <div className="order-actions">

                    {/* ⭐ Pending */}
                    {order.status === "Pending" && (
                      <>
                        <button
                          className="cancel-order-btn"
                          onClick={() => cancelOrder(order.id)}
                        >
                          Cancel Order
                        </button>
                        <button
                          className="track-btn"
                          onClick={() => goToTrack(order)}
                        >
                          Track Order
                        </button>
                      </>
                    )}

                    {/* ⭐ Shipped */}
                    {order.status === "Shipped" && (
                      <>
                        <button
                          className="track-btn"
                          onClick={() => goToTrack(order)}
                        >
                          Track Package
                        </button>
                        <button
                          className="details-btn"
                          onClick={() => viewProductDetails(order)}
                        >
                          View Details
                        </button>
                      </>
                    )}

                    {/* ⭐ Delivered */}
                    {order.status === "Delivered" && (
                      <>
                        <button
                          className="return-order-btn"
                          onClick={() => returnOrder(order.id)}
                        >
                          Return Item
                        </button>
                        <button
                          className="track-btn"
                          onClick={() => goToTrack(order)}
                        >
                          Track Timeline
                        </button>
                      </>
                    )}

                    {/* Returned / Cancelled */}
                    {(order.status === "Returned" ||
                      order.status === "Cancelled") && (
                      <button
                        className="track-btn"
                        onClick={() => goToTrack(order)}
                      >
                        View Timeline
                      </button>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default BuyerOrders;
