import React, { useState, useEffect } from "react";
import BuyerNavbar from "../components/BuyerNavbar";
import "./BuyerProfile.css";
import defaultProfile from "../assets/default-profile.jpg";
import Footer from "../components/Footer";

function BuyerProfile() {
  const buyer = JSON.parse(localStorage.getItem("user")); // Logged-in user
  const buyerId = buyer?.id;
  const buyerEmail = buyer?.email;
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [preview, setPreview] = useState(defaultProfile);

  const [ecoPoints, setEcoPoints] = useState(0); // ⭐ REAL EcoPoints

  const encodedEmail = encodeURIComponent(buyerEmail);

  // ==================================================
  // 1️⃣ FETCH BUYER PROFILE
  // ==================================================
  useEffect(() => {
    fetch(`http://localhost:8080/api/user/profile/${encodedEmail}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setUpdatedData(data);
        setPreview(data.profileImg || defaultProfile);
      })
      .catch((err) => console.error("Profile load error:", err));
  }, []);

  // ==================================================
  // 2️⃣ LOAD ECO POINTS FROM BUYER ORDERS (LIVE)
  // ==================================================
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

      // ⭐ Total CarbonPoints for all orders
      const total = orders.reduce(
        (sum, order) => sum + (order.totalCarbonPoints || 0),
        0
      );

      setEcoPoints(total);

      // Push to localStorage for navbar
      localStorage.setItem("ecoPoints", total);
    } catch (err) {
      console.error("Eco Points loading error:", err);
    }
  };

  useEffect(() => {
    loadEcoPoints();
  }, []);

  if (!profile) return <div className="loading">Loading profile...</div>;

  // ==================================================
  // 3️⃣ ECO RANK SYSTEM
  // ==================================================
  const ranks = [
    { name: "Eco Beginner", min: 0, max: 500, color: "#a7f3d0" },
    { name: "Nature Nurturer", min: 500, max: 1500, color: "#6ee7b7" },
    { name: "Green Guardian", min: 1500, max: 3000, color: "#34d399" },
    { name: "Eco Champion", min: 3000, max: Infinity, color: "#059669" },
  ];

  const getEcoRank = (points) =>
    ranks.find((r) => points >= r.min && points < r.max) || ranks[0];

  const ecoRank = getEcoRank(ecoPoints);

  // ==================================================
  // HANDLE INPUT CHANGES
  // ==================================================
  const handleChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
  };

  // ==================================================
  // IMAGE UPLOAD
  // ==================================================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setUpdatedData({ ...updatedData, profileImg: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Upload JPG, PNG, or WEBP only.");
    }
  };

  const removePhoto = () => {
    setPreview(defaultProfile);
    setUpdatedData({ ...updatedData, profileImg: null });
  };

  // ==================================================
  // SAVE PROFILE
  // ==================================================
  const saveProfile = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/user/profile/${encodedEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const updated = await res.json();
      setProfile(updated);
      setEditing(false);

      alert("✔ Profile updated!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile.");
    }
  };

  return (
    <div className="buyer-container">
      <BuyerNavbar ecoPoints={ecoPoints} />

      <div className="profile-section">
        <div className="profile-card">
          <div
            className="eco-rank-badge top-right"
            style={{ background: ecoRank.color }}
          >
            {ecoRank.name}
          </div>

          <div className="profile-image">
            <img src={preview} alt="Buyer" />
            {editing && (
              <div className="photo-actions">
                <button
                  className="upload-label"
                  onClick={() => document.getElementById("buyer-upload").click()}
                >
                  Change Photo
                </button>

                <input
                  type="file"
                  id="buyer-upload"
                  accept=".jpg, .jpeg, .png, .webp"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />

                <button className="remove-photo-btn" onClick={removePhoto}>
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          <div className="profile-details">
            <div className="info-row">
              <label>Name:</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={updatedData.name || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.name}</p>
              )}
            </div>

            <div className="info-row">
              <label>Email:</label>
              <p>{profile.email}</p>
            </div>

            <div className="info-row">
              <label>Phone:</label>
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={updatedData.phone || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.phone || "Not Provided"}</p>
              )}
            </div>

            <div className="info-row">
              <label>Address:</label>
              {editing ? (
                <textarea
                  name="address"
                  rows="2"
                  value={updatedData.address || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.address || "Not Provided"}</p>
              )}
            </div>

            <div className="info-row">
              <label>Eco Points:</label>
              <p className="eco-points">♻ {ecoPoints.toFixed(1)} EP</p>
            </div>

            <div className="profile-actions">
              {editing ? (
                <>
                  <button className="save-btn" onClick={saveProfile}>
                    💾 Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setEditing(false);
                      setPreview(profile.profileImg || defaultProfile);
                      setUpdatedData(profile);
                    }}
                  >
                    ❌ Cancel
                  </button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ⭐⭐ ADDED — USER HELP REQUEST + ADMIN REPLY SECTION */}
      <div className="help-section">
        <h2 className="help-title">📨 Support Replies</h2>

        {buyerEmail && (
          <HelpReplies email={buyerEmail} token={token} />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default BuyerProfile;

/* ⭐⭐⭐ SMALL COMPONENT TO LOAD USER HELP REQUESTS + REPLIES */
function HelpReplies({ email, token }) {
  const [helpList, setHelpList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/admin/help/user/${encodeURIComponent(email)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        setHelpList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email, token]);

  if (loading) return <p className="help-loading">Loading help messages...</p>;

  return (
    <div className="help-reply-container">
      {helpList.length === 0 ? (
        <p className="no-help">No help messages yet.</p>
      ) : (
        helpList.map((item) => (
          <div key={item.id} className="help-card-user">
            <p><strong>Your Message:</strong> {item.message}</p>

            {item.reply ? (
              <p className="admin-reply">
                <strong>Admin Reply:</strong> {item.reply}
              </p>
            ) : (
              <p className="pending-reply">⏳ Waiting for admin reply…</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
