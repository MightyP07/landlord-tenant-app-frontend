import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./ProfilePhotoUpload.css";
import API_BASE from "../api.js";

export default function ProfilePhotoUpload({ onUpload }) {
  const { user, token, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState(user?.photo || null);

useEffect(() => {
  // If a new file is selected, show it immediately
  if (file) {
    setPreview(URL.createObjectURL(file));
  } else if (user?.photo) {
    // Add cache-busting timestamp
    setPreview(`${user.photo}?t=${new Date().getTime()}`);
  } else {
    setPreview(null);
  }
}, [user?.photo, file]);


  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(selected.type)) {
      toast.error("❌ Only JPG/PNG files are allowed.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("❌ File size must be less than 5MB.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected)); // temporary preview
  };

  const handleUpload = async () => {
    if (!file) return toast.error("⚠️ Please select a file first.");
    if (!token) return toast.error("❌ Authentication failed.");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`${API_BASE}/api/users/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      toast.success("✅ Photo uploaded successfully!");

      // Persist full backend URL in AuthContext + localStorage
      const freshPhotoUrl = data.photoUrl; // full URL from backend
      setUser({ ...user, photo: freshPhotoUrl });
      localStorage.setItem("auth", JSON.stringify({ user: { ...user, photo: freshPhotoUrl }, token }));

      if (onUpload) onUpload(freshPhotoUrl);

      setFile(null);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-photo-upload">
      <h3>Profile Photo</h3>

      {preview ? (
        <img
          src={preview}
          alt="Profile"
          className="photo-preview clickable"
          onClick={() => setModalOpen(true)}
          onError={(e) => (e.target.src = "/default-avatar.png")} // fallback
        />
      ) : (
        <div className="photo-preview placeholder">No Photo</div>
      )}

      <label className="file-btn">
        {file ? file.name : "Choose Photo"}
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>

      <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <img src={preview} alt="Full Size" className="modal-photo" />
        </div>
      )}
    </div>
  );
}
