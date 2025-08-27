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

// Register SW
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((reg) => {
        console.log("[App] Service worker registered:", reg);
      })
      .catch((err) => console.log("[App] Service worker registration failed:", err));
  });

  // Listen for messages from the SW
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "NEW_VERSION") {
      const toast = document.createElement("div");
      toast.innerText = "✅ App updated to the latest version!";
      toast.style.position = "fixed";
      toast.style.bottom = "20px";
      toast.style.right = "20px";
      toast.style.background = "#16a34a";
      toast.style.color = "white";
      toast.style.padding = "10px 15px";
      toast.style.borderRadius = "8px";
      toast.style.fontSize = "14px";
      toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      toast.style.zIndex = "9999";
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 4000);
    }
  });
}