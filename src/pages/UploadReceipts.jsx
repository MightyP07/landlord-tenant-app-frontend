// src/pages/UploadReceipts.jsx
import { useState } from "react";
import axios from "axios";
import API_BASE from "../api.js";
import "./UploadReceipts.css";

export default function UploadReceipts() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file.");

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API_BASE}/api/receipts/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Receipt uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <h1 className="upload-title">Upload Receipt</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <input type="file" onChange={handleFileChange} className="upload-input" />
        <button type="submit" className="upload-btn" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}
