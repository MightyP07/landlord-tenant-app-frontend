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

// ✅ Service Worker setup
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.log("[App] Service worker registered:", reg);
      })
      .catch((err) =>
        console.log("[App] Service worker registration failed:", err)
      );
  });

  // ✅ Handle new version messages
  let hasReloaded = false; // prevent infinite loop
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "NEW_VERSION") {
      if (!hasReloaded) {
        hasReloaded = true;
        console.log("[App] New version detected, reloading once...");
        window.location.reload();
      } else {
        console.log("[App] Reload already performed, skipping...");
      }
    }
  });
}