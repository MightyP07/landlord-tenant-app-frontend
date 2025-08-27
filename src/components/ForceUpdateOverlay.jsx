import { useState, useEffect } from "react";

export default function ForceUpdateOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION') {
          setShow(true);  // show overlay
        }
      });
    }
  }, []);

  useEffect(() => {
    if (show) {
      // Force reload after a short delay to ensure overlay is visible
      setTimeout(() => window.location.reload(), 1000);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      fontSize: "1.5rem",
      textAlign: "center",
      padding: "20px",
    }}>
      <p>New version available!</p>
      <p>Refreshing app to update...</p>
    </div>
  );
}