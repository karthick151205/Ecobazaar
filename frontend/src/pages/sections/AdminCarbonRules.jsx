import React, { useEffect, useState } from "react";
import "./AdminCarbonRules.css";
import axios from "axios";

export default function AdminCarbonRules() {
  const [rules, setRules] = useState({
    baseEcoPoints: 10,
    plasticMultiplier: 1.5,
    clothingMultiplier: 0.7,
    electronicsMultiplier: 2.0,
    accessoriesMultiplier: 0.9,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/carbon-rules", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setRules(res.data);
    } catch (err) {
      console.log("Failed to load rules (using defaults)");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRules((prev) => ({ ...prev, [name]: value }));
  };

  const saveRules = async () => {
    try {
      await axios.put(
        "http://localhost:8080/api/admin/carbon-rules",
        rules,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Carbon rules updated successfully!");
    } catch (err) {
      alert("❌ Failed to update rules");
      console.log(err);
    }
  };

  return (
    <div className="carbon-rules-page">
      <h2 className="section-title">🌱 Carbon Footprint Rules</h2>

      <div className="carbon-card">
        <h3>⚙ Carbon Scoring Adjustments</h3>
        <p className="desc">
          Modify how carbon footprint and eco points are calculated for products.
        </p>

        <div className="rules-grid">
          {/* Base Eco Points */}
          <div className="rule-box">
            <label>Base Eco Points</label>
            <input
              type="number"
              name="baseEcoPoints"
              value={rules.baseEcoPoints}
              onChange={handleChange}
            />
          </div>

          {/* Category Multipliers */}
          <div className="rule-box">
            <label>Plastic Category Multiplier</label>
            <input
              type="number"
              name="plasticMultiplier"
              value={rules.plasticMultiplier}
              step="0.1"
              onChange={handleChange}
            />
          </div>

          <div className="rule-box">
            <label>Clothing Category Multiplier</label>
            <input
              type="number"
              name="clothingMultiplier"
              value={rules.clothingMultiplier}
              step="0.1"
              onChange={handleChange}
            />
          </div>

          <div className="rule-box">
            <label>Electronics Category Multiplier</label>
            <input
              type="number"
              name="electronicsMultiplier"
              value={rules.electronicsMultiplier}
              step="0.1"
              onChange={handleChange}
            />
          </div>

          <div className="rule-box">
            <label>Accessories Category Multiplier</label>
            <input
              type="number"
              name="accessoriesMultiplier"
              value={rules.accessoriesMultiplier}
              step="0.1"
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="save-btn" onClick={saveRules}>
          💾 Save Carbon Rules
        </button>
      </div>
    </div>
  );
}
