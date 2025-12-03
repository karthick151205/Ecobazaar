import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const order = state?.order;

  if (!order) return <h2>No order found</h2>;

  return (
    <div className="order-success">
      <h2>🎉 Order Placed Successfully!</h2>

      <p>Order ID: <strong>{order.id}</strong></p>
      <p>Total Eco Points Earned: 🌱 <strong>{order.totalCarbonPoints}</strong></p>

      <button onClick={() => navigate("/buyer/orders")}>View Orders</button>
    </div>
  );
}

export default OrderSuccess;
