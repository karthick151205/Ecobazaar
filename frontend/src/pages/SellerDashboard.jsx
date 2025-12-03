import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";
import SellerNavbar from "../components/SellerNavbar";
import Footer from "../components/Footer";
import SellerReviewItem from "../components/SellerReviewItem";

// Ads
import ad1 from "../assets/seller_ad1.avif";
import ad2 from "../assets/seller_ad2.jpeg";
import ad3 from "../assets/seller_ad3.avif";

const SellerDashboard = () => {
  const navigate = useNavigate();

  // ---------------- USER ----------------
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const sellerId = user?.id || null;
  const token = localStorage.getItem("token");

  // ---------------- STATE ----------------
  const [rawProducts, setRawProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [sales, setSales] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [topProduct, setTopProduct] = useState(null);

  const [currentAd, setCurrentAd] = useState(0);
  const [latestToast, setLatestToast] = useState(null);

  const ads = [ad1, ad2, ad3];
  const toastTimerRef = useRef(null);
  const audioRef = useRef(null);
  const prevOrdersCountRef = useRef(0);

  // =============== LOAD RAW PRODUCTS ===============
  const loadRawProducts = async () => {
    if (!sellerId) return [];

    try {
      const res = await fetch(
        `http://localhost:8080/api/seller/${sellerId}/products`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Product load error:", err);
      return [];
    }
  };

  // =============== LOAD ORDERS ===============
  const loadOrders = async () => {
    if (!sellerId) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/orders/seller/${sellerId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Orders load error:", err);
    }
  };

  // =============== LOAD REVIEWS ===============
  const loadReviews = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/seller/${sellerId}/reviews`
      );
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Review load error:", err);
    }
  };

  // =============== RECALCULATE STOCK + SOLD ===============
  const recalcProducts = () => {
    if (!rawProducts.length) return;

    const sellerItems = orders.flatMap((order) =>
      (order.items || []).filter((item) => item.sellerId === sellerId)
    );

    const updated = rawProducts.map((prod) => {
      const soldItems = sellerItems.filter((i) => i.productId === prod.id);
      const sold = soldItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
      const updatedStock = prod.stock - sold;

      return {
        ...prod,
        sold,
        stock: updatedStock < 0 ? 0 : updatedStock,
      };
    });

    setProducts(updated);

    const totalRevenue = sellerItems.reduce(
      (s, i) => s + i.price * i.quantity,
      0
    );
    const totalSold = sellerItems.reduce((s, i) => s + i.quantity, 0);
    const lowStock = updated.filter((p) => p.stock < 5).length;

    const top =
      updated.length > 0
        ? updated.reduce((a, b) => (a.sold > b.sold ? a : b))
        : null;

    setRevenue(totalRevenue);
    setSales(totalSold);
    setLowStockCount(lowStock);
    setTopProduct(top);
    setNewOrdersCount(
      orders.filter((o) =>
        ["NEW", "PENDING", "CONFIRMED"].includes(o.status)
      ).length
    );
    setCancelledCount(
      orders.filter((o) =>
        ["CANCELLED", "CANCELED"].includes(o.status)
      ).length
    );
  };

  // =============== INITIAL LOAD ===============
  useEffect(() => {
    (async () => {
      const raw = await loadRawProducts();
      setRawProducts(raw);
      await loadOrders();
      await loadReviews();
    })();
  }, []);

  // =============== RECALCULATE WHEN CHANGED ===============
  useEffect(() => {
    recalcProducts();
  }, [orders, rawProducts]);

  // =============== ROTATE ADS ===============
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd((p) => (p + 1) % ads.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // =============== NEW ORDER SOUND + TOAST ===============
  useEffect(() => {
    if (prevOrdersCountRef.current === 0) {
      prevOrdersCountRef.current = orders.length;
      return;
    }

    if (orders.length > prevOrdersCountRef.current) {
      const audio = audioRef.current;
      audio?.play().catch(() => {});

      const latestOrder = orders[0];
      const firstItem = latestOrder.items?.[0];

      if (firstItem) {
        setLatestToast({
          productName: firstItem.productName,
          image: firstItem.imageUrl,
        });

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

        toastTimerRef.current = setTimeout(
          () => setLatestToast(null),
          5000
        );
      }
    }

    prevOrdersCountRef.current = orders.length;
  }, [orders]);

  // =============== AUTH GUARD ===============
  if (!user) {
    return (
      <div className="seller-dashboard-container">
        <SellerNavbar />
        <div className="dashboard-wrapper">
          <p>Please login as seller.</p>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
        <Footer />
      </div>
    );
  }

  // ============================================================
  //                     JSX UI SECTION
  // ============================================================

  return (
    <div className="seller-dashboard-container">
      <SellerNavbar />
      <audio ref={audioRef} src="/audio/new_order.mp3" preload="auto" />

      <div className="dashboard-wrapper">
        {/* SUMMARY */}
        <div className="overview-section">
          <div className="stat-card green">
            <h3>Total Items Sold</h3>
            <p>{sales}</p>
          </div>

          <div className="stat-card blue">
            <h3>Total Revenue</h3>
            <p>₹{revenue.toLocaleString()}</p>
          </div>

          <div className="stat-card orange">
            <h3>Active Orders</h3>
            <p>{newOrdersCount}</p>
          </div>

          <div className="stat-card violet">
            <h3>Cancelled</h3>
            <p>{cancelledCount}</p>
          </div>

          <div className="stat-card red">
            <h3>Low Stock</h3>
            <p>{lowStockCount}</p>
          </div>
        </div>

        {/* TOP PRODUCT */}
        {topProduct && (
          <div className="top-product-highlight">
            <h2>🏆 Top Product</h2>

            <div className="top-product-card">
              <img src={topProduct.image} alt={topProduct.name} />

              <div>
                <h3>{topProduct.name}</h3>
                <p>Sold: {topProduct.sold}</p>
                <p>
                  Revenue: ₹
                  {(topProduct.price * topProduct.sold).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ADS */}
        <div className="seller-ad-banner">
          <img src={ads[currentAd]} alt="Eco Ad" />
          <div className="ad-caption">Boost Your Sales 🌿</div>
        </div>

        {/* PRODUCTS */}
        <section className="product-section3">
          <h1>🧺 My Products</h1>

          {products.length === 0 ? (
            <p>No Products Found</p>
          ) : (
            <div className="product-grid3">
              {products.map((p) => (
                <div className="product-card3" key={p.id}>
                  <div className="product-status-row">
                    {p.stock <= 0 && (
                      <span className="badge badge-out">Out</span>
                    )}
                    {p.stock > 0 && p.stock < 5 && (
                      <span className="badge badge-low">Low</span>
                    )}
                  </div>

                  <img src={p.image} alt={p.name} className="product-img" />

                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p>₹{p.price}</p>
                    <p>Stock: {p.stock}</p>
                    <p>Sold: {p.sold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* REVIEWS (FIXED) */}
        <section className="reviews-section">
          <h2>⭐ Recent Reviews</h2>

          {reviews.length === 0 ? (
            <p>No Reviews Yet</p>
          ) : (
            <div className="review-list">
              {reviews.map((r) => {
                const product = products.find((p) => p.id === r.productId);

                return (
                  <SellerReviewItem
                    key={r.id}
                    review={r}
                    product={product}
                    updateReview={(updated) =>
                      setReviews((prev) =>
                        prev.map((rv) =>
                          rv.id === updated.id ? updated : rv
                        )
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Footer />

      {/* ORDER TOAST */}
      {latestToast && (
        <div className="order-toast">
          <img src={latestToast.image} alt={latestToast.productName} />
          <strong>🛍 New Order: {latestToast.productName}</strong>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
