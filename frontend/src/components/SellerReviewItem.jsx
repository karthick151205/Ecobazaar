import React, { useState } from "react";

const SellerReviewItem = ({ review, product, updateReview }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      alert("Reply cannot be empty.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/reviews/${review.id}/reply`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply: replyText }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      const updated = await res.json();
      updateReview(updated);

      setReplyText("");
      setShowReplyBox(false);
    } catch (err) {
      alert("Failed to send reply");
    }
  };

  return (
    <div className="review-item">
      {product && (
        <img
          src={product.image}
          alt="Product"
          className="review-product-image"
        />
      )}

      <div className="review-details">
        <h3>{product ? product.name : "Unknown Product"}</h3>

        <p>
          <strong>{review.buyerName}</strong>
          <span className="review-rating"> ⭐ {review.rating}</span>
        </p>

        <p className="review-comment">{review.comment}</p>

        {review.reply && (
          <div className="seller-reply-box">
            <strong>Seller Reply:</strong>
            <p>{review.reply}</p>
          </div>
        )}

        {!review.reply && (
          <>
            {!showReplyBox ? (
              <button
                className="reply-btn"
                onClick={() => setShowReplyBox(true)}
              >
                Reply
              </button>
            ) : (
              <div className="reply-input-box">
                <textarea
                  rows="2"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>

                <button className="send-reply-btn" onClick={handleReplySubmit}>
                  Send Reply
                </button>

                <button
                  className="cancel-reply-btn"
                  onClick={() => setShowReplyBox(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerReviewItem;
