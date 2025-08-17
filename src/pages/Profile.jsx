// src/pages/Profile.jsx
import { useAuth } from "../context/AuthContext";
import "../Profile.css";

export default function Profile() {
  const { user, loading } = useAuth();

if (loading) return <p>Loading profile...</p>;
if (!user) {
  console.log("DEBUG: No user found in context");
  return <p>No user data found.</p>;
}
console.log("DEBUG: User in profile", user);

  const TenantProfile = () => (
    <div className="profile-page tenant-profile">
      <div className="profile-header">
        <h1>Tenant Dashboard</h1>
        <p>Welcome, {user.firstName} 👋</p>
        <p className="subtitle">Here you can manage your rental life with ease.</p>
      </div>

      <div className="profile-actions">
        <button className="btn-primary">Log a Complaint</button>
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

      {/* Dashboard extra sections */}
      <div className="dashboard-section">
        <h2>Quick Links</h2>
        <ul>
          <li>📄 Download your rental agreement</li>
          <li>💰 View your latest payment status</li>
          <li>🛠️ Submit a new maintenance request</li>
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Recent Updates</h2>
        <p>No recent notifications yet. Check back soon!</p>
      </div>
    </div>
  );

  const LandlordProfile = () => (
    <div className="profile-page landlord-profile">
      <div className="profile-header">
        <h1>Landlord Dashboard</h1>
        <p>Welcome, {user.firstName} 👋</p>
        <p className="subtitle">Keep track of tenants and complaints here.</p>
      </div>

      <div className="profile-actions">
        <button className="btn-primary">View Complaints</button>
        <button className="btn-secondary">Manage Tenants</button>
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

      {/* Dashboard extra sections */}
      <div className="dashboard-section">
        <h2>Quick Links</h2>
        <ul>
          <li>👥 Manage tenant list</li>
          <li>💰 Track rental payments</li>
          <li>🛠️ Review maintenance requests</li>
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Recent Updates</h2>
        <p>No landlord notifications yet. Stay tuned!</p>
      </div>
    </div>
  );

  return user.role === "tenant" ? <TenantProfile /> : <LandlordProfile />;
}
