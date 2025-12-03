import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BuyerNavbar.css";
import logo from "../assets/logo.png";
import {
  FaShoppingCart,
  FaUserCircle,
  FaHome,
  FaClipboardList,
  FaSignOutAlt,
  FaUser,
  FaLeaf,
  FaSearch,
} from "react-icons/fa";

// ⭐ Import HelpPopup
import HelpPopup from "../components/HelpPopup";

// 🌿 Demo products (for search)
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

const PRODUCTS = [
  { id: 1, name: "Eco Cotton Bag", image: cottonBag, price: 210 },
  { id: 2, name: "Bamboo Brush", image: brush, price: 99 },
  { id: 3, name: "Recycled Notebook", image: note, price: 85 },
  { id: 4, name: "Solar Power Bank", image: power, price: 699 },
  { id: 5, name: "Organic Cotton Shirt", image: shirt, price: 450 },
  { id: 6, name: "Eco Phone Cover", image: cover, price: 163 },
  { id: 7, name: "Organic Kurthi", image: kurthi, price: 335 },
  { id: 8, name: "Jute Shopping Bag", image: juteBag, price: 270 },
  { id: 9, name: "Plant-Based Bottle", image: pbottle, price: 199 },
  { id: 10, name: "Recycled Pen Set", image: pen, price: 50 },
  { id: 11, name: "Eco Gift Box", image: gift, price: 320 },
];

function BuyerNavbar({ onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ecoDropdownOpen, setEcoDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ecoPoints, setEcoPoints] = useState(0);
  const [ecoRank, setEcoRank] = useState("Eco Beginner");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ Help Popup State
  const [showHelpPopup, setShowHelpPopup] = useState(false);

  /* ----------------------------------------------------
     ⭐ Load Eco Points from backend
  ---------------------------------------------------- */
  useEffect(() => {
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem("user"));
      } catch {
        return null;
      }
    })();

    const buyerId = user?.id;
    const token = localStorage.getItem("token");

    if (!buyerId) return;

    const getRank = (points) => {
      if (points >= 200) return "Eco Champion";
      if (points >= 100) return "Green Guardian";
      if (points >= 50) return "Nature Nurturer";
      return "Eco Beginner";
    };

    const loadEcoPoints = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/orders/buyer/${buyerId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const orders = await res.json();
        if (!Array.isArray(orders)) return;

        const totalPoints = orders.reduce(
          (sum, order) => sum + (order.totalCarbonPoints || 0),
          0
        );

        setEcoPoints(totalPoints);
        setEcoRank(getRank(totalPoints));
      } catch (err) {
        console.error("Eco points fetch failed:", err);
      }
    };

    loadEcoPoints();
  }, []);

  /* ---------------------------------------------------- */

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      alert("Logged out successfully!");
      navigate("/");
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (!searchTerm.trim()) return;
      if (onSearch) onSearch(searchTerm.trim());
      else navigate("/BuyerDashboard", { state: { query: searchTerm.trim() } });
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const matches = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
    setSuggestions(matches);
  }, [searchTerm]);

  const handleSelectProduct = (product) => {
    navigate("/product/:id", { state: { product } });
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleProfile = () => {
    setProfileOpen(false);
    setTimeout(() => navigate("/buyer/profile"), 150);
  };

  return (
    <>
      {/* Overlay */}
      {(menuOpen || profileOpen || ecoDropdownOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setMenuOpen(false);
            setProfileOpen(false);
            setEcoDropdownOpen(false);
          }}
        />
      )}

      <nav className="buyer-navbar">
        <div className="buyer-left" onClick={() => navigate("/BuyerDashboard")}>
          <div className="logo">
            <img src={logo} alt="EcoBazaar Logo" className="logo-img" />
            <h3>EcoBazaar - Shopping Mart 🌿</h3>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder={
              location.pathname.includes("orders")
                ? "Search your orders..."
                : "Search eco-friendly products..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
          <FaSearch className="search-icon" onClick={handleSearch} />

          {suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="suggestion-item"
                  onClick={() => handleSelectProduct(item)}
                >
                  <img src={item.image} alt={item.name} />
                  <span>
                    {item.name} — ₹{item.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="buyer-actions">
          <div className="buyer-nav-links">
            <a onClick={() => navigate("/BuyerDashboard")}>
              <FaHome /> Home
            </a>

            <a onClick={() => navigate("/buyer/orders")}>
              <FaClipboardList /> My Orders
            </a>

            <a onClick={() => navigate("/cart")}>
              <FaShoppingCart /> Cart
            </a>

            {/* Eco Rank */}
            <div
              className="eco-dropdown-btn"
              onClick={() => setEcoDropdownOpen(!ecoDropdownOpen)}
            >
              <a>
                <FaLeaf /> {ecoPoints.toFixed(1)} EP
              </a>
            </div>

            {ecoDropdownOpen && (
              <div className="eco-dropdown">
                <p>
                  <strong>Rank:</strong> {ecoRank}
                </p>
                <p>
                  <strong>Points:</strong> {ecoPoints.toFixed(1)} EP
                </p>
                <button onClick={() => navigate("/EcoRankPage")}>
                  View Eco Rank
                </button>
              </div>
            )}

            {/* Profile Dropdown */}
            <div
              className="profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <FaUserCircle size={24} />
            </div>

            {profileOpen && (
              <div className="profile-dropdown">
                <p onClick={handleProfile}>
                  <FaUser /> My Profile
                </p>

                {/* ⭐ NEW HELP BUTTON */}
                <p
                  onClick={() => {
                    setProfileOpen(false);
                    setShowHelpPopup(true);
                  }}
                >
                  ❓ Help & Support
                </p>

                <p className="logout" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </p>
              </div>
            )}
          </div>

          <div
            className="buyer-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`buyer-menu ${menuOpen ? "open" : ""}`}>
        <span className="close-btn" onClick={() => setMenuOpen(false)}>
          ✕
        </span>

        <a
          onClick={() => {
            navigate("/BuyerDashboard");
            setMenuOpen(false);
          }}
        >
          <FaHome /> Home
        </a>

        <a
          onClick={() => {
            navigate("/BuyerOrders");
            setMenuOpen(false);
          }}
        >
          <FaClipboardList /> My Orders
        </a>

        <a
          onClick={() => {
            navigate("/cart");
            setMenuOpen(false);
          }}
        >
          <FaShoppingCart /> Cart
        </a>

        <a
          onClick={() => {
            navigate("/EcoRankPage");
            setMenuOpen(false);
          }}
        >
          <FaLeaf /> {ecoPoints.toFixed(1)} EP ({ecoRank})
        </a>

        <a
          onClick={() => {
            setMenuOpen(false);
            handleProfile();
          }}
        >
          <FaUser /> My Profile
        </a>

        {/* ⭐ Help inside mobile menu */}
        <a
          onClick={() => {
            setMenuOpen(false);
            setShowHelpPopup(true);
          }}
        >
          ❓ Help & Support
        </a>

        <a className="logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </a>
      </div>

      {/* ⭐ SHOW HELPPopup */}
      {showHelpPopup && <HelpPopup onClose={() => setShowHelpPopup(false)} />}
    </>
  );
}

export default BuyerNavbar;
