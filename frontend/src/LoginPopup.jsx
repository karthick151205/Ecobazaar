import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages/AuthPopup.css";

function LoginPopup({ onClose, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [selectedRole, setSelectedRole] = useState("BUYER");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: selectedRole, // you are sending this to backend
        }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      // Expected shape:
      // {
      //   "id": "user123",
      //   "name": "Lakshitha",
      //   "email": "laks@gmail.com",
      //   "role": "BUYER",
      //   "token": "jwt-token"
      // }

      if (!data || !data.role || !data.email) {
        if (selectedRole === "SELLER") {
          alert("Login failed. Your seller account may not be approved yet.");
        } else {
          alert("Login failed. Check email or password.");
        }
        setLoading(false);
        return;
      }

      const { id, name, email, role, token } = data;
      const normalizedRole = (role || "").toUpperCase();

      // ⭐ Save a single "user" object for the whole app
      const userObj = {
        id,
        name,
        email,
        role: normalizedRole,
        token,
      };
      localStorage.setItem("user", JSON.stringify(userObj));

      // (Optional) keep your old keys if you still use them elsewhere
      localStorage.setItem("userId", id);
      localStorage.setItem("username", name);
      localStorage.setItem("email", email);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, name, email, role, token }));

      alert(`Welcome back, ${name}!`);
      onClose();

      // ⭐ Redirect using backend role (not selectedRole)
      if (normalizedRole === "BUYER") navigate("/BuyerDashboard");
      else if (normalizedRole === "SELLER") navigate("/SellerDashboard");
      else if (normalizedRole === "ADMIN") navigate("/AdminDashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-popup">
        <span className="close-icon" onClick={onClose}>
          ✖
        </span>

        <h2>
          Welcome to <span className="highlight">EcoBazaarX</span> 🌿
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-input"
          />

          {/* 🔥 Role Selector */}
          <select
            className="auth-input"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <span onClick={onSwitchToSignup}>Sign up here</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPopup;
