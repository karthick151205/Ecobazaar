import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [orderMeta, setOrderMeta] = useState([]);
  const [ecoRank, setEcoRank] = useState("Eco Beginner");
  const [discount, setDiscount] = useState(10);
  const [deliveryCharge, setDeliveryCharge] = useState(50);

  const receiptRef = useRef();

  const currentBuyer =
    JSON.parse(localStorage.getItem("currentBuyer"))?.name || "Eco Shopper";

  // 🌿 ECO RANK SYSTEM
  useEffect(() => {
    const points = parseFloat(localStorage.getItem("ecoPoints")) || 0;

    let rank = "Eco Beginner";
    let discountValue = 10;
    let delivery = 50;

    if (points >= 50 && points < 100) {
      rank = "Nature Nurturer";
      discountValue = 10;
      delivery = 0;
    } else if (points >= 100 && points < 200) {
      rank = "Green Guardian";
      discountValue = 15;
      delivery = 50;
    } else if (points >= 200) {
      rank = "Eco Champion";
      discountValue = 25;
      delivery = 0;
    }

    setEcoRank(rank);
    setDiscount(discountValue);
    setDeliveryCharge(delivery);
  }, []);

  // PRICE
  const computeSubtotal = () => {
    if (isCartCheckout) {
      return cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }
    return singleProduct.price * (singleProduct.quantity || 1);
  };

  const subtotal = computeSubtotal();
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount + deliveryCharge;

  // SAVE ORDER(S)
  const saveOrder = () => {
    setIsProcessing(true);
    const orderList = [];

    const itemsToProcess = isCartCheckout ? cartItems : [singleProduct];

    itemsToProcess.forEach((item) => {
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = `TXN-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

      const newOrder = {
        id: orderId,
        productId: item.id,
        productName: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || 1,
        subtotal: item.price * (item.quantity || 1),
        discount,
        deliveryCharge,
        ecoRank,
        total,
        status: "Pending",
        date: new Date().toISOString(),
        address,
        paymentMethod:
          paymentMethod === "COD"
            ? "Cash on Delivery"
            : "Online Payment",
        transactionId,
        customer: currentBuyer,
      };

      orderList.push(newOrder);

      const buyerOrders = JSON.parse(localStorage.getItem("buyerOrders")) || [];
      localStorage.setItem("buyerOrders", JSON.stringify([...buyerOrders, newOrder]));

      const ecoOrders = JSON.parse(localStorage.getItem("ecoOrders")) || [];
      localStorage.setItem("ecoOrders", JSON.stringify([newOrder, ...ecoOrders]));
    });

    // Eco points
    const currentPoints = parseFloat(localStorage.getItem("ecoPoints")) || 0;
    const earnedPoints = itemsToProcess.length * 5;
    localStorage.setItem("ecoPoints", currentPoints + earnedPoints);

    if (isCartCheckout) localStorage.removeItem("cartItems");

    setOrderMeta(orderList);
    setShowReceipt(true);
    setIsProcessing(false);

    setTimeout(() => navigate("/orders"), 5000);
  };

  const handleConfirmPurchase = () => {
    if (!address.trim()) {
      alert("🏡 Please enter your delivery address");
      return;
    }

    if (paymentMethod === "COD") {
      saveOrder();
    } else {
      navigate("/PaymentPortal", {
        state: {
          total,
          address,
          cart: isCartCheckout ? cartItems : [singleProduct],
        },
      });
    }
  };

  if (!isCartCheckout && !singleProduct) {
    return (
      <div className="buybox-empty">
        <h2>❌ No items selected</h2>
        <button onClick={() => navigate("/BuyerDashboard")}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="buybox-container">
      <BuyerNavbar />

      <div className="buybox-content">
        <div className="buybox-card">
          {/* LEFT SIDE ITEMS */}
          <div className="buybox-left">
            <h2>🛍 Order Items</h2>

            {isCartCheckout
              ? cartItems.map((item) => (
                  <div key={item.id} className="buybox-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <h4>{item.name}</h4>
                      <p>
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))
              : (
                <div className="buybox-item">
                  <img src={singleProduct.image} alt={singleProduct.name} />
                  <div>
                    <h4>{singleProduct.name}</h4>
                    <p>₹{singleProduct.price}</p>
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT SIDE */}
          <div className="buybox-right">
            <h3>🧾 Confirm Your Order</h3>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                placeholder="House No, Street, Area, Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group payment-section">
              <label>Payment Method</label>
              <div className="payment-grid">
                <div
                  className={`payment-card ${
                    paymentMethod === "COD" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  💵 Cash on Delivery
                </div>

                <div
                  className={`payment-card ${
                    paymentMethod === "Online" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("Online")}
                >
                  💳 Online Payment
                </div>
              </div>
            </div>

            <div className="order-summary">
              <h4>Order Summary</h4>
              <p>
                <strong>Subtotal:</strong> ₹{subtotal}
              </p>
              <p>
                <strong>Eco Rank:</strong> {ecoRank}
              </p>
              <p>
                <strong>Discount ({discount}%):</strong> -₹
                {discountAmount.toFixed(2)}
              </p>
              <p>
                <strong>Delivery:</strong>{" "}
                {deliveryCharge === 0 ? "Free 🚚" : `₹${deliveryCharge}`}
              </p>
              <hr />
              <p className="total-payable">
                <strong>Total:</strong> ₹{total.toFixed(2)}
              </p>
            </div>

            <button
              className="confirm-btn"
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "✅ Place Order"}
            </button>

            <button className="cancel-btn" onClick={() => navigate(-1)}>
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>

      {/* FULL DETAILED RECEIPT */}
      {showReceipt && (
        <div className="success-overlay">
          <div className="success-box">
            <h2>🎉 Order Successful</h2>
            <p>Thank you, {currentBuyer}! Your order is confirmed.</p>

            <div ref={receiptRef} className="eco-receipt">
              <h3>🧾 Detailed Receipt</h3>

              <p>
                <strong>Customer:</strong> {currentBuyer}
              </p>
              <p>
                <strong>Delivery Address:</strong> {address}
              </p>
              <p>
                <strong>Eco Rank:</strong> {ecoRank}
              </p>
              <p>
                <strong>Payment:</strong> {paymentMethod}
              </p>
              <hr />

              {orderMeta.map((o) => (
                <div key={o.id} className="receipt-item">
                  <img src={o.image} alt="" />

                  <p><strong>{o.productName}</strong></p>
                  <p>Order ID: {o.id}</p>
                  <p>Quantity: {o.quantity}</p>
                  <p>Price: ₹{o.price}</p>
                  <p>Subtotal: ₹{o.subtotal}</p>
                  <p>Discount: {o.discount}%</p>
                </div>
              ))}

              <hr />
              <p><strong>Delivery:</strong> {deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}</p>
              <p><strong>Total Paid:</strong> ₹{total.toFixed(2)}</p>
            </div>

            <p className="redirect-msg">Redirecting to your Orders...</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default BuyBox;
