import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BuyerDashboard.css";
import Footer from "../components/Footer";
import BuyerNavbar from "../components/BuyerNavbar";

/* Default Product Images */
import cottonBag from "../assets/cotton_bag.jpg";
import brush from "../assets/brush.webp";
import note from "../assets/notes.jpg";
import power from "../assets/powerbank.jpg";
import shirt from "../assets/shirt.jpeg";
import cover from "../assets/cover.webp";
import kurthi from "../assets/kurthi.webp";
import juteBag from "../assets/jutebag.webp";
import pbottle from "../assets/pbottle.jpg";
import pen from "../assets/pen.jpg";
import gift from "../assets/giftbox.jpeg";

/* Ads */
import ad1 from "../assets/ad1.jpg";
import ad2 from "../assets/ad2.jpg";
import ad3 from "../assets/ad2.webp";

/* Safe image resolver */
const getImage = (p) => {
  const raw = p?.image || p?.imageUrl || p?.img || p?.photo || "";
  if (!raw || raw.trim() === "") {
    return "https://picsum.photos/300/300?random=7";
  }
  return raw;
};

/* Default static products */
const defaultProducts = [
  { id: 1, name: "Organic Cotton Tote Bag", price: 499, image: cottonBag, rating: 4.3, category: "Accessories", ecoPoints: 0.1, description: "Durable cotton tote bag for everyday use." },
  { id: 2, name: "Bamboo Toothbrush Set", price: 299, image: brush, rating: 4.5, category: "Home", ecoPoints: 1, description: "Biodegradable bamboo toothbrushes reduce plastic waste." },
  { id: 3, name: "Recycled Notebook Set", price: 199, image: note, rating: 4.4, category: "Stationery", ecoPoints: 0.5, description: "Stylish notebooks made from recycled paper." },
  { id: 4, name: "Solar Power Bank", price: 899, image: power, rating: 4.6, category: "Electronics", ecoPoints: 2, description: "Charge using clean solar energy." },
  { id: 5, name: "Organic Men’s Shirt", price: 599, image: shirt, rating: 4.1, category: "Clothing", ecoPoints: 0.3, description: "Breathable organic cotton shirt." },
  { id: 6, name: "Eco Phone Cover", price: 249, image: cover, rating: 3.9, category: "Accessories", ecoPoints: 0.6, description: "Compostable phone cover." },
  { id: 7, name: "Organic Cotton Kurthi", price: 449, image: kurthi, rating: 4.2, category: "Clothing", ecoPoints: 0.5, description: "Soft sustainable kurthi." },
  { id: 8, name: "Handcrafted Jute Bag", price: 399, image: juteBag, rating: 4.3, category: "Accessories", ecoPoints: 0.4, description: "Handcrafted jute eco bag." },
  { id: 9, name: "Plant-Based Bottle", price: 299, image: pbottle, rating: 4.4, category: "Home", ecoPoints: 0.7, description: "Reusable eco bottle." },
  { id: 10, name: "Bamboo Pen Set", price: 149, image: pen, rating: 4.1, category: "Stationery", ecoPoints: 0.2, description: "Smooth bamboo writing pens." },
  { id: 11, name: "Eco Gift Box", price: 799, image: gift, rating: 4.7, category: "Home", ecoPoints: 0.1, description: "Sustainable eco gift box." },
];

