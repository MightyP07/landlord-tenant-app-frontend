import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker setup
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  let hasReloaded = false; // ensures single reload per deploy

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("[App] SW registered:", reg))
      .catch((err) => console.log("[App] SW registration failed:", err));
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (!hasReloaded && event.data?.type === "NEW_VERSION") {
      hasReloaded = true;

      // Banner styles
      const banner = document.createElement("div");
      banner.innerText = "App updated, reloading...";
      Object.assign(banner.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0f172a",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "8px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
        zIndex: "9999",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        opacity: "0",
        transition: "opacity 0.5s ease",
      });

      document.body.appendChild(banner);
      requestAnimationFrame(() => {
        banner.style.opacity = "1";
      });

      // Fade out and reload
      setTimeout(() => {
        banner.style.opacity = "0";
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 1200);
    }
  });
}