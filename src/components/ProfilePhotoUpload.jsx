import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./ProfilePhotoUpload.css";
import API_BASE from "../api.js";

export default function ProfilePhotoUpload({ currentPhoto, onUpload }) {
  const { user, token, setUser } = useAuth(); // ✅ get from context
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentPhoto || null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setPreview(currentPhoto || null);
  }, [currentPhoto]);

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
    setPreview(URL.createObjectURL(selected));
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
      setPreview(data.photoUrl);

      // ✅ persist in AuthContext + localStorage
      const updatedUser = { ...user, photo: data.photoUrl };
      setUser(updatedUser);
      localStorage.setItem("auth", JSON.stringify({ user: updatedUser, token }));

      if (onUpload) onUpload(data.photoUrl);
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
        />
      ) : (
        <div className="photo-preview placeholder">No Photo</div>
      )}

      {/* File input */}
      <label className="file-btn">
        {file ? file.name : "Choose Photo"}
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>

      <button
        className="upload-btn"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>

      {/* Modal for full-size photo */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <img src={preview} alt="Full Size" className="modal-photo" />
        </div>
      )}
    </div>
  );
}
