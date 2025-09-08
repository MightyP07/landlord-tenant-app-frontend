import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../api.js";
import "./manageTenants.css";
import { toast } from "react-toastify";

export default function ManageTenants() {
  const { user, loading } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [rentModal, setRentModal] = useState({ open: false, tenant: null, amount: "" });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        const stored = localStorage.getItem("auth");
        const token = stored ? JSON.parse(stored)?.token : null;

        const res = await fetch(`${API_BASE}/api/landlord/tenants`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch tenants");

        setTenants(data.tenants);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTenants(false);
      }
    };

    if (user?.role === "landlord") fetchTenants();
  }, [user]);

  const handleRemoveTenant = async (tenantId) => {
    if (!window.confirm("Are you sure you want to remove this tenant?")) return;

    try {
      setRemovingId(tenantId);
      const stored = localStorage.getItem("auth");
      const token = stored ? JSON.parse(stored)?.token : null;

      const res = await fetch(`${API_BASE}/api/landlord/tenants/${tenantId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove tenant");

      setTenants(tenants.filter((t) => t._id !== tenantId));
      toast.success("Tenant removed successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  const openRentModal = (tenant) => setRentModal({ open: true, tenant, amount: "" });
  const closeRentModal = () => setRentModal({ open: false, tenant: null, amount: "" });

  const handleSetRent = async () => {
    if (!rentModal.amount || isNaN(rentModal.amount)) {
      toast.error("Enter a valid rent amount");
      return;
    }
    try {
      const stored = localStorage.getItem("auth");
      const token = stored ? JSON.parse(stored)?.token : null;

      const res = await fetch(`${API_BASE}/api/landlord/tenants/${rentModal.tenant._id}/set-rent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: Number(rentModal.amount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to set rent");

      toast.success(`Rent of ₦${rentModal.amount} sent to ${rentModal.tenant.firstName}`);
      closeRentModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemindRent = async (tenant) => {
    try {
      const stored = localStorage.getItem("auth");
      const token = stored ? JSON.parse(stored)?.token : null;

      const res = await fetch(`${API_BASE}/api/landlord/tenants/${tenant._id}/remind-rent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reminder");

      toast.success(`Reminder sent to ${tenant.firstName}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p>Loading user info...</p>;
  if (loadingTenants) return <p>Loading tenants...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="manage-tenants-container">
      <h2>Manage Tenants</h2>

      {tenants.length === 0 ? (
        <p>No tenants found.</p>
      ) : (
        <div className="cards-grid">
          {tenants.map((tenant) => (
            <div key={tenant._id} className="tenant-card">
              <h3>{tenant.firstName} {tenant.lastName}</h3>
              <p><strong>Email:</strong> {tenant.email}</p>
              <p><strong>Connected On:</strong> {formatDate(tenant.connectedOn)}</p>
              <div className="card-buttons">
                <button className="btn-setrent" onClick={() => openRentModal(tenant)}>Set Rent Fee</button>
                <button className="btn-remind" onClick={() => handleRemindRent(tenant)}>Remind Rent Fee</button>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveTenant(tenant._id)}
                  disabled={removingId === tenant._id}
                >
                  {removingId === tenant._id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rent Modal */}
      {rentModal.open && (
        <div className="rent-modal">
          <div className="rent-modal-content">
            <h3>Set Rent Fee for {rentModal.tenant.firstName}</h3>
            <input
              type="number"
              placeholder="Enter rent amount"
              value={rentModal.amount}
              onChange={(e) => setRentModal({ ...rentModal, amount: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={handleSetRent} className="btn-confirm">Send</button>
              <button onClick={closeRentModal} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
