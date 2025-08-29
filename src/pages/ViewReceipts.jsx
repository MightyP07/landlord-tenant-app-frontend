// src/pages/ViewReceipts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../api.js";
import "./ViewReceipts.css";

export default function ViewReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/receipts/all`, { withCredentials: true });
        setReceipts(res.data);
      } catch (err) {
        console.error("Failed to fetch receipts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  const handleDownload = (id) => {
    window.open(`${API_BASE}/api/receipts/download/${id}`, "_blank");
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
                  <td>{r.user.firstName} {r.user.lastName}</td>
                  <td>{r.filename}</td>
                  <td>{new Date(r.uploadedAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleDownload(r._id)} className="download-btn">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
