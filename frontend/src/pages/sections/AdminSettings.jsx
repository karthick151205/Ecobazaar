import React, { useState, useEffect } from "react";
import "./AdminSettings.css";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);

  const [siteName, setSiteName] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowUsers, setAllowUsers] = useState(true);
  const [allowSellers, setAllowSellers] = useState(true);
  const [ecoPointsEnabled, setEcoPointsEnabled] = useState(true);
  const [ecoRate, setEcoRate] = useState(5);
  const [codEnabled, setCodEnabled] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(40);
  const [freeDeliveryMin, setFreeDeliveryMin] = useState(500);

  /* ============================================================
     ⭐ 1️⃣ LOAD SETTINGS FROM BACKEND
  ============================================================ */
  useEffect(() => {
    fetch("http://localhost:8080/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName);
        setMaintenanceMode(data.maintenanceMode);
        setAllowUsers(data.allowUsers);
        setAllowSellers(data.allowSellers);
        setEcoPointsEnabled(data.ecoPointsEnabled);
        setEcoRate(data.ecoRate);
        setCodEnabled(data.codEnabled);
        setDeliveryCharge(data.deliveryCharge);
        setFreeDeliveryMin(data.freeDeliveryMin);
      })
      .catch(() => alert("⚠ Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  /* ============================================================
     ⭐ 2️⃣ SAVE SETTINGS TO BACKEND
  ============================================================ */
  const handleSave = async () => {
    const settingsPayload = {
      siteName,
      maintenanceMode,
      allowUsers,
      allowSellers,
      ecoPointsEnabled,
      ecoRate,
      codEnabled,
      deliveryCharge,
      freeDeliveryMin,
    };

    try {
      const res = await fetch("http://localhost:8080/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsPayload),
      });

      if (!res.ok) throw new Error();

      alert("✅ Settings saved successfully!");
    } catch {
      alert("❌ Failed to save settings!");
    }
  };

  if (loading) return <p className="loading">Loading settings...</p>;

  return (
    <div className="admin-settings-container">
      <h2 className="section-title">⚙ Platform Settings</h2>

      <div className="settings-box">

        {/* SITE NAME */}
        <div className="setting-row">
          <div className="setting-label">
            <span>🛍 Site Name</span>
            <small>Shown on navbar, emails, and title.</small>
          </div>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>

        {/* MAINTENANCE MODE */}
        <div className="setting-row">
          <div className="setting-label">
            <span>🛠 Maintenance Mode</span>
            <small>Show “Under Maintenance” to users.</small>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={() => setMaintenanceMode(!maintenanceMode)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* USER REGISTRATION */}
        <div className="setting-row">
          <div className="setting-label">
            <span>👥 Allow New Users</span>
            <small>Enable/disable buyer registrations.</small>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={allowUsers}
              onChange={() => setAllowUsers(!allowUsers)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* SELLER REGISTRATION */}
        <div className="setting-row">
          <div className="setting-label">
            <span>🏪 Allow New Sellers</span>
            <small>Control seller onboarding.</small>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={allowSellers}
              onChange={() => setAllowSellers(!allowSellers)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* ECO POINTS */}
        <div className="setting-row">
          <div className="setting-label">
            <span>🌿 Enable Eco Points</span>
            <small>Reward eco-friendly shopping.</small>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={ecoPointsEnabled}
              onChange={() => setEcoPointsEnabled(!ecoPointsEnabled)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {ecoPointsEnabled && (
          <div className="setting-row nested">
            <div className="setting-label">
              <span>📈 Points per ₹100</span>
              <small>Set your eco reward rate.</small>
            </div>
            <input
              type="number"
              min="1"
              max="50"
              value={ecoRate}
              onChange={(e) => setEcoRate(e.target.value)}
            />
          </div>
        )}

        {/* COD */}
        <div className="setting-row">
          <div className="setting-label">
            <span>💵 Cash on Delivery</span>
            <small>Toggle COD option.</small>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={() => setCodEnabled(!codEnabled)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* DELIVERY CHARGE */}
        <div className="setting-row">
          <div className="setting-label">
            <span>🚚 Delivery Charge (₹)</span>
            <small>Flat fee for each order.</small>
          </div>
          <input
            type="number"
            min="0"
            value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(e.target.value)}
          />
        </div>

        {/* FREE DELIVERY MINIMUM */}
        <div className="setting-row">
          <div className="setting-label">
            <span>🎁 Free Delivery Above (₹)</span>
            <small>Automatic free shipping.</small>
          </div>
          <input
            type="number"
            min="0"
            value={freeDeliveryMin}
            onChange={(e) => setFreeDeliveryMin(e.target.value)}
          />
        </div>

        <button className="save-settings-btn" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}
