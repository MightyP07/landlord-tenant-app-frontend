// src/pages/ConnectLandlord.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./connectLandlord.css";
import API_BASE from "../api.js";

export default function ConnectLandlord() {
  const { user, fetchCurrentUser } = useAuth();
  const [localUser, setLocalUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  // Sync with context after mount
  useEffect(() => {
    if (!user) fetchCurrentUser();
    else setLocalUser(user);
  }, [user]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!code.trim()) return setMessage("❌ Please enter a landlord code");

    setConnecting(true);
    setMessage("");

    try {
      const token =
        localUser?.token ||
        JSON.parse(localStorage.getItem("user"))?.token; // ✅ safer token fetch

      const res = await fetch(`${API_BASE}/api/tenants/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ always send JWT
        },
        body: JSON.stringify({ landlordCode: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchCurrentUser(); // update context & localStorage
        setLocalUser(JSON.parse(localStorage.getItem("user"))); // sync localUser
        setMessage("✅ Landlord connected successfully!");
        setTimeout(() => navigate("/profile"), 1200);
      } else {
        setMessage(data?.message || "❌ Invalid code");
      }
    } catch (err) {
      console.error("❌ Connect landlord error:", err);
      setMessage("Server error. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  if (!localUser) {
    return (
      <div className="connectlandlord-container">
        <p className="warning-text">⚠️ Loading user info...</p>
      </div>
    );
  }

  // Already connected or landlord
  if (localUser.role !== "tenant" || localUser.landlordId) {
    return (
      <div className="connectlandlord-container">
        <div className="connectlandlord-box">
          <p className="success-text">✅ You are already connected to your landlord.</p>
          <button onClick={() => navigate("/profile")} className="btn-primary">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="connectlandlord-container">
      <div className="connectlandlord-box">
        <h2 className="connectlandlord-title">Connect Your Landlord</h2>

        <form onSubmit={handleConnect} className="connectlandlord-form">
          <input
            type="text"
            placeholder="Enter landlord code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" className="btn-primary" disabled={connecting}>
            {connecting ? "Connecting..." : "Connect"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="btn-secondary"
        >
          Skip for now
        </button>

        {message && (
          <p
            className={`message ${
              message.startsWith("✅") ? "success-text" : "error-text"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}