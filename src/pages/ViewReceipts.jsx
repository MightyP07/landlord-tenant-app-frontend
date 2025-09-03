// src/pages/ViewReceipts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ViewReceipts.css";
import { useAuth } from "../context/AuthContext";

export default function ViewReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const stored = localStorage.getItem("auth");
        const token = stored ? JSON.parse(stored)?.token : null;

        if (!token) {
          toast.error("Unauthorized: Please log in again.");
          return;
        }

        const res = await axios.get(`${API_BASE}/api/receipts/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          toast.error("You do not have permission to view receipts.");
          return;
        }

        setReceipts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch receipts:", err);
        toast.error("Failed to fetch receipts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const handleDownload = async (id, filename) => {
    try {
      const stored = localStorage.getItem("auth");
      const token = stored ? JSON.parse(stored)?.token : null;

      if (!token) {
        toast.error("Unauthorized: Please log in again.");
        return;
      }

      toast.info("Downloading...");

      const res = await fetch(`${API_BASE}/api/receipts/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to download receipt.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "receipt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("✅ Receipt downloaded!");
    } catch (err) {
      console.error("❌ Download error:", err);
      toast.error(err.message || "Failed to download receipt.");
    }
  };

  if (loading) return <p className="receipts-loading">Loading receipts...</p>;

  return (
    <div className="receipts-card">
      <h1 className="receipts-title">Tenant Receipts</h1>
      {receipts.length === 0 ? (
        <p className="receipts-empty">No receipts uploaded yet.</p>
      ) : (
        <div className="receipts-table-wrapper">
          <table className="receipts-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Filename</th>
                <th>Uploaded At</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r._id}>
                  <td>
                    {r.user.firstName} {r.user.lastName}
                  </td>
                  <td>{r.originalName}</td>
                  <td>{new Date(r.uploadedAt).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleDownload(r._id, r.originalName)}
                      className="download-btn"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