function BuyerDashboard({ onOpenSignup }) {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);

  /* ✅ Dynamic Categories */
  const [categories, setCategories] = useState(["All"]);

  const scrollRef = useRef(null);
  const productsRef = useRef(null);
  const navigate = useNavigate();

  const getBuyer = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const buyer = getBuyer();
  const buyerId = buyer?.id || null;
  const buyerRole = buyer?.role ? buyer.role.toUpperCase() : "";

  const loadCartFromBackend = async () => {
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
    if (buyerId) loadCartFromBackend();
  }, [buyerId]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/products");
        const backendProducts = await res.json();

        const cleaned = backendProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: getImage(p),
          rating: 4.5,
          category: p.category,
          ecoPoints: p.ecoPoints,
          description: p.description,
          sellerId: p.sellerId,
        }));

        const combined = [...defaultProducts, ...cleaned];
        setAllProducts(combined);
        setRecommended(combined.sort(() => 0.5 - Math.random()).slice(0, 8));

        /* 🔥 Generate Dynamic Category List */
        const categoryList = ["All", ...new Set(combined.map((p) => p.category).filter(Boolean))];
        setCategories(categoryList);

      } catch {
        setAllProducts(defaultProducts);
        setRecommended(defaultProducts.slice(0, 8));

        const categoryList = ["All", ...new Set(defaultProducts.map((p) => p.category))];
        setCategories(categoryList);
      }
    };

    loadProducts();
  }, []);

  const ads = [ad1, ad2, ad3];
  const [currentAd, setCurrentAd] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const intv = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(intv);
  }, [paused]);

  const addToCart = async (product, e) => {
    e?.stopPropagation();

    if (!buyerId) {
      alert("Please login as a buyer to add items to cart.");
      return;
    }

    if (buyerRole !== "BUYER") {
      alert("You must be logged in as a BUYER.");
      return;
    }

    const payload = {
      buyerId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getImage(product),
      category: product.category,
      ecoPoints: product.ecoPoints || 0,
      sellerId: product.sellerId,
    };

    try {
      await fetch("http://localhost:8080/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      loadCartFromBackend();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      alert("Could not add to cart.");
    }
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewProduct = (product) =>
    navigate(`/product/${product.id}`, { state: { product } });

  return (
    <div className="buyer-container">
      <BuyerNavbar cartItems={cart} onSearch={setSearchQuery} />

      {/* Ads */}
      <div
        className="ad-carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="ad-track"
          style={{ transform: `translateX(-${currentAd * 100}%)` }}
        >
          {[...ads, ...ads].map((ad, i) => (
            <div className="ad-slide" key={i}>
              <img src={ad} alt="" className="ad-img" />
            </div>
          ))}
        </div>

        <div className="ad-caption">
          🌍 Go Green • Shop Sustainable • Save Earth 🌱
        </div>
      </div>

      {/* Recommended */}
      <div className="recommend-strip">
        <h3>🌟 Recommended for You</h3>
        <div className="recommend-scroll" ref={scrollRef}>
          {recommended.map((item) => (
            <div className="recommend-card-top" key={item.id}>
              <img src={getImage(item)} className="recommend-img-top" />
              <div className="recommend-info-top">
                <h4>{item.name}</h4>
                <p className="desc">{item.description}</p>
                <p>₹{item.price}</p>
                <div className="recommend-actions">
                  <button className="view-btn" onClick={() => viewProduct(item)}>
                    👁 View
                  </button>
                  <button className="add-btn" onClick={(e) => addToCart(item, e)}>
                    ➕ Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Banner */}
      <div className="seller-ad-banner" onClick={onOpenSignup}>
        <div className="seller-ad-left">
          <h2>🌟 Become an Eco Seller!</h2>
          <p>Start selling your eco-friendly products.</p>
          <button className="seller-ad-btn">🚀 Start Selling</button>
        </div>
        <div className="seller-ad-right">
          <img src="https://cdn-icons-png.flaticon.com/512/706/706830.png" />
        </div>
      </div>

      {/* Product Grid */}
      <section className="catalog" ref={productsRef}>
        <h1 className="section-title">🌿 Eco-Friendly Products</h1>

        {/* 🔥 DYNAMIC CATEGORY FILTER */}
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map((item) => (
            <div className="product-card" key={item.id}>
              <div className="product-img-wrap" onClick={() => viewProduct(item)}>
                <img src={getImage(item)} className="product-img" />
              </div>

              <div className="product-info">
                <h4>{item.name}</h4>
                <p className="desc">{item.description}</p>

                <div className="price-rating">
                  <p className="product-price">₹{item.price}</p>
                  <span className="rating-inline">⭐ {item.rating}</span>
                </div>

                <p className="carbon">♻️ Eco Points: {item.ecoPoints}</p>

                <button className="buy-btn" onClick={(e) => addToCart(item, e)}>
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showToast && <div className="toast-message">✅ Item added to cart!</div>}

      <Footer />
    </div>
  );
}

export default BuyerDashboard;
