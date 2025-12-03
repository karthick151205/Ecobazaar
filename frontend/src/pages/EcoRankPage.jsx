import React, { useEffect, useState } from "react";
import BuyerNavbar from "../components/BuyerNavbar";
import Footer from "../components/Footer";
import "./EcoRankPage.css";

function EcoRankPage() {
  const [ecoPoints, setEcoPoints] = useState(0);
  const [ecoRank, setEcoRank] = useState("Eco Beginner");
  const [progress, setProgress] = useState(0);
  const [offer, setOffer] = useState("");

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const buyerId = user?.id || null;
  const token = localStorage.getItem("token");

  // ⭐ HIGH RANGE ECO RANKS
  const ranks = [
    {
      name: "Eco Beginner",
      min: 0,
      max: 500,
      color: "#a7f3d0",
      offer: "Start your green journey! 🌱 Earn 10% off your first eco purchase.",
    },
    {
      name: "Nature Nurturer",
      min: 500,
      max: 1500,
      color: "#6ee7b7",
      offer: "Great work! 🌿 Free shipping on all eco products this month!",
    },
    {
      name: "Green Guardian",
      min: 1500,
      max: 3000,
      color: "#34d399",
      offer: "You're inspiring others! 🌏 Get 15% off sustainable clothing.",
    },
    {
      name: "Eco Champion",
      min: 3000,
      max: Infinity,
      color: "#059669",
      offer: "🏆 Planet protector! Enjoy 25% off eco-gadgets + priority shipping.",
    },
  ];

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
      updateRank(total);
    } catch (err) {
      console.error("EcoRank load error:", err);
    }
  };

  const updateRank = (points) => {
    const currentRank =
      ranks.find((r) => points >= r.min && points < r.max) || ranks[0];

    setEcoRank(currentRank.name);
    setOffer(currentRank.offer);

    if (currentRank.max === Infinity) {
      setProgress(100);
    } else {
      const progressValue =
        ((points - currentRank.min) / (currentRank.max - currentRank.min)) * 100;

      setProgress(Math.max(0, Math.min(100, progressValue)));
    }
  };

  useEffect(() => {
    loadEcoPoints();
  }, []);

  useEffect(() => {
    const refreshListener = () => loadEcoPoints();

    window.addEventListener("storage", refreshListener);
    return () => window.removeEventListener("storage", refreshListener);
  }, []);

  return (
    <div className="eco-rank-container">
      <BuyerNavbar />

      <div className="rank-content">
        <h2>🌿 Your Eco Rank</h2>
        <p className="rank-subtext">
          Earn more Eco Points by purchasing sustainable products!
        </p>

        <div className="current-rank-card">
          <h3>{ecoRank}</h3>
          <p className="points">{ecoPoints.toFixed(1)} EP</p>

          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                background: ranks.find((r) => r.name === ecoRank)?.color,
              }}
            ></div>
          </div>

          <p className="progress-text">
            {progress < 100
              ? `Progress to next rank: ${progress.toFixed(1)}%`
              : "🎉 You've reached the top rank!"}
          </p>

          <div className="offer-card">
            <h4>🎁 Special Perk for {ecoRank}</h4>
            <p>{offer}</p>
          </div>
        </div>

        <div className="rank-table">
          <h3>Eco Rank Levels & Rewards</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Points Range</th>
                <th>Exclusive Offer</th>
              </tr>
            </thead>

            <tbody>
              {ranks.map((r, index) => (
                <tr
                  key={index}
                  className={r.name === ecoRank ? "active-rank" : ""}
                >
                  <td>{r.name}</td>
                  <td>
                    {r.max === Infinity
                      ? `${r.min}+`
                      : `${r.min} - ${r.max - 1}`}{" "}
                    EP
                  </td>
                  <td>{r.offer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EcoRankPage;
