import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./index.css";

// Render React app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ==================== Service Worker Setup ====================
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  let hasReloaded = false;

  const showUpdateBanner = () => {
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
    requestAnimationFrame(() => (banner.style.opacity = "1"));

    setTimeout(() => {
      banner.style.opacity = "0";
      setTimeout(() => window.location.reload(), 500);
    }, 1200);
  };

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js");
      console.log("[App] SW registered:", reg);

      // If a waiting SW exists, activate it immediately
      if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });

      // Listen for new updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller &&
            !hasReloaded
          ) {
            hasReloaded = true;
            showUpdateBanner();
          }
        });
      });
    } catch (err) {
      console.error("[App] SW registration failed:", err);
    }
  });
}
