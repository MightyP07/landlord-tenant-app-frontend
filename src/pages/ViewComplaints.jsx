// src/pages/ViewComplaints.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE from "../api.js";
import "./viewComplaints.css";

export default function ViewComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchComplaints = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/landlord/complaints/${user._id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch complaints");
        setComplaints(data.complaints || []);
      } catch (err) {
        console.error("❌ Fetch complaints error:", err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

  if (!user) return <p>⚠️ Loading user info...</p>;

  return (
    <div className="complaints-container">
      <ToastContainer />
      <h2>Tenant Complaints</h2>
      {loading ? (
        <p>⏳ Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>✅ No complaints yet.</p>
      ) : (
        <ul className="complaints-list">
          {complaints.map((c) => {
            // Split multi-choice titles into array
            const titles = c.title.split(",").map(t => t.trim());
            return (
              <li key={c._id} className="complaint-card">
                <h3>Complaint Details:</h3>
                {titles.length > 1 ? (
                  <ul className="multi-issues-list">
                    {titles.map((t, i) => (
                      <li key={i}>• {t}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{c.title}</p>
                )}
                <p>{c.description}</p>
                <p className="complaint-meta">
                  From: {c.tenantName || "Tenant"} | {new Date(c.createdAt).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
