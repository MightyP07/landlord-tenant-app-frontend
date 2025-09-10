// src/pages/Support.jsx
import React from "react";

export default function Support() {
  return (
    <div className="support-page" style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Support</h1>
      <p>
        Need help? I'm available 24/7 on WhatsApp. Click the button below to contact me directly.
      </p>
      <a
        href="https://wa.me/2348104414952"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: "2rem",
          padding: "1rem 2rem",
          backgroundColor: "#25D366",
          color: "white",
          fontSize: "1.2rem",
          fontWeight: "600",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        💬 Chat on WhatsApp
      </a>
    </div>
  );
}
