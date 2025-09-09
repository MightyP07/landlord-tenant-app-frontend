import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../Profile.css";
import API_BASE from "../api.js";
import { useNavigate } from "react-router-dom";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload.jsx";
import { toast } from "react-toastify";

export default function Profile() {
  const { user, token, loading, updateAuth } = useAuth();
  const [landlordCode, setLandlordCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.photo || null);
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

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No user data found.</p>;

  const handlePhotoUpload = (url) => {
    setPhotoUrl(url);
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
      photoUrl={photoUrl}
      handlePhotoUpload={handlePhotoUpload}
      token={token}
      updateAuth={updateAuth}
    />
  ) : (
    <LandlordProfile
      user={user}
      navigate={navigate}
      photoUrl={photoUrl}
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
  photoUrl,
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
        <button className="btn-secondary">View Rental Info</button>
      </div>

      <ProfilePhotoUpload currentPhoto={photoUrl} onUpload={handlePhotoUpload} />

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
            <li><strong>Bank:</strong> {user.landlordId?.bankDetails?.bankName || "Not yet set by your landlord"}</li>
            <li><strong>Account Name:</strong> {user.landlordId?.bankDetails?.accountName || "Not yet set by your landlord"}</li>
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
        
{user.pendingRent?.amount && (
  <div
    className="pending-rent-alert"
    style={{
      backgroundColor: "#ffd666",
      color: "#333",
      padding: "18px",
      borderRadius: "10px",
      marginTop: "20px",
      textAlign: "center",
      fontSize: "1.3rem",
      fontWeight: "600",
      boxShadow: "0 0 12px rgba(255, 200, 0, 0.4)",
      animation: "pulse 1.5s infinite alternate",
      cursor: "pointer",
    }}
    onClick={() => navigate("/pay-rent")}
    title="Click to pay your rent"
  >
    💡 Your landlord has set your rent to <strong>₦{user.pendingRent.amount}</strong>.
    Click here to pay now.
  </div>
)}

      </div>
    </div>
  );
}

// ---------------- Landlord Profile ----------------
function LandlordProfile({ user, navigate, photoUrl, handlePhotoUpload }) {
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

      <ProfilePhotoUpload currentPhoto={photoUrl} onUpload={handlePhotoUpload} />

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
