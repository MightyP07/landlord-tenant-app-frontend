// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../Profile.css";
import API_BASE from "../api.js";
import { useNavigate } from "react-router-dom";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload.jsx";
import { toast } from "react-toastify";
import { subscribeUser } from "../utils/notification.js";

export default function Profile() {
  const { user, token, loading, updateAuth } = useAuth();
  const [landlordCode, setLandlordCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const navigate = useNavigate();

  // Fetch tenant profile on mount
  useEffect(() => {
    const fetchTenantProfile = async () => {
      if (user?.role === "tenant") {
        try {
          const res = await fetch(`${API_BASE}/api/tenants/profile`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
          updateAuth(data.user, token);
        } catch (err) {
          toast.error(err.message);
        }
      }
    };

    fetchTenantProfile();
  }, [user?.role, token]);

  useEffect(() => {
    if (user && user.role === "tenant" && !user.landlordId) {
      setWasDisconnected(true);
    } else {
      setWasDisconnected(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && token) {
      subscribeUser(token).then((res) => {
        if (!res.ok) console.log("push subscribe failed", res.message);
      });
    }
  }, [user, token]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No user data found.</p>;

  const handlePhotoUpload = (url) => {
    updateAuth({ ...user, photo: url }, token);
  };

  const connectLandlord = async () => {
    try {
      setConnecting(true);
      setMessage("");
      const res = await fetch(`${API_BASE}/api/tenants/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ landlordCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      updateAuth(data.user, token);
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
      handlePhotoUpload={handlePhotoUpload}
      token={token}
      updateAuth={updateAuth}
    />
  ) : (
    <LandlordProfile
      user={user}
      navigate={navigate}
      handlePhotoUpload={handlePhotoUpload}
    />
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
  handlePhotoUpload,
}) {
  const navigate = useNavigate();

  return (
    <div className="profile-page tenant-profile">
      <div className="profile-header">
        <h1>Tenant Dashboard</h1>
        <p>Welcome, {user.firstName} 👋</p>
        <p className="subtitle">Manage your rental life here.</p>
      </div>

      <div className="profile-actions">
        <button className="btn-primary" onClick={() => navigate("/complaints")}>
          Log a Complaint
        </button>
        <button className="btn-secondary" onClick={() => navigate("/rental-info")}>
          Rental Info
        </button>
      </div>

      <ProfilePhotoUpload onUpload={handlePhotoUpload} />

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
            {user.landlordId.photo && (
              <li>
                <strong>Photo:</strong>
                <img
                  src={user.landlordId.photo}
                  alt={`${user.landlordId.firstName}'s photo`}
                  style={{ width: "120px", borderRadius: "10px", marginTop: "10px" }}
                />
              </li>
            )}
            <li><strong>Name:</strong> {user.landlordId.firstName} {user.landlordId.lastName}</li>
            <li><strong>Email:</strong> {user.landlordId.email}</li>
            <li><strong>Bank:</strong> {user.landlordId?.bankDetails?.bankName || "Not yet set"}</li>
            <li><strong>Account Name:</strong> {user.landlordId?.bankDetails?.accountName || "Not yet set"}</li>
            {user.landlordId?.bankDetails?.accountNumber && (
              <li>
                <strong>Account Number:</strong> {user.landlordId.bankDetails.accountNumber}
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(user.landlordId.bankDetails.accountNumber);
                    toast.success("✅ Account number copied!");
                  }}
                >
                  📋 Copy
                </button>
              </li>
            )}
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
              <button type="submit" className="connect-btn" disabled={connecting}>
                {connecting ? "Connecting..." : "Connect"}
              </button>
            </form>
            {message && (
              <p className={message.startsWith("✅") ? "success-message" : "error-message"}>
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
function LandlordProfile({ user, navigate, handlePhotoUpload }) {
  return (
    <div className="profile-page landlord-profile darkMode">
      <div className="profile-header">
        <h1>Landlord Dashboard</h1>
        <p>Welcome, {user.firstName} 👋</p>
        <p className="subtitle">Manage tenants and track complaints here.</p>
      </div>

      <div className="profile-actions">
        <button className="btn-primary" onClick={() => navigate("/viewcomplaints")}>
          View Complaints
        </button>
        <button className="btn-secondary" onClick={() => navigate("/manage-tenants")}>
          Manage Tenants
        </button>
      </div>

      <ProfilePhotoUpload onUpload={handlePhotoUpload} />

      <div className="profile-info">
        <h2>Your Details</h2>
        <ul>
          <li><strong>First Name:</strong> {user.firstName}</li>
          <li><strong>Last Name:</strong> {user.lastName}</li>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Role:</strong> {user.role}</li>
          <li><strong>Landlord Code:</strong> {user.landlordCode}</li>
        </ul>

        {/* Placeholder for tenant photos */}
        {user.tenants?.length > 0 && (
          <div className="tenant-photos">
            <h3>Your Tenants</h3>
            <ul style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              {user.tenants.map((tenant) => (
                <li key={tenant._id} style={{ textAlign: "center" }}>
                  {tenant.photo ? (
                    <img
                      src={tenant.photo}
                      alt={`${tenant.firstName}'s photo`}
                      style={{ width: "100px", borderRadius: "10px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: "#ccc",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        color: "#555",
                      }}
                    >
                      No Photo
                    </div>
                  )}
                  <p>{tenant.firstName}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
