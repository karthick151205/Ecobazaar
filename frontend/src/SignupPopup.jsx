import React, { useState } from "react";
import "./pages/AuthPopup.css";

function SignupPopup({ onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [role, setRole] = useState("BUYER"); // default role
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Handle Signup API Call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prevent ADMIN signup from frontend
    if (role === "ADMIN") {
      alert("❌ Admin account cannot be created.\nAdmin login is fixed by system.");
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role, // BUYER or SELLER
    };

    try {
      const response = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (response.ok) {
        alert(`🎉 ${text}`);
        onClose(); // Close popup after signup
      } else {
        alert(`⚠️ Signup failed: ${text}`);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-popup">

        {/* Close Button */}
        <span className="close-icon" onClick={onClose}>
          ✖
        </span>

        <h2>Create Your EcoBazaarX Account 🌿</h2>
        <p className="subtitle">Join the green revolution.</p>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="auth-input"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-input"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-input"
          />

          {/* 🌿 Role Selection */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="auth-input"
          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Signup Button */}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={onSwitchToLogin}>Login here</span>
        </p>

        {/* Social Signup */}
        <div className="social-signup">
          <p>Or sign up with:</p>
          <div className="social-buttons">
            
            <a
              href="https://accounts.google.com/o/oauth2/auth"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="Google"
                className="social-icon"
              />
              Google
            </a>

            <a
              href="https://www.facebook.com/v11.0/dialog/oauth"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                alt="Facebook"
                className="social-icon"
              />
              Facebook
            </a>

            <a
              href="https://appleid.apple.com/auth/authorize"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg"
                alt="Apple"
                className="social-icon"
              />
              Apple
            </a>

          </div>
        </div>

      </div>
    </div>
  );
}

export default SignupPopup;
