import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BuyerNavbar from "../components/BuyerNavbar";
import "./ProductDetails.css";

function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product;

  /** ⭐ FIX: Smooth scroll to top when product changes */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product]);

  /** ⭐ UNIFIED PRODUCT NAVIGATOR */
  const viewProduct = (p) => {
    const pid = p.id || p._id || p.product_id;
    navigate(`/product/${pid}`, { state: { product: p } });
  };

  const safeId = (p) => p?._id || p?.id || p?.product_id || "";
  const safeImage = (p) => {
    const raw = p?.image || p?.imageUrl || p?.img || p?.photo || "";
    if (!raw || raw.trim() === "") {
      return "https://via.placeholder.com/300x300.png?text=Eco+Product";
    }
    if (raw.startsWith("data:image")) return raw;
    if (raw.startsWith("/")) return `http://localhost:8080${raw}`;
    return raw;
  };

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [mainImage, setMainImage] = useState(product ? safeImage(product) : "");

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const [recommended, setRecommended] = useState([]);
  const [mlRecommended, setMlRecommended] = useState([]);
  

  /** LOAD CART */
  const loadCartBackend = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const buyerId = user?._id || user?.id;

    if (!buyerId) return;

    try {
      const res = await fetch(`http://localhost:8080/api/cart/${buyerId}`);
      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading cart:", err);
    }
  };

  useEffect(() => {
    loadCartBackend();
  }, []);

  /** LOAD REVIEWS */
  useEffect(() => {
    if (!product) return;

    const id = safeId(product);
    fetch(`http://localhost:8080/api/products/${id}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setReviews(data));
  }, [product]);

  /** CATEGORY RECOMMEND */
  useEffect(() => {
    if (!product || !product.category) return;

    fetch(`http://localhost:8080/api/products/category/${product.category}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!Array.isArray(data)) return;
        const filtered = data.filter((p) => safeId(p) !== safeId(product));
        setRecommended(filtered.slice(0, 8));
      });
  }, [product]);


  /** ML RECOMMEND */
  useEffect(() => {
    if (!product) return;

    const pid = safeId(product);
    if (!pid) return;

    fetch("http://127.0.0.1:5000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: pid }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.recommendations)) {
          setMlRecommended(data.recommendations);
        }
      })
      .catch((err) => console.error("ML Recommendation Error:", err));
  }, [product]);

  if (!product)
    return <h3 style={{ textAlign: "center", marginTop: 80 }}>Product not found</h3>;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const totalRating = reviews.reduce((s, r) => s + (r.rating || 0), 0);
  const averageRating = reviews.length
    ? (totalRating / reviews.length).toFixed(1)
    : product.rating || 4.2;

  /** ADD TO CART */
  const addToCart = async (item = product) => {
    if (!item) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const buyerId = user?._id || user?.id;
    const buyerRole = user?.role?.toUpperCase();

    if (!buyerId) {
      alert("Please login as a buyer to add items to cart.");
      return;
    }

    if (buyerRole !== "BUYER") {
      alert("You must be logged in as a BUYER.");
      return;
    }

    if (isOutOfStock) {
      alert("Out of stock!");
      return;
    }

    const payload = {
      buyerId,
      productId: safeId(item),
      name: item.name,
      price: item.price,
      image: safeImage(item),
      category: item.category,
      ecoPoints: item.ecoPoints || 0,
      sellerId: item.sellerId || "",
    };

    try {
      await fetch("http://localhost:8080/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      loadCartBackend();
      alert("Item added to cart!");
    } catch (err) {
      console.error("Error add:", err);
      alert("Could not add item to cart.");
    }
  };

  /** ⭐ BUY NOW — UPDATED ONLY THIS PART */
  const handleBuyNow = () => {
    if (isOutOfStock) {
      alert("Out of stock!");
      return;
    }

    navigate("/buybox", {
      state: {
        product, // Pass product to BuyBox
      },
    });
  };
  
  const submitReview = async () => {
  if (!newReview.comment.trim()) {
    alert("Please enter a review.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please login to submit a review.");
    return;
  }

  const buyerId = user._id || user.id;
  const productId = safeId(product);

  const payload = {
    productId,
    buyerId,
    buyerName: user.name || "User",
    rating: newReview.rating,
    comment: newReview.comment,
  };

  setSubmitting(true);

  try {
    const res = await fetch("http://localhost:8080/api/reviews/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Review submitted!");
      setNewReview({ rating: 5, comment: "" });

      // Reload reviews
      const refresh = await fetch(
        `http://localhost:8080/api/products/${productId}/reviews`
      );
      const data = await refresh.json();
      setReviews(data);
    } else {
      alert("Failed to submit review.");
    }
  } catch (err) {
    console.error("Review error:", err);
  }

  setSubmitting(false);
};


  return (
    <>
      <BuyerNavbar cartItems={cart} onCartToggle={() => setShowCart(!showCart)} />

      {/* CART POPUP */}
      {showCart && (
        <div className="cart-popup">
          <h3>My Cart</h3>
          {cart.map((item, i) => (
            <div key={i} className="cart-item">
              <span>{item.name}</span>
              <span>₹{item.price} × {item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* MAIN PRODUCT SECTION */}
      <div className="meesho-product-container">
        {/* LEFT IMAGES */}
        <div className="image-section">
          <div className="thumbnail-list">
            {[safeImage(product)].map((img, i) => (
              <img
                key={i}
                src={img}
                className={mainImage === img ? "active" : ""}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>

          <div className="main-image-box">
            <img src={mainImage} alt={product.name} />
          </div>
        </div>

        {/* RIGHT INFO */}
        <div className="info-section">
          <h2 className="product-title">{product.name}</h2>
          <p className="product-price">₹{product.price}</p>

          {/* Rating */}
          <div className="rating-row">
            <span className="rating-badge">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={i < Math.round(averageRating) ? "star filled" : "star"}
                >
                  ★
                </span>
              ))}
              <span className="numeric-rating">({averageRating})</span>
            </span>

            <span className="review-count">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>

            <span className="trust-badge">✔ Verified</span>
          </div>

          {/* STOCK INFO */}
          {isOutOfStock ? (
            <p className="out-of-stock">❌ Out of Stock</p>
          ) : isLowStock ? (
            <p className="low-stock">⚠ Only {product.stock} left!</p>
          ) : (
            <p className="in-stock">🟢 In Stock</p>
          )}

          <div className="product-description-box">
            <h4>Description</h4>
            <p>{product.description}</p>
          </div>

          <div className="action-buttons">
            <button
              className={`add-cart-btn ${isOutOfStock ? "disabled" : ""}`}
              disabled={isOutOfStock}
              onClick={() => addToCart(product)}
            >
              🛒 Add to Cart
            </button>

            <button
              className={`buy-now-btn ${isOutOfStock ? "disabled" : ""}`}
              disabled={isOutOfStock}
              onClick={handleBuyNow}
            >
              🛍 Buy Now
            </button>
          </div>

          {/* REVIEWS */}
          <h3 className="section-title">Customer Reviews</h3>

          <div className="review-summary-box">
            <div className="summary-left">
              <h1>{averageRating}</h1>
              <p>out of 5</p>

              <div className="star-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.round(averageRating) ? "star filled" : "star"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="summary-right">
              {[5, 4, 3, 2, 1].map((val, i) => {
                const count = reviews.filter((r) => r.rating === val).length;
                const width = reviews.length ? (count / reviews.length) * 100 : 0;

                return (
                  <div className="rating-row-bar" key={i}>
                    <span>{val} ★</span>
                    <div className="rating-bar">
                      <div className="rating-fill" style={{ width: `${width}%` }}></div>
                    </div>
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ⭐ WRITE REVIEW BOX */}
<div className="write-review-box">
  <div className="review-form-block">

    {/* Star Rating */}
    <div className="star-input">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`star-input-item ${i < newReview.rating ? "filled" : ""}`}
          onClick={() =>
            setNewReview((prev) => ({ ...prev, rating: i + 1 }))
          }
        >
          ★
        </span>
      ))}
    </div>

    {/* Review Text */}
    <textarea
      placeholder="Write your review here..."
      value={newReview.comment}
      onChange={(e) =>
        setNewReview((prev) => ({ ...prev, comment: e.target.value }))
      }
    />

    {/* Submit */}
    <button
      className="submit-review-btn"
      disabled={submitting}
      onClick={submitReview}
    >
      {submitting ? "Submitting..." : "Submit Review"}
    </button>
  </div>
</div>

          {/* INDIVIDUAL REVIEWS */}
          <div className="all-reviews-container">
            {reviews.map((r, i) => (
              <div className="review-card-block" key={i}>
                <div className="review-user">
                  <div className="avatar-circle">
                    {r.buyerName?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <h4>{r.buyerName}</h4>
                    <div className="review-stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={index}
                          className={index < r.rating ? "star filled" : "star"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="review-text">"{r.comment}"</p>

                {r.reply && (
                  <div className="seller-reply-box">
                    <strong>Seller Reply:</strong>
                    <p className="seller-reply-text">{r.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CATEGORY RECOMMENDED */}
          {recommended.length > 0 && (
            <div className="recommended-section">
              <h3 className="section-title">You May Also Like</h3>

              <div className="recommended-grid">
                {recommended.map((item) => (
                  <div
                    key={safeId(item)}
                    className="recommended-card"
                    onClick={() => viewProduct(item)}
                  >
                    <img
                      src={safeImage(item)}
                      className="recommended-img"
                      alt={item.name}
                    />

                    <p className="recommended-name">{item.name}</p>
                    <p className="recommended-price">₹{item.price}</p>

                    <div className="recommended-rating">
                      ★ {item.rating || "4.0"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ⭐ FBT SECTION */}
      {mlRecommended.length > 0 && (
        <div className="fbt-box">
          <h3 className="fbt-title">Frequently Bought Together</h3>

          <div className="fbt-row">
            {mlRecommended.slice(0, 3).map((item, idx) => {
              const mapped = {
                ...item,
                id: item.product_id,
                _id: item.product_id,
                image: item.image || item.image_path
              };

              return (
                <React.Fragment key={idx}>
                  <div className="fbt-item" onClick={() => viewProduct(mapped)}>
                    <img
                      src={mapped.image || "https://via.placeholder.com/200"}
                      className="fbt-img"
                    />

                    <p className="fbt-name">{mapped.name}</p>
                    <p className="fbt-price">₹{mapped.price}</p>
                  </div>

                  {idx < 2 && <div className="fbt-plus">+</div>}
                </React.Fragment>
              );
            })}

            <div className="fbt-summary">
              <p className="fbt-total">
                Total Price:{" "}
                <strong>
                  ₹
                  {mlRecommended
                    .slice(0, 3)
                    .reduce((sum, p) => sum + Number(p.price || 0), 0)}
                </strong>
              </p>

              <button
                className="fbt-add-btn"
                onClick={() => {
                  mlRecommended.slice(0, 3).forEach((p) => {
                    const mapped = {
                      ...p,
                      id: p.product_id,
                      _id: p.product_id,
                      image: p.image || p.image_path
                    };
                    addToCart(mapped);
                  });
                }}
              >
                🛒 Add All 3 to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ AI RECOMMENDED */}
      {mlRecommended.length > 0 && (
        <div className="ml-recommend-section">
          <h3 className="ml-title">✨Recommended For You</h3>

          <div className="ml-grid">
            {mlRecommended.map((item, index) => (
              <div key={index} className="ml-card">
                <div
                  onClick={() => viewProduct({ ...item, id: item.product_id })}
                >
                  <img
                    src={item.image || item.image_path || "https://via.placeholder.com/300"}
                    className="ml-img"
                  />
                  <p className="ml-name">{item.name}</p>
                  <p className="ml-price">₹{item.price}</p>
                  <p className="ml-carbon">🌱 {item.carbon_footprint} kg CO₂</p>
                </div>

                <button
                  className="ml-add-btn"
                  onClick={() =>
                    addToCart({
                      ...item,
                      _id: item.product_id,
                      image: item.image || item.image_path,
                    })
                  }
                >
                  🛒 Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetails;
