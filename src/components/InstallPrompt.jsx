import React, { useEffect, useState } from "react";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) setIsIos(true);

    // Chrome/Edge PWA support
    const handler = (e) => {
      e.preventDefault(); // Prevent Chrome mini-infobar
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Unsupported browsers
    if (!("onbeforeinstallprompt" in window) && !/iphone|ipad|ipod/.test(userAgent)) {
      setUnsupported(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User response to install:", outcome);
    setDeferredPrompt(null);
    setShowButton(false);
  };

  // Chrome/Edge install button
  if (showButton) {
    return (
      <button
        onClick={handleInstallClick}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 9999
        }}
      >
        Install App
      </button>
    );
  }

  // iOS instructions
  if (isIos) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 15px",
          background: "#28a745",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 9999,
        }}
      >
        On iOS, tap the Share button and select "Add to Home Screen".
      </div>
    );
  }

  // Unsupported browsers
  if (unsupported) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 15px",
          background: "#ffc107",
          color: "#000",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 9999,
        }}
      >
        App installation not supported in this browser. Use Chrome or Edge.
      </div>
    );
  }

  return null;
};

export default InstallPrompt;
