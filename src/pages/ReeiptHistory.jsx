// src/pages/ReceiptHistory.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ReceiptHistory.css";

export default function ReceiptHistory() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchReceipts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tenants/receipts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch receipts");
        setReceipts(data);
      } catch (err) {
        toast.error(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [token]);

  const handleDownload = async (path, filename) => {
    try {
      if (!token) {
        toast.error("Unauthorized: Please log in again.");
        return;
      }

      // Normalize backslashes to forward slashes
      const normalizedPath = path.replace(/\\/g, "/");
      const url = `${API_BASE}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download receipt.");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename || "receipt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("✅ Receipt download in progress!");
    } catch (err) {
      toast.error(err.message || "Failed to download receipt.");
    }
  };

  if (loading) return <p>Loading receipts...</p>;
  if (!receipts.length) return <p>No receipts uploaded yet.</p>;

  return (
    <div className="receipt-history-container">
      <h2>Receipt History</h2>
      <ul>
        {receipts.map((r) => {
          const normalizedPath = r.path.replace(/\\/g, "/"); // fix backslashes
          const fileURL = `${API_BASE}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;

          return (
            <li key={r._id}>
              <span className="receipt-info">
                <strong>{r.originalName}</strong> - Uploaded on{" "}
                {new Date(r.uploadedAt).toLocaleString()}
              </span>
              <div className="receipt-actions">
                <a href={fileURL} target="_blank" rel="noopener noreferrer">
                  View
                </a>
                <button
                  className="download-btn"
                  onClick={() => handleDownload(r.path, r.originalName)}
                >
                  Download
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
