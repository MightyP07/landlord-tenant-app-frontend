import React, { useEffect, useState } from "react";
import API_BASE from "../api.js";
import { useAuth } from "../context/AuthContext";

export default function TenantReceipts() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await fetch(`${API_BASE}/receipts/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReceipts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReceipts();
  }, [token]);

  return (
    <div>
      <h2>My Uploaded Receipts</h2>
      {receipts.length === 0 && <p>No receipts uploaded yet.</p>}
      <ul>
        {receipts.map(r => (
          <li key={r._id}>
            <strong>{new Date(r.uploadedAt).toLocaleDateString()}</strong> - ${r.amount} -{" "}
            <a href={r.fileUrl} target="_blank" rel="noreferrer">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
