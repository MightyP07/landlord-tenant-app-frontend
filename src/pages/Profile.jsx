// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../Profile.css";
import API_BASE from "../api.js";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, loading, setUser } = useAuth();
  const [landlordCode, setLandlordCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user was previously connected and now landlordId is null, show disconnect message
    if (user && user.role === "tenant" && !user.landlordId) {
      setWasDisconnected(true);
    } else {
      setWasDisconnected(false);
    }
  }, [user]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No user data found.</p>;

  const connectLandlord = async () => {
    try {
      setConnecting(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/api/tenants/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: user._id, landlordCode }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to connect");

      setUser(data.user); // update context with new landlord info
      setMessage("✅ Connected successfully!");
      setWasDisconnected(false);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setConnecting(false);
    }
  };

  return user.role === "tenant" ? (
    <TenantProfile
      user={user}
      landlordCode={landlordCode}
      setLandlordCode={setLandlordCode}
      connectLandlord={connectLandlord}
      connecting={connecting}
      message={message}
      wasDisconnected={wasDisconnected}
    />
  ) : (
    <LandlordProfile user={user} navigate={navigate} />
  );
}

// ---------------- Tenant Profile ----------------
function TenantProfile({
  user,
  landlordCode,
  setLandlordCode,
  connectLandlord,
  connecting,
  message,
  wasDisconnected,
}) {
  const navigate = useNavigate();
  return (
    <div className="profile-page tenant-profile">
      <div className="profile-header">
        <h1>Tenant Dashboard</h1>
        <p>Welcome, {user.firstName} 👋</p>
        <p className="subtitle">Here you can manage your rental life with ease.</p>
      </div>

      <div className="profile-actions">
        <button className="btn-primary" onClick={() => navigate("/complaints")}>
          Log a Complaint
        </button>
        <button className="btn-secondary">View Rental Info</button>
      </div>

      <div className="profile-info">
        <h2>Your Details</h2>
        <ul>
          <li><strong>First Name:</strong> {user.firstName}</li>
          <li><strong>Last Name:</strong> {user.lastName}</li>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Role:</strong> {user.role}</li>
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Your Landlord</h2>
        {user.landlordId ? (
          <ul>
            <li><strong>Name:</strong> {user.landlordId.firstName} {user.landlordId.lastName}</li>
            <li><strong>Email:</strong> {user.landlordId.email}</li>
          </ul>
        ) : (
          <>
            {wasDisconnected && (
              <p className="error-message">
                You are not connected to a Landlord. Enter code to connect to a landlord.
              </p>
            )}
            <form
              className="connect-form"
              onSubmit={(e) => {
                e.preventDefault();
                connectLandlord();
              }}
            >
              <input
                type="text"
                value={landlordCode}
                onChange={(e) => setLandlordCode(e.target.value)}
                placeholder="Enter landlord code"
                className="connect-input"
              />
              <button
                type="submit"
                className="connect-btn"
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect"}
              </button>
            </form>

            {message && (
              <p
                className={
                  message.startsWith("✅")
                    ? "success-message"
                    : "error-message"
                }
              >
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------- Landlord Profile ----------------
function LandlordProfile({ user, navigate }) {
  return (
    <div className="profile-page landlord-profile darkMode">
      <div className="profile-header darkMode dark-mode">
        <h1>Landlord Dashboard</h1>
        <p>Welcome, {user.firstName} 👋</p>
        <p className="subtitle">Keep track of tenants and complaints here.</p>
      </div>

      <div className="profile-actions">
        <button className="btn-primary" onClick={() => navigate("/viewcomplaints")}>View Complaints</button>
        <button
          className="btn-secondary"
          onClick={() => navigate("/manage-tenants")}
        >
          Manage Tenants
        </button>
      </div>

      <div className="profile-info">
        <h2>Your Details</h2>
        <ul>
          <li><strong>First Name:</strong> {user.firstName}</li>
          <li><strong>Last Name:</strong> {user.lastName}</li>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Role:</strong> {user.role}</li>
          <li><strong>Landlord Code:</strong> {user.landlordCode}</li>
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Quick Links</h2>
        <ul>
          <li>👥 Manage tenant list</li>
          <li>💰 Track rental payments</li>
          <li>🛠️ Review maintenance requests</li>
        </ul>
      </div>
    </div>
  );
}
