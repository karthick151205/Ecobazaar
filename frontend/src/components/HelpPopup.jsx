import React, { useState } from "react";
import "./HelpPopup.css";

export default function HelpPopup({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendHelpRequest = async () => {
    if (!email.trim()) return alert("Please enter your email!");
    if (!message.trim()) return alert("Please enter your message!");

    setSending(true);

    try {
      await fetch("http://localhost:8080/api/admin/help", {  // ✅ FIXED
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      alert("Your help request has been sent to the admin!");
      onClose();
    } catch (err) {
      alert("Failed to send message.");
    }

    setSending(false);
  };

  return (
    <div className="help-overlay">
      <div className="help-popup">

        {/* ⭐ Close Button (Top Right) */}
        <button className="help-close-x" onClick={onClose}>×</button>

        <h2>Need Help?</h2>
        <p>Tell us your problem. Admin will assist you soon.</p>

        {/* Email Input */}
        <input
          type="email"
          className="help-email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Message Input */}
        <textarea
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="help-buttons">
          <button
            className="send-btn"
            onClick={sendHelpRequest}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
