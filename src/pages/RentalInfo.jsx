import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../api";
import "./rentalinfo.css";

export default function RentalInfo() {
  const { user, token } = useAuth();
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRentalInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tenants/rental-info`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch rental info");

        const data = await res.json();
        setFileUrl(data.fileUrl);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) fetchRentalInfo();
  }, [user, token]);

  const handleDownload = async () => {
    try {
      const res = await fetch(fileUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "rental-info"; // forces real download
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="rentalinfo-container">Loading...</div>;
  if (error) return <div className="rentalinfo-container error">{error}</div>;

  return (
    <div className="rentalinfo-container">
      <h2>Rental Information</h2>

      {fileUrl ? (
        <div className="file-actions">
          {/* View link */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-btn"
          >
            👁 View File
          </a>

          {/* Download button */}
          <button onClick={handleDownload} className="download-btn">
            ⬇ Download Rental Info
          </button>
        </div>
      ) : (
        <p>No rental info available.</p>
      )}
    </div>
  );
}
