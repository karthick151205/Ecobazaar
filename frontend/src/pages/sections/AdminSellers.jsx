import React, { useEffect, useState } from "react";

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [editSeller, setEditSeller] = useState(null); // ⭐ Edit popup state

  const loadSellers = () => {
    fetch("http://localhost:8080/admin/sellers")
      .then(res => res.json())
      .then(data => setSellers(data));
  };

  useEffect(loadSellers, []);

  const approveSeller = async (id) => {
    await fetch(`http://localhost:8080/admin/seller/approve/${id}`, {
      method: "POST"
    });
    loadSellers();
  };

  const rejectSeller = async (id) => {
    if (!window.confirm("Reject and remove seller?")) return;

    await fetch(`http://localhost:8080/admin/seller/reject/${id}`, {
      method: "POST"
    });
    loadSellers();
  };

  const updateSeller = async () => {
    await fetch(`http://localhost:8080/admin/seller/update/${editSeller.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editSeller),
    });

    setEditSeller(null);
    loadSellers();
  };

  return (
    <div>
      <h2 className="section-title">🏪 Seller Verification</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Status</th><th>Action</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(sellers) && sellers.length > 0 ? (
            sellers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.approved ? "✔ Approved" : "⏳ Pending"}</td>

                <td>
                  {/* ⭐ Edit button */}
                  <button
                    className="edit-btn"
                    onClick={() => setEditSeller({ ...s })}
                  >
                    Edit ✏️
                  </button>

                  {/* Approve + Reject */}
                  {!s.approved && (
                    <>
                      <button className="approve-btn" onClick={() => approveSeller(s.id)}>
                        Approve ✔
                      </button>
                      <button className="reject-btn" onClick={() => rejectSeller(s.id)}>
                        Reject ❌
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No sellers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ⭐ EDIT POPUP */}
      {editSeller && (
        <div className="edit-popup-overlay">
          <div className="edit-popup">
            <h3>Edit Seller</h3>

            <label>Name</label>
            <input
              type="text"
              value={editSeller.name}
              onChange={(e) =>
                setEditSeller({ ...editSeller, name: e.target.value })
              }
            />

            <label>Email</label>
            <input
              type="email"
              value={editSeller.email}
              onChange={(e) =>
                setEditSeller({ ...editSeller, email: e.target.value })
              }
            />

            <label>Status</label>
            <select
              value={editSeller.approved ? "APPROVED" : "PENDING"}
              onChange={(e) =>
                setEditSeller({
                  ...editSeller,
                  approved: e.target.value === "APPROVED",
                })
              }
            >
              <option value="PENDING">⏳ Pending</option>
              <option value="APPROVED">✔ Approved</option>
            </select>

            <div className="popup-actions">
              <button className="save-btn" onClick={updateSeller}>
                Save ✔
              </button>
              <button className="cancel-btn" onClick={() => setEditSeller(null)}>
                Cancel ✖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
