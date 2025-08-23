// src/pages/LogComplaint.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE from "../api.js";
import "./logComplaint.css";

const COMMON_COMPLAINTS = [
  "Leaky faucet / plumbing issue",
  "Electricity / power problem",
  "No hot water",
  "Broken appliance",
  "Pest / insect problem",
  "Noise complaint",
  "Cleaning / maintenance issue",
  "Security / lock problem",
];

export default function LogComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMulti, setSelectedMulti] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <p>⚠️ Loading user info...</p>;
  if (!user.landlordId)
    return (
      <div className="complaint-container">
        <p>⚠️ You are not connected to a landlord yet.</p>
      </div>
    );

  const handleMultiChange = (complaint) => {
    setSelectedMulti((prev) =>
      prev.includes(complaint)
        ? prev.filter((c) => c !== complaint)
        : [...prev, complaint]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const combinedTitle = title.trim() || selectedMulti.join(", ");
    const combinedDescription = description.trim() || "No additional details";

    if (!combinedTitle) {
      toast.warn("❌ Please provide a complaint title or select an issue.");
      return;
    }

    setSubmitting(true);
    toast.info("⏳ Please wait, logging your complaint...");

    try {
      const res = await fetch(`${API_BASE}/api/tenants/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tenantId: user._id,
          landlordId: user.landlordId,
          title: combinedTitle,
          description: combinedDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to log complaint");

      toast.success("✅ Complaint logged successfully!");
      setTitle("");
      setDescription("");
      setSelectedMulti([]);
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      console.error("❌ Log complaint error:", err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="complaint-container">
      <ToastContainer />
      <h2>Log a Complaint</h2>

      <form onSubmit={handleSubmit} className="complaint-form">
        <label>Choose from common complaints:</label>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        >
          <option value="">-- Select an issue --</option>
          {COMMON_COMPLAINTS.map((c, idx) => (
            <option key={idx} value={c}>
              {c}
            </option>
          ))}
        </select>

        <fieldset>
          <legend>Or select multiple issues:</legend>
          {COMMON_COMPLAINTS.map((c, idx) => (
            <label key={idx} className="multi-checkbox">
              <input
                type="checkbox"
                checked={selectedMulti.includes(c)}
                onChange={() => handleMultiChange(c)}
              />
              {c}
            </label>
          ))}
        </fieldset>

        <textarea
          placeholder="Describe your issue in detail"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}