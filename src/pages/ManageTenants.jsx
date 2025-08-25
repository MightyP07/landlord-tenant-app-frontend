// src/pages/ManageTenants.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE from "../api.js";
import "./manageTenants.css";

export default function ManageTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/landlord/tenants`, {
        withCredentials: true,
      });
      setTenants(res.data.tenants || []);
    } catch (err) {
      console.error("❌ Fetch tenants error:", err);
      setError("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (tenantId) => {
    if (!window.confirm("Are you sure you want to remove this tenant?")) return;

    try {
      setRemovingId(tenantId);
      await axios.delete(`${API_BASE}/api/landlords/tenants/${tenantId}`, {
        withCredentials: true,
      });

      setTenants((prev) => prev.filter((t) => t._id !== tenantId));
      toast.success("✅ Tenant removed successfully!");
    } catch (err) {
      console.error("❌ Remove tenant error:", err);
      toast.error(err.response?.data?.message || "Failed to remove tenant");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <p>Loading tenants...</p>;
  if (error) return <p className="error">{error}</p>;
  if (tenants.length === 0) return <p>No tenants connected yet.</p>;

  return (
    <div className="manage-tenants-container">
      <ToastContainer />
      <h2>Manage Tenants</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant._id}>
              <td>{tenant.firstName}</td>
              <td>{tenant.lastName}</td>
              <td>{tenant.email}</td>
              <td>
                <button
                  className="remove-btn"
                  disabled={removingId === tenant._id}
                  onClick={() => handleRemove(tenant._id)}
                >
                  {removingId === tenant._id ? "Removing..." : "Remove"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
