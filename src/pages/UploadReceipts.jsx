// src/pages/UploadReceipts.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../api.js";
import { toast } from "react-toastify"; // ✅ no ToastContainer import
import "./UploadReceipts.css";

export default function UploadReceipts() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return toast.error("⚠️ Please select a file first.");
    if (!token) return toast.error("❌ Authentication failed. Please log in again.");

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch(`${API_BASE}/api/receipts/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed.");

      toast.success("✅ Receipt uploaded successfully!");

      // ✅ Clear input and reset file state
      setFile(null);
      document.getElementById("receiptInput").value = "";
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-receipts-container">
      <h2>Upload Payment Receipt</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input
          id="receiptInput" // ✅ added ID for clearing
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
