import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE from "../api.js";
import "./addbankdetails.css";

export default function AddBankDetails() {
  const { user, token } = useAuth();
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(true); // start in edit mode if no data

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/landlord/bank-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return; // landlord may not have details yet
        const data = await res.json();
        if (data.bankDetails) {
          setBankName(data.bankDetails.bankName);
          setAccountNumber(data.bankDetails.accountNumber);
          setAccountName(data.bankDetails.accountName);
          setEditMode(false); // switch to locked mode if details exist
        }
      } catch (err) {
        console.error("❌ Fetch bank details error:", err);
      }
    };
    fetchDetails();
  }, [token]);

  if (!user) {
    return <p>⚠️ Please log in to manage bank details.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountName) {
      toast.error("❌ Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/landlord/bank-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bankName, accountNumber, accountName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save bank details");

      toast.success("✅ Bank details saved successfully!");
      setEditMode(false); // lock form after saving
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bankdetails-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <h2>My Bank Details</h2>
      <form className="bankdetails-form" onSubmit={handleSubmit}>
        <label>Bank Name</label>
        <input
          type="text"
          value={bankName}
          disabled={!editMode}
          onChange={(e) => setBankName(e.target.value)}
        />

        <label>Account Name</label>
        <input
          type="text"
          value={accountName}
          disabled={!editMode}
          onChange={(e) => setAccountName(e.target.value)}
        />

        <label>Account Number</label>
        <input
          type="text"
          value={accountNumber}
          disabled={!editMode}
          onChange={(e) => setAccountNumber(e.target.value)}
        />

        {editMode ? (
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Bank Details"}
          </button>
        ) : (
          <p
            className="edit-link"
            onClick={() => setEditMode(true)}
          >
            ✏️ Edit
          </p>
        )}
      </form>
    </div>
  );
}
