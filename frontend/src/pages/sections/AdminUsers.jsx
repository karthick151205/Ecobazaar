import React, { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null); // ⭐ Popup state

  /* ============================
      LOAD USERS FUNCTION
  ============================ */
  const loadUsers = () => {
    fetch("http://localhost:8080/admin/buyers")
      .then((res) => res.json())
      .then((data) => {
        console.log("BUYERS RESPONSE:", data);
        setUsers(data);
      })
      .catch((err) => console.error("Error fetching users:", err));
  };

  /* ============================
      LOAD ON PAGE OPEN
  ============================ */
  useEffect(() => {
    loadUsers();
  }, []);

  /* ============================
       DELETE USER
  ============================ */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(`http://localhost:8080/admin/delete/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  };

  /* ============================
       UPDATE USER
  ============================ */
  const updateUser = async () => {
    await fetch(`http://localhost:8080/admin/update/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editUser),
    });

    setEditUser(null); // Close popup
    loadUsers();
  };

  return (
    <div>
      <h2 className="section-title">👥 Manage Users</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Action</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>

                <td>
                  {/* ⭐ Edit Button */}
                  <button
                    className="edit-btn"
                    onClick={() => setEditUser({ ...u })}
                  >
                    Edit ✏️
                  </button>

                  {/* ❌ Delete Button */}
                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete ❌
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No buyers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ⭐ EDIT POPUP */}
      {editUser && (
        <div className="edit-popup-overlay">
          <div className="edit-popup">
            <h3>Edit User</h3>

            <label>Name</label>
            <input
              type="text"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
            />

            <label>Email</label>
            <input
              type="email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />

            <label>Role</label>
            <select
              value={editUser.role}
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            >
              <option value="BUYER">BUYER</option>
              <option value="SELLER">SELLER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <div className="popup-actions">
              <button className="save-btn" onClick={updateUser}>
                Save ✔
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditUser(null)}
              >
                Cancel ✖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
