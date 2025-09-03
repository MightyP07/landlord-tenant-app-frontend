// src/pages/ConnectLandlord.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./connectLandlord.css";
import API_BASE from "../api.js";

export default function ConnectLandlord() {
  const { user, token, updateAuth, fetchCurrentUser } = useAuth(); // ✅ include updateAuth here

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!code.trim()) return setMessage("❌ Please enter a landlord code");

    setConnecting(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/tenants/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ landlordCode: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        updateAuth(data.user, token); // ✅ preserve token
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

  if (!user) {
    return (
      <div className="connectlandlord-container">
        <p className="warning-text">⚠️ Loading user info...</p>
      </div>
    );
  }

  // Already connected or not a tenant
  if (user.role !== "tenant" || user.landlordId) {
    return (
      <div className="connectlandlord-container">
        <div className="connectlandlord-box">
          <p className="success-text">
            ✅ You are already connected to your landlord.
          </p>
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
