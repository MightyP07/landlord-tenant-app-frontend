// src/pages/ConnectLandlord.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./connectLandlord.css";
import API_BASE from "../api.js";

export default function ConnectLandlord() {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Sync with context after mount
  useEffect(() => {
    const syncUser = async () => {
      if (!user) await fetchCurrentUser();
      const storedUser = localStorage.getItem("user");
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    };
    syncUser();
  }, [user, fetchCurrentUser]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!code.trim()) return setMessage("❌ Please enter a landlord code");

    setConnecting(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/tenants/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordCode: code.trim() }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "❌ Invalid code");
        setConnecting(false);
        return;
      }

      // ✅ Refresh and sync latest user before redirect
      await fetchCurrentUser();
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) setCurrentUser(JSON.parse(updatedUser));

      setMessage("✅ Landlord connected successfully!");

      // Small delay to show success message
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error("❌ Connect landlord error:", err);
      setMessage("Server error. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="connectlandlord-container">
        <p className="warning-text">⚠️ Loading user info...</p>
      </div>
    );
  }

  // Already connected or not a tenant
  if (currentUser.role !== "tenant" || currentUser.landlordId) {
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

        <button type="button" onClick={() => navigate("/profile")} className="btn-secondary">
          Skip for now
        </button>

        {message && (
          <p className={`message ${message.startsWith("✅") ? "success-text" : "error-text"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}