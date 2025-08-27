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

  // listen for "NEW_VERSION" message
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "NEW_VERSION") {
      console.log("[App] New version detected...");

      // Create update banner
      const banner = document.createElement("div");
      banner.innerText = "App updated, reloading...";
      banner.style.position = "fixed";
      banner.style.bottom = "20px";
      banner.style.left = "50%";
      banner.style.transform = "translateX(-50%)";
      banner.style.background = "#0f172a";
      banner.style.color = "#fff";
      banner.style.padding = "10px 20px";
      banner.style.borderRadius = "8px";
      banner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      banner.style.zIndex = "9999";
      banner.style.fontFamily = "sans-serif";
      banner.style.opacity = "0";
      banner.style.transition = "opacity 0.6s ease";

      document.body.appendChild(banner);

      requestAnimationFrame(() => {
        banner.style.opacity = "1";
      });

      setTimeout(() => {
        banner.style.opacity = "0";
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }, 1200);
    }
  });
}