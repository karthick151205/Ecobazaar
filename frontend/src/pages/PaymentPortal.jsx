// src/pages/PaymentPortal.jsx

import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";
import "./PaymentPortal.css";

function PaymentPortal() {
  const navigate = useNavigate();
  const location = useLocation();

  // Accept both single product and cart
  const singleProduct = location.state?.product || null;
  const cartProducts = location.state?.cart || null;
  const address = location.state?.address;
  const totalAmount = location.state?.total;

  const isCartCheckout = Array.isArray(cartProducts);
  const buyerName =
    JSON.parse(localStorage.getItem("currentBuyer"))?.name || "Eco Buyer";

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [bank, setBank] = useState("");
  const [success, setSuccess] = useState(false);
  const [receiptOrders, setReceiptOrders] = useState([]);
  const receiptRef = useRef();

  if (!singleProduct && !isCartCheckout) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <h2>⚠️ No items to pay for</h2>
        <button onClick={() => navigate("/BuyerDashboard")}>Back to Home</button>
      </div>
    );
  }

  // Generate Transaction ID
  const generateTxn = (type) =>
    `TXN-${type}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Eco Rank Logic (same as BuyBox)
  const points = parseFloat(localStorage.getItem("ecoPoints")) || 0;
  let ecoRank = "Eco Beginner";
  let discount = 10;
  let deliveryCharge = 50;

  if (points >= 50 && points < 100) {
    ecoRank = "Nature Nurturer";
    discount = 10;
    deliveryCharge = 0;
  } else if (points >= 100 && points < 200) {
    ecoRank = "Green Guardian";
    discount = 15;
  } else if (points >= 200) {
    ecoRank = "Eco Champion";
    discount = 25;
    deliveryCharge = 0;
  }

  // Payment Done Handler
  const handlePaymentDone = (method) => {
    const txnId = generateTxn(method);

    const itemsToProcess = isCartCheckout
      ? cartProducts
      : [{ ...singleProduct, quantity: 1 }];

    const newOrders = itemsToProcess.map((item) => {
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        id: orderId,
        productId: item.id,
        productName: item.name,
        image: item.image,
        quantity: item.quantity || 1,
        price: item.price,
        total: item.price * (item.quantity || 1),
        date: new Date().toISOString(),
        status: "Pending",
        address,
        paymentMethod: `Paid Online (${method})`,
        transactionId: txnId,
        buyer: buyerName,
        ecoRank,
        discount,
        deliveryCharge,
      };
    });

    // Save to Buyer
    const existingBuyerOrders =
      JSON.parse(localStorage.getItem("buyerOrders")) || [];
    localStorage.setItem(
      "buyerOrders",
      JSON.stringify([...existingBuyerOrders, ...newOrders])
    );

    // Save to Seller (ecoOrders)
    const existingSellerOrders =
      JSON.parse(localStorage.getItem("ecoOrders")) || [];
    localStorage.setItem(
      "ecoOrders",
      JSON.stringify([...newOrders, ...existingSellerOrders])
    );

    // Trigger auto refresh for seller & buyer
    localStorage.setItem("refreshSellerPages", String(Date.now()));
    localStorage.setItem("refreshBuyerPages", String(Date.now()));

    // Add eco points
    const currentPoints = parseFloat(localStorage.getItem("ecoPoints")) || 0;
    localStorage.setItem("ecoPoints", currentPoints + itemsToProcess.length * 5);

    if (isCartCheckout) {
      localStorage.removeItem("cartItems");
    }

    setReceiptOrders(newOrders);
    setSuccess(true);

    setTimeout(() => navigate("/buyer/orders"), 6000);
  };

  // Print receipt
  const handlePrint = () => {
    const content = receiptRef.current.innerHTML;
    const win = window.open("", "_blank", "width=800,height=700");
    win.document.write(`
      <html>
        <head>
          <title>EcoBazaarX Receipt</title>
          <style>
            body { font-family: Poppins; padding: 20px; }
            img { width: 90px; border-radius: 8px; }
            .item { border-bottom: 1px solid #ddd; margin-bottom: 15px; }
            .header { text-align:center; margin-bottom:20px; }
            .header h2 { margin-bottom:5px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="payment-container">
      <BuyerNavbar />

      <div className="portal-wrapper">
        {/* BEFORE SUCCESS */}
        {!success && (
          <div className="portal-box">
            <h2>💳 Secure Payment Portal</h2>
            <p className="desc">Choose a payment method below</p>

            {/* Payment Selection */}
            <div className="method-grid">
              {["UPI", "Card", "NetBanking"].map((m) => (
                <div
                  key={m}
                  className={`method-card ${
                    selectedMethod === m ? "active" : ""
                  }`}
                  onClick={() => setSelectedMethod(m)}
                >
                  <h4>{m}</h4>
                </div>
              ))}
            </div>

            {/* UPI */}
            {selectedMethod === "UPI" && (
              <div className="upi-section">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=ecobazaarx@upi&pn=EcoBazaarX&am=10&cu=INR&size=200x200"
                  alt="upi"
                  className="upi-qr"
                />
                <button
                  className="pay-btn"
                  onClick={() => handlePaymentDone("UPI")}
                >
                  ✅ Payment Done
                </button>
              </div>
            )}

            {/* CARD FORM */}
            {selectedMethod === "Card" && (
              <div className="card-form">
                <input type="text" placeholder="Card Number" maxLength="16" />
                <div className="card-row">
                  <input type="text" placeholder="MM/YY" maxLength="5" />
                  <input type="text" placeholder="CVV" maxLength="3" />
                </div>
                <button
                  className="pay-btn"
                  onClick={() => handlePaymentDone("Card")}
                >
                  ✅ Payment Done
                </button>
              </div>
            )}

            {/* NET BANKING */}
            {selectedMethod === "NetBanking" && (
              <div className="netbank-form">
                <select value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option value="">-- Select Bank --</option>
                  <option>SBI</option>
                  <option>HDFC</option>
                  <option>ICICI</option>
                  <option>Axis</option>
                  <option>Kotak</option>
                </select>
                <button
                  className="pay-btn"
                  onClick={() => handlePaymentDone("NetBanking")}
                >
                  ✅ Payment Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* AFTER SUCCESS */}
        {success && (
          <div className="success-box">
            <h2>🎉 Payment Successful!</h2>

            <div ref={receiptRef} className="eco-receipt">
  <div className="header">
    <h2>EcoBazaarX</h2>
    <p>Eco-Friendly Online Marketplace 🌱</p>
  </div>

  <h3>🧾 Detailed Order Receipt</h3>

  <p><strong>Buyer:</strong> {buyerName}</p>
  <p><strong>Delivery Address:</strong> {address}</p>
  <p><strong>Eco Rank:</strong> {ecoRank}</p>
  <p><strong>Payment Mode:</strong> Online ({selectedMethod})</p>
  <p><strong>Date:</strong> {new Date().toLocaleString()}</p>

  <hr />

  <table className="receipt-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {receiptOrders.map((order) => (
        <tr key={order.id}>
          <td>{order.productName}</td>
          <td>{order.quantity}</td>
          <td>₹{order.price}</td>
          <td>₹{order.total}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <hr />

  <p><strong>Subtotal:</strong> ₹{totalAmount}</p>
  <p><strong>Discount:</strong> {discount}%</p>
  <p><strong>Delivery Charge:</strong> {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</p>
  <p><strong>GST (5%):</strong> ₹{(totalAmount * 0.05).toFixed(2)}</p>

  <p className="grand-total">
    <strong>Grand Total:</strong> ₹{(totalAmount * 1.05).toFixed(2)}
  </p>

  <p><strong>Eco Points Earned:</strong> {receiptOrders.length * 5} ♻</p>

  <hr />
  <p className="thank-note">🌱 Thank you for supporting sustainable shopping!</p>
</div>


            <button className="print-btn" onClick={handlePrint}>
              🖨 Print Receipt
            </button>
            <p className="redirect-msg">Redirecting to Orders...</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default PaymentPortal;
