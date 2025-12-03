import React, { useEffect, useState } from "react";
import "./AdminReviews.css";

export default function AdminReviews() {
  const [helpList, setHelpList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Reply popup states
  const [replyPopup, setReplyPopup] = useState(false);
  const [replyEmail, setReplyEmail] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [currentReplyId, setCurrentReplyId] = useState(null);

  // Load help requests
  const loadHelp = () => {
    fetch("http://localhost:8080/api/admin/help/all")
      .then((res) => res.json())
      .then((data) => {
        setHelpList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadHelp();
  }, []);

  // Delete help entry
  const deleteHelp = async (id) => {
    if (!window.confirm("Delete this help message?")) return;

    await fetch(`http://localhost:8080/api/admin/help/delete/${id}`, {
      method: "DELETE",
    });

    loadHelp();
  };

  // ⭐ Open reply popup
  const openReplyPopup = (email, id, existingReply = "") => {
    setReplyEmail(email);
    setCurrentReplyId(id);
    setReplyMessage(existingReply); // Load existing reply
    setReplyPopup(true);
  };

  // ⭐ Send reply (store in DB)
  const sendReply = async () => {
    if (!replyMessage.trim()) {
      alert("Enter a reply message!");
      return;
    }

    await fetch("http://localhost:8080/api/admin/help/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: currentReplyId,
        email: replyEmail,
        reply: replyMessage,
      }),
    });

    alert("Reply saved!");
    setReplyPopup(false);
    setReplyMessage("");
    setReplyEmail("");
    loadHelp();
  };

  return (
    <div>
      <h2 className="section-title">📩 User Help Requests</h2>

      {loading ? (
        <p>Loading help messages...</p>
      ) : helpList.length === 0 ? (
        <p>No help requests found.</p>
      ) : (
        <div className="help-grid">
          {helpList.map((msg) => (
            <div key={msg.id} className="help-card">
              <h3>📧 {msg.email}</h3>

              <p className="help-message">{msg.message}</p>

              {/* ⭐ Show reply if exists */}
              {msg.reply && (
                <div className="admin-reply-box">
                  <strong>Admin Reply:</strong>
                  <p>{msg.reply}</p>
                </div>
              )}

              {/* ⭐ Badge */}
              {msg.reply ? (
                <span className="reply-badge replied">✓ Replied</span>
              ) : (
                <span className="reply-badge pending">● Pending</span>
              )}

              <div className="help-actions">

                <button
                  className="reply-btn"
                  onClick={() => openReplyPopup(msg.email, msg.id, msg.reply)}
                >
                  {msg.reply ? "Edit Reply ✏️" : "Reply"}
                </button>

                <button
                  className="resolve-btn"
                  onClick={() => deleteHelp(msg.id)}
                >
                  Resolved ✔
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteHelp(msg.id)}
                >
                  Delete ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ Reply Popup */}
      {replyPopup && (
        <div className="reply-overlay">
          <div className="reply-popup">
            <h3>Reply to: {replyEmail}</h3>

            <textarea
              placeholder="Write your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />

            <div className="reply-actions">
              <button className="send-btn" onClick={sendReply}>
                {replyMessage ? "Update Reply ✔" : "Send Reply ✔"}
              </button>

              <button
                className="close-btn1"
                onClick={() => setReplyPopup(false)}
              >
                Close ✖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
