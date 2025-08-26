// src/pages/manageTenants.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../api.js";
import "./manageTenants.css";

export default function ManageTenants() {
  const { user, loading } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // Format connectedOn date
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
        const res = await fetch(`${API_BASE}/api/landlord/tenants`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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

    if (user?.role === "landlord") {
      fetchTenants();
    }
  }, [user]);

  const handleRemoveTenant = async (tenantId) => {
    if (!window.confirm("Are you sure you want to remove this tenant?")) return;

    try {
      setRemovingId(tenantId);
      const res = await fetch(`${API_BASE}/api/landlord/tenants/${tenantId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove tenant");

      setTenants(tenants.filter((t) => t._id !== tenantId));
    } catch (err) {
      alert(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <p>Loading user info...</p>;
  if (loadingTenants) return <p>Loading tenants...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="tenants-container">
      <h2>Manage Tenants</h2>

      {tenants.length === 0 ? (
        <p>No tenants found.</p>
      ) : (
        <table className="tenant-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Connected On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant._id}>
                <td>{tenant.firstName}</td>
                <td>{tenant.lastName}</td>
                <td>{tenant.email}</td>
                <td>{formatDate(tenant.connectedOn)}</td>
                <td>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRemoveTenant(tenant._id);
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-remove"
                      disabled={removingId === tenant._id}
                    >
                      {removingId === tenant._id ? "Removing..." : "Remove"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
