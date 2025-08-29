// src/pages/ViewComplaints.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE from "../api.js";
import { requestPermission, scheduleNotification, cancelNotification } from "../utils/notification.js";
import "./viewcomplaints.css";

export default function ViewComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderTimes, setReminderTimes] = useState({});
  const inputRefs = useRef({});

  // Load saved reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reminderTimes");
    if (saved) setReminderTimes(JSON.parse(saved));
  }, []);

  // Fetch complaints
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
        setComplaints((data.complaints || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ));
      } catch (err) {
        console.error("❌ Fetch complaints error:", err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

  // Reschedule saved notifications on load
  useEffect(() => {
    if (!complaints.length) return;

    Object.entries(reminderTimes).forEach(([id, time]) => {
      if (time) {
        const complaint = complaints.find(c => c._id === id);
        if (complaint) scheduleNotification(id, complaint.title, time);
      }
    });
  }, [complaints, reminderTimes]);

  const handleReminderChange = (complaintId, value) => {
    setReminderTimes(prev => {
      const updated = { ...prev, [complaintId]: value };
      localStorage.setItem("reminderTimes", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSetReminder = async (complaintId, title) => {
    const time = reminderTimes[complaintId];
    if (!time) {
      toast.warn("Please select a time first.");
      return;
    }
    const permissionGranted = await requestPermission();
    if (!permissionGranted) {
      toast.error("⚠️ Please allow notifications to set reminders");
      return;
    }
    scheduleNotification(complaintId, title, time);
    toast.info(`⏰ Reminder set for ${time} on complaint "${title}"`);
  };

  const handleCancelReminder = (complaintId, title) => {
    cancelNotification(complaintId);
    setReminderTimes(prev => {
      const updated = { ...prev, [complaintId]: "" };
      localStorage.setItem("reminderTimes", JSON.stringify(updated));
      return updated;
    });
    toast.info(`❌ Reminder cancelled for "${title}"`);
  };

  const handleCancelAll = () => {
    Object.keys(reminderTimes).forEach(id => cancelNotification(id));
    setReminderTimes({});
    localStorage.removeItem("reminderTimes");
    toast.info("❌ All reminders cancelled");
  };

  const openTimePicker = (complaintId) => {
    inputRefs.current[complaintId]?.showPicker();
  };

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
        <>
          <ul className="complaints-list">
            {complaints.map(c => {
              const titles = c.title.split(",").map(t => t.trim());
              const complaintTitle = c.title;
              return (
                <li key={c._id} className="complaint-card">
                  <h3>Complaint Details:</h3>
                  {titles.length > 1 ? (
                    <ul className="multi-issues-list">
                      {titles.map((t, i) => <li key={i}>• {t}</li>)}
                    </ul>
                  ) : <p>{c.title}</p>}
                  <p>{c.description}</p>
                  <p className="complaint-meta">
                    From: {c.tenantName || "Tenant"} | {new Date(c.createdAt).toLocaleString()}
                  </p>

                  <div className="reminder-wrapper">
                    <input
                      type="time"
                      ref={el => inputRefs.current[c._id] = el}
                      value={reminderTimes[c._id] || ""}
                      onChange={(e) => handleReminderChange(c._id, e.target.value)}
                      style={{ display: "none" }} // hide native input
                    />

                    <button
                      className="pick-time-btn"
                      onClick={() => openTimePicker(c._id)}
                    >
                      {reminderTimes[c._id] || "Pick Time"}
                    </button>

                    <button
                      className="set-reminder-btn"
                      onClick={() => handleSetReminder(c._id, complaintTitle)}
                    >
                      ⏰ Set Reminder
                    </button>

                    <button
                      className="set-reminder-btn"
                      style={{ background: "#ff4d4f", marginLeft: "0.5rem" }}
                      onClick={() => handleCancelReminder(c._id, complaintTitle)}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {Object.values(reminderTimes).some(time => time) && (
            <button
              className="set-reminder-btn"
              style={{ background: "#ff4d4f", marginTop: "1rem" }}
              onClick={handleCancelAll}
            >
              ❌ Cancel All Reminders
            </button>
          )}
        </>
      )}
    </div>
  );
}
