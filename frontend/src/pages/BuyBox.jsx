// src/pages/BuyBox.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";
import "./BuyBox.css";

function BuyBox() {
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cart || null;
  const singleProduct = location.state?.product || null;
  const isCartCheckout = Array.isArray(cartItems);

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderMeta, setOrderMeta] = useState(null);

  // ⭐ Eco Rank System (same as EcoRankPage + Cart.jsx)
  const [ecoRank, setEcoRank] = useState("Eco Beginner");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(50);

  // Payment Popups
  const [showUpiPopup, setShowUpiPopup] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);

  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Logged in buyer
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  // Items coming from cart or single buy
  const items = isCartCheckout
    ? cartItems || []
    : singleProduct
    ? [{ ...singleProduct, quantity: singleProduct.quantity || 1 }]
    : [];

  // ⭐ PRICE CALCULATIONS
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const totalCarbonPoints = items.reduce(
    (sum, item) => sum + (item.carbonPoints || 0) * (item.quantity || 1),
    0
  );

  const discountAmount = (subtotal * discountPercent) / 100;
  const totalAmount = subtotal - discountAmount + deliveryCharge;

  // ⭐ ECO RANK RULES EXACTLY LIKE ECORANKPAGE + CART.JSX
  const ranks = [
    { name: "Eco Beginner", min: 0, max: 50, discount: 10 },
    { name: "Nature Nurturer", min: 50, max: 100, discount: 0 },
    { name: "Green Guardian", min: 100, max: 200, discount: 15 },
    { name: "Eco Champion", min: 200, max: Infinity, discount: 25 },
  ];

  // ⭐ Load buyer’s ecoPoints from orders → same as EcoRankPage
  const loadEcoPoints = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/orders/buyer/${user.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const orders = await res.json();
      if (!Array.isArray(orders)) return;

      const total = orders.reduce(
        (sum, order) => sum + (order.totalCarbonPoints || 0),
        0
      );

      // Determine Eco Rank
      const rank = ranks.find((r) => total >= r.min && total < r.max);
      setEcoRank(rank.name);
      setDiscountPercent(rank.discount);
    } catch (e) {
      console.error("Error loading eco points:", e);
    }
  };

  // ⭐ Load Eco Points + Rank on start
  useEffect(() => {
    loadEcoPoints();
  }, []);

  // ⭐ DELIVERY CHARGE = items × 50 (your requirement)
  useEffect(() => {
    setDeliveryCharge(items.length * 50);
  }, [items]);

  if (!items.length) {
    return (
      <div className="buybox-empty">
        <BuyerNavbar />
        <div className="buybox-empty-content">
          <h2>No items to checkout</h2>
          <button onClick={() => navigate("/buyer-dashboard")}>
            Go to Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ⭐ Confirm Purchase
  const handleConfirmPurchase = async () => {
    if (!user) {
      alert("Please login as buyer to place an order.");
      navigate("/login");
      return;
    }

    if (!address.trim()) {
      alert("Please enter delivery address.");
      return;
    }

    if (paymentMethod === "UPI") return setShowUpiPopup(true);
    if (paymentMethod === "Card") return setShowCardPopup(true);

    await placeOrder(); // COD
  };

  // ⭐ Place Order
  const placeOrder = async () => {
    setIsProcessing(true);

    const mappedItems = items.map((item) => ({
      productId: item.id || item._id || item.productId,
      sellerId:
        item.sellerId ||
        item.seller_id ||
        (item.seller && (item.seller.id || item.seller._id)) ||
        "",
      productName: item.productName || item.name,
      price: item.price,
      quantity: item.quantity,
      carbonPoints: item.carbonPoints,
      imageUrl: item.image || item.imageUrl,
    }));

    const payload = {
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      address,
      paymentMethod,
      deliveryCharge,
      discount: discountPercent,
      totalAmount,
      totalCarbonPoints,
      items: mappedItems,
    };

    try {
      const res = await axios.post(
        "http://localhost:8080/api/orders",
        payload,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const createdOrder = res.data;
      setOrderMeta(createdOrder);
      setShowReceipt(true);

      if (isCartCheckout) localStorage.removeItem("cartItems");

      setTimeout(() => navigate("/buyer/orders"), 2000);
    } catch (err) {
      console.error("Order error", err);
      alert("❌ Failed to place order.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="buybox-page">
      <BuyerNavbar />

      <div className="buybox-container">
        {/* LEFT PANEL */}
        <div className="buybox-left">
          <h2>Checkout</h2>

          {/* ADDRESS */}
          <div className="buybox-section">
            <h3>Delivery Address</h3>
            <textarea
              placeholder="Enter full address with pincode"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* PAYMENT */}
          <div className="buybox-section">
            <h3>Payment Method</h3>

            <div className="payment-options">
              <label className={paymentMethod === "COD" ? "active" : ""}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />{" "}
                💵 Cash on Delivery
              </label>

              <label className={paymentMethod === "UPI" ? "active" : ""}>
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={() => {
                    setPaymentMethod("UPI");
                    setShowUpiPopup(true);
                  }}
                />{" "}
                📱 UPI
              </label>

              <label className={paymentMethod === "Card" ? "active" : ""}>
                <input
                  type="radio"
                  name="payment"
                  value="Card"
                  checked={paymentMethod === "Card"}
                  onChange={() => {
                    setPaymentMethod("Card");
                    setShowCardPopup(true);
                  }}
                />{" "}
                💳 Card
              </label>
            </div>
          </div>

          {/* ITEMS */}
          <div className="buybox-section">
            <h3>Items</h3>

            <div className="buybox-items-list">
              {items.map((item, idx) => (
                <div key={idx} className="buybox-item">
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.productName || item.name}
                  />

                  <div className="buybox-item-details">
                    <h4>{item.productName || item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    <p>Price: ₹{item.price}</p>
                    <p>♻ Carbon Points: {item.carbonPoints} / item</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="buybox-right">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Discount ({discountPercent}%)</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Charge</span>
            <span>₹{deliveryCharge}</span>
          </div>

          <hr />

          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="eco-info">
            <p>Total Carbon Points: {totalCarbonPoints.toFixed(2)}</p>
            <p>Your Eco Rank: <strong>{ecoRank}</strong></p>
          </div>

          <button
            className="confirm-btn"
            onClick={handleConfirmPurchase}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "✅ Confirm Purchase"}
          </button>
        </div>
      </div>

      {/* POPUPS — SAME CODE — NO CHANGE */}
      {/* -------------- UPI POPUP -------------- */}
      {showUpiPopup && (
        <div className="payment-popup-overlay">
          <div className="payment-popup">
            <h2>📱 UPI Payment</h2>
            <input
              type="text"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <div className="popup-btns">
              <button
                className="pay-btn"
                onClick={async () => {
                  if (!upiId.includes("@")) return alert("Invalid UPI ID");
                  setShowUpiPopup(false);
                  await placeOrder();
                }}
              >
                Pay Now
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowUpiPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------- CARD POPUP -------------- */}
      {showCardPopup && (
        <div className="payment-popup-overlay">
          <div className="payment-popup">
            <h2>💳 Card Payment</h2>

            <input
              type="text"
              placeholder="Card Number"
              maxLength={16}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />

            <input
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />

            <input
              type="password"
              placeholder="CVV"
              maxLength={3}
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />

            <div className="popup-btns">
              <button
                className="pay-btn"
                onClick={async () => {
                  if (cardNumber.length !== 16)
                    return alert("Invalid card number");
                  if (!expiry.includes("/"))
                    return alert("Invalid expiry");
                  if (cvv.length !== 3) return alert("Invalid CVV");

                  setShowCardPopup(false);
                  await placeOrder();
                }}
              >
                Pay Now
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowCardPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------- RECEIPT -------------- */}
      {showReceipt && orderMeta && (
        <div className="buybox-overlay">
          <div className="buybox-receipt">
            <h3>🎉 Order Confirmed</h3>
            <p>Order ID: {orderMeta.id}</p>
            <p>Amount Paid: ₹{orderMeta.totalAmount}</p>
            <p>Status: {orderMeta.status}</p>

            <button onClick={() => navigate("/buyer/orders")}>
              View My Orders
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default BuyBox;
