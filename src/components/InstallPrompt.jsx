import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const location = useLocation(); // detect route changes

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    // Detect iOS
    if (/iphone|ipad|ipod/.test(userAgent)) setIsIos(true);

    // Chrome/Edge PWA support
    const handler = (e) => {
      e.preventDefault(); // prevent mini-infobar
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Unsupported browsers (excluding iOS)
    if (!("onbeforeinstallprompt" in window) && !/iphone|ipad|ipod/.test(userAgent)) {
      setUnsupported(true);
    }

    // iOS: check if app is installed (standalone)
    const checkStandalone = () => {
      if (
        window.navigator.standalone || 
        window.matchMedia("(display-mode: standalone)").matches
      ) {
        setIsIos(false); // hide iOS prompt
      }
    };

    // Check immediately and on page load
    checkStandalone();
    window.addEventListener("load", checkStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("load", checkStandalone);
    };
  }, []);

  // Update iOS prompt on route change (optional)
  useEffect(() => {
    if (isIos) {
      const checkStandalone = () => {
        if (
          window.navigator.standalone || 
          window.matchMedia("(display-mode: standalone)").matches
        ) {
          setIsIos(false);
        }
      };
      checkStandalone();
    }
  }, [location]);

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