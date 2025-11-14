import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages/AuthPopup.css";
import axios from "axios"; // <-- IMPORT AXIOS

function LoginPopup({ onClose, onSwitchToSignup }) {
  const [useOtp, setUseOtp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [role, setRole] = useState("BUYER"); // This is just for the dropdown
  const [error, setError] = useState(""); // For error messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔢 Simulate sending OTP (Your friend's code, unchanged)
  const sendOtp = () => {
    if (!formData.phone || formData.phone.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }
    setOtpSent(true);
    alert(`OTP sent to ${formData.phone}`);
  };

  // --- THIS IS THE UPDATED SUBMIT FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear old errors

    // We only connect the email/password login for now
    if (useOtp) {
      alert("OTP login is not available yet.");
      // Here you would add the logic for OTP verification
      // For now, we just stop.
      return;
    }

    try {
      // 1. Create data object to send
      const loginData = {
        email: formData.email,
        password: formData.password,
      };

      // 2. Make the API call
      const response = await axios.post(
        "http://localhost:3080/api/auth/login",
        loginData
      );

      // 3. IT WORKED! Get data from response
      const { token, role: userRole } = response.data; // e.g., "ROLE_BUYER"
      
      // 4. Save the token and user info in the browser
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data));

      // 5. Close popup
      onClose();
      
      // 6. Navigate based on the ROLE from the API
      if (userRole === "ROLE_BUYER") {
        navigate("/BuyerDashboard");
      } else if (userRole === "ROLE_SELLER") {
        navigate("/SellerDashboard");
      } else if (userRole === "ROLE_ADMIN") {
        navigate("/AdminDashboard");
      } else {
        navigate("/"); // Fallback
      }

    } catch (err) {
      // 4. IT FAILED
      setError("Login failed. Check your email or password.");
      alert("Login failed. Check your email or password.");
    }
  };
  // --- END OF UPDATE ---

  return (
    <div className="auth-overlay">
      <div className="auth-popup">
        <span className="close-icon" onClick={onClose}>✖</span>

        <h2>Welcome to <span className="highlight">EcoBazaarX</span> 🌿</h2>
        <p className="subtitle">Shop sustainably. Live consciously.</p>

        {/* We use our new handleSubmit function here */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!useOtp ? (
            <>
              {/* Your friend's email/password fields */}
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
            </>
          ) : (
            <>
              {/* Your friend's OTP fields */}
              <div className="otp-container">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
                {!otpSent ? (
                  <button type="button" onClick={sendOtp} className="otp-btn">
                    Send OTP
                  </button>
                ) : (
                  <button type="button" disabled className="otp-btn sent">
                    OTP Sent
                  </button>
                )}
              </div>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </>
          )}

          {/* Your friend's role dropdown */}
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
            {useOtp ? "Login with OTP" : "Login"}
          </button>
        </form>

        {/* Your friend's "switch to" links */}
        <p className="auth-switch">
          {useOtp ? (
            <>
              Use Email instead?{" "}
              <span onClick={() => { setUseOtp(false); setOtpSent(false); }}>
                Login with Email
              </span>
            </>
          ) : (
            <>
              Prefer mobile login?{" "}
              <span onClick={() => setUseOtp(true)}>Login with OTP</span>
            </>
          )}
        </p>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <span onClick={onSwitchToSignup}>Sign up here</span>
        </p>

        {/* Your friend's social login buttons */}
        <div className="social-signup">
          <p>Or sign up with:</p>
          <div className="social-buttons">
            {/* --- THIS IS THE NEW GOOGLE BUTTON --- */}
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
            {/* --- END OF NEW BUTTON --- */}
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

export default LoginPopup;