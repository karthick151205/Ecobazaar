import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";
import "./Cart.css";

function Cart() {
  const [cart, setCart] = useState([]);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [ecoRank, setEcoRank] = useState("Eco Beginner");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(50);

  const navigate = useNavigate();

  /* --------- Buyer Fetch --------- */
  const getBuyer = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const buyer = getBuyer();
  const buyerId = buyer?.id;
  const token = localStorage.getItem("token");

  /* ------------------------------------
        ECO RANK RULES (Copied from EcoRankPage)
     ------------------------------------ */
  const ranks = [
    {
      name: "Eco Beginner",
      min: 0,
      max: 50,
      discount: 10, // ⭐ 10% discount
    },
    {
      name: "Nature Nurturer",
      min: 50,
      max: 100,
      discount: 0, // ⭐ No discount but free delivery we can add later
    },
    {
      name: "Green Guardian",
      min: 100,
      max: 200,
      discount: 15,
    },
    {
      name: "Eco Champion",
      min: 200,
      max: Infinity,
      discount: 25,
    },
  ];

  /* ------------ LOAD ECO POINTS FROM ORDERS ------------ */
  const loadEcoPoints = async () => {
    if (!buyerId) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/orders/buyer/${buyerId}`,
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

      setEcoPoints(total);

      // Calculate Rank
      const rankInfo =
        ranks.find((r) => total >= r.min && total < r.max) || ranks[0];

      setEcoRank(rankInfo.name);
      setDiscountPercent(rankInfo.discount);
    } catch (err) {
      console.error("EcoRank load error:", err);
    }
  };

  /* ---------------- FETCH CART ---------------- */
  useEffect(() => {
    const fetchCart = async () => {
      if (!buyerId) return;

      try {
        const res = await fetch(`http://localhost:8080/api/cart/${buyerId}`);
        if (!res.ok) throw new Error("Failed to fetch cart");

        const data = await res.json();
        setCart(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };

    fetchCart();
    loadEcoPoints();
  }, [buyerId]);

  /* ---------------- DELIVERY CHARGE ----------------  
     ⭐ If rank = Nature Nurturer → FREE DELIVERY  
  ---------------------------------------------------*/
  useEffect(() => {
    if (ecoRank === "Nature Nurturer") {
      setDeliveryCharge(0);
    } else {
      const count = cart.length;
      setDeliveryCharge(count > 0 ? count * 50 : 50);
    }
  }, [cart, ecoRank]);

  /* ---------------- REMOVE ITEM ---------------- */
  const removeItem = async (cartItemId) => {
    if (!window.confirm("Remove this item?")) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/cart/delete/${cartItemId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete item");

      setCart(cart.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item");
    }
  };

  /* ---------------- UPDATE QUANTITY ---------------- */
  const updateQuantity = async (cartItemId, qty) => {
    const quantity = Math.max(1, qty);

    try {
      const res = await fetch(
        `http://localhost:8080/api/cart/${cartItemId}/quantity`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!res.ok) throw new Error("Failed to update quantity");

      const updatedItem = await res.json();

      setCart((prev) =>
        prev.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    } catch (err) {
      console.error("Quantity update error:", err);
      alert("Failed to update quantity");
    }
  };

  /* ---------------- PRICE CALCULATIONS ---------------- */
  const subtotal = cart.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount + deliveryCharge;

  /* ---------------- CHECKOUT ---------------- */
  const handleCheckout = (items) => {
    navigate("/buybox", {
      state: {
        cart: items.map((item) => ({
          ...item,
          sellerId: item.sellerId || item.seller?.id || "",
        })),
      },
    });
  };

  return (
    <div className="cart-container">
      <BuyerNavbar ecoPoints={ecoPoints} cartItems={cart} />

      <div className="cart-content">
        <h2>🛒 My Eco Cart</h2>
        <p className="cart-subtext">Review your sustainable picks.</p>

        {(!Array.isArray(cart) || cart.length === 0) ? (
          <div className="empty-cart">
            <h3>🪴 Your cart is empty</h3>
            <button
              className="shop-btn"
              onClick={() => navigate("/BuyerDashboard")}
            >
              🛍 Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={item.image || item.imageUrl || ""}
                    alt={item.name}
                    className="cart-img"
                  />

                  <div className="cart-details">
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>

                    <div className="quantity-box">
                      <label htmlFor={`qty-${item.id}`}>Qty:</label>
                      <input
                        id={`qty-${item.id}`}
                        name={`qty-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                      />
                    </div>

                    <p>
                      <strong>Total:</strong>{" "}
                      ₹{(item.price || 0) * (item.quantity || 1)}
                    </p>
                  </div>

                  <div className="cart-actions">
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      ❌ Remove
                    </button>

                    <button
                      className="buy-btn"
                      onClick={() =>
                        handleCheckout([
                          {
                            ...item,
                            sellerId: item.sellerId || item.seller?.id || "",
                          },
                        ])
                      }
                    >
                      ✅ Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <h3>🧾 Order Summary</h3>

              <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>

              <p><strong>Your Rank:</strong> {ecoRank}</p>

              <p>
                <strong>Discount ({discountPercent}%):</strong> -₹
                {discountAmount.toFixed(2)}
              </p>

              <p><strong>Delivery Charge:</strong> ₹{deliveryCharge}</p>

              <hr />

              <p className="total">
                <strong>Total Payable:</strong> ₹{total.toFixed(2)}
              </p>

              <button className="checkout-btn" onClick={() => handleCheckout(cart)}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Cart;
