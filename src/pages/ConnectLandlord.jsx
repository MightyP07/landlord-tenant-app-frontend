// src/pages/ConnectLandlord.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./connectLandlord.css";
import API_BASE from "../api.js";


const ConnectLandlord = ({ user }) => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="connectlandlord-container">
        <p className="warning-text">⚠️ Please log in first.</p>
      </div>
    );
  }

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/tenants/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: user._id, landlordCode: code }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Landlord connected successfully!");
        setTimeout(() => navigate("/profile"), 1200);
      } else {
        setMessage(data.message || "❌ Invalid code");
      }
    } catch (error) {
      console.error("❌ Connect landlord error:", error);
      setMessage("Server error, try again");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="connectlandlord-container">
      <div className="connectlandlord-box">
        <h2 className="connectlandlord-title">Connect Your Landlord</h2>

        {user.role === "tenant" && !user.landlordId ? (
          <>
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

            <button onClick={() => navigate("/profile")} className="btn-secondary">
              Skip for now
            </button>
          </>
        ) : (
          <div className="already-connected">
            <p className="success-text">
              ✅ You are already connected to your landlord.
            </p>
            <button onClick={() => navigate("/profile")} className="btn-primary">
              Go to Profile
            </button>
          </div>
        )}

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
};

export default ConnectLandlord;
