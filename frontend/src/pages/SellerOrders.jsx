import React, { useEffect, useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import "./SellerDashboard.css";


function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // ✅ Load orders from localStorage or demo data
  useEffect(() => {
    const saved = localStorage.getItem("sellerOrders");
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      const demoOrders = [
        {
          id: "ORD-101",
          productName: "Organic Cotton Kurti",
          buyerName: "Lakshmi Devi",
          quantity: 2,
          price: 670,
          date: "2025-11-07",
          status: "Pending",
        },
        {
          id: "ORD-102",
          productName: "Bamboo Toothbrush Set",
          buyerName: "Ravi Kumar",
          quantity: 1,
          price: 120,
          date: "2025-11-06",
          status: "Shipped",
        },
        {
          id: "ORD-103",
          productName: "Reusable Bottle",
          buyerName: "Anjali Sharma",
          quantity: 3,
          price: 750,
          date: "2025-11-05",
          status: "Delivered",
        },
        {
          id: "ORD-104",
          productName: "Eco Notebook",
          buyerName: "Vijay Raj",
          quantity: 1,
          price: 180,
          date: "2025-11-03",
          status: "Returned",
        },
      ];
      setOrders(demoOrders);
      localStorage.setItem("sellerOrders", JSON.stringify(demoOrders));
    }
  }, []);

  // ✅ Save updated orders
  const saveOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem("sellerOrders", JSON.stringify(updated));
  };

  // ✅ Filter orders by selected status
  const filteredOrders =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  // ✅ Enable edit mode for one order
  const handleEdit = (id, currentStatus) => {
    setEditId(id);
    setNewStatus(currentStatus);
  };

  // ✅ Save new status for the selected order
  const handleSaveStatus = (id) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    saveOrders(updatedOrders);
    setEditId(null);
    alert("✅ Order status updated successfully!");
  };

  return (
    <div className="seller-container">
      <SellerNavbar />

      <div className="orders-section">
        <h2>📦 Seller Orders</h2>

        {/* ✅ Filter Buttons */}
        <div className="filter-buttons">
          {["All", "Pending", "Shipped", "Delivered", "Returned"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <p>No {filter === "All" ? "" : filter} orders available.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Buyer</th>
                <th>Qty</th>
                <th>Total (₹)</th>
                <th>Date</th>
                <th>Status</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.productName}</td>
                  <td>{order.buyerName}</td>
                  <td>{order.quantity}</td>
                  <td>{order.price}</td>
                  <td>{order.date}</td>
                  <td>
                    {editId === order.id ? (
                      <select
                        className="status-dropdown"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                      </select>
                    ) : (
                      <span
                        className={`status-badge ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td>
                    {editId === order.id ? (
                      <button
                        className="save-btn"
                        onClick={() => handleSaveStatus(order.id)}
                      >
                        💾 Save
                      </button>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(order.id, order.status)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
      </div>
    </div>
    
  );
}

export default SellerOrders;
