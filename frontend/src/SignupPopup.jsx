import React, { useState } from "react";
import "./pages/AuthPopup.css";
import axios from "axios"; // <-- IMPORT AXIOS

function SignupPopup({ onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [role, setRole] = useState("BUYER");
  // We add this to show errors from the server
  const [error, setError] = useState(""); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- THIS IS THE UPDATED SUBMIT FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear old errors

    try {
      // Create the data object to send
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
      };

      // Make the API call
      const response = await axios.post(
        "http://localhost:3080/api/auth/signup",
        signupData
      );

      // It worked!
      alert(response.data); // "User registered successfully!"
      onSwitchToLogin(); // Switch to login popup
    } catch (err) {
      // It failed
      if (err.response) {
        // The server sent back an error (e.g., "Email is already taken!")
        setError(err.response.data);
        alert(err.response.data);
      } else {
        // Other error (e.g., network down)
        setError("Signup failed. Please try again.");
        alert("Signup failed. Please try again.");
      }
    }
  };
  // --- END OF UPDATE ---

  return (
    <div className="auth-overlay">
      <div className="auth-popup">
        {/* ✖ Close Icon (Your friend's code) */}
        <span className="close-icon" onClick={onClose}>
          ✖
        </span>

        <h2>Create Your EcoBazaarX Account 🌿</h2>
        
        {/* We use our new handleSubmit function here */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* All your friend's inputs are here */}
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="auth-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-input"
          />
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

          {/* This will show an error if one exists */}
          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn">
            Sign Up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={onSwitchToLogin}>Login here</span>
        </p>

        {/* 🌍 Social signup buttons (Your friend's code) */}
        <div className="social-signup">
          <p>Or sign up with:</p>
          <div className="social-buttons">
            <a
              href="http://localhost:3080/oauth2/authorization/google"
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