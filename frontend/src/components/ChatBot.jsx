import React, { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, top_n: 5 }),
      });

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.response,
        recommendations: data.recommendations || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠ Chatbot API not reachable." },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="chat-button" onClick={toggleChat}>💬</div>

      <div className={`chatbot-container ${isOpen ? "open" : "closed"}`}>
        <div className="chat-header">
          <span>EcoBazaar Assistant</span>
          <button className="close-btn2" onClick={toggleChat}>×</button>
        </div>

        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>

              {msg.recommendations?.length > 0 && (
                <div className="reco-box">
                  {msg.recommendations.map((p, i) => (
                   <div key={i} className="reco-card">
  <img src={p.image} alt={p.name} className="reco-img" />

  <div className="reco-content">
    <h4 className="reco-title">{p.name}</h4>

    <p className="reco-category">🏷 {p.category}</p>

    <div className="reco-details">
      <span>💰 Price: ₹{p.price}</span>
      <span>🌱 CO₂: {p.carbon_footprint} kg</span>
    </div>
  </div>
</div>

                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && <p className="loading">Thinking...</p>}
        </div>

        <div className="input-box">
          <input
            type="text"
            placeholder="Ask something eco-friendly..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
