import React, { useState, useEffect } from "react";
import SellerNavbar from "../components/SellerNavbar";
import "./SellerProfile.css";
import defaultProfile from "../assets/default-profile.jpg";
import Footer from "../components/Footer";

function SellerProfile() {
  // Logged-in user details
  const sellerEmail = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  const [seller, setSeller] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [preview, setPreview] = useState(defaultProfile);

  const encodedEmail = encodeURIComponent(sellerEmail);

  // =============================================
  // FETCH USER PROFILE
  // =============================================
  useEffect(() => {
    fetch(`http://localhost:8080/api/user/profile/${encodedEmail}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => {
        setSeller(data);
        setUpdatedData(data);
        setPreview(data.profileImg || defaultProfile);
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, []);

  if (!seller) {
    return <div className="loading">Loading profile...</div>;
  }

  // =============================================
  // INPUT CHANGE
  // =============================================
  const handleChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
  };

  // =============================================
  // IMAGE UPLOAD
  // =============================================
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

  // =============================================
  // REMOVE PHOTO
  // =============================================
  const removePhoto = () => {
    setPreview(defaultProfile);
    setUpdatedData({ ...updatedData, profileImg: null });
  };

  // =============================================
  // SAVE PROFILE
  // =============================================
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
      setSeller(updated);
      setEditing(false);
      alert("✔ Profile updated!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update. Server error.");
    }
  };

  return (
    <div className="seller-container">
      <SellerNavbar />

      <div className="profile-section">
        <div className="profile-card">

          {/* PROFILE IMAGE */}
          <div className="profile-image">
            <img src={preview || defaultProfile} alt="Seller" />

            {editing && (
              <div className="photo-actions">
                {/* Change Photo */}
                <button
                  className="upload-label"
                  onClick={() =>
                    document.getElementById("upload-profile").click()
                  }
                >
                  Change Photo
                </button>

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="upload-profile"
                  accept=".jpg, .jpeg, .png, .webp"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />

                {/* Remove Photo */}
                <button className="remove-photo-btn" onClick={removePhoto}>
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* PROFILE DETAILS */}
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
                <p>{seller.name}</p>
              )}
            </div>

            <div className="info-row">
              <label>Email:</label>
              <p>{seller.email}</p>
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
                <p>{seller.phone || "Not Provided"}</p>
              )}
            </div>

            <div className="info-row">
              <label>Store Name:</label>
              {editing ? (
                <input
                  type="text"
                  name="storeName"
                  value={updatedData.storeName || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{seller.storeName || "Not Provided"}</p>
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
                <p>{seller.address || "Not Provided"}</p>
              )}
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
                      setPreview(seller.profileImg || defaultProfile);
                      setUpdatedData(seller);
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

      <Footer />
    </div>
  );
}

export default SellerProfile;
