import React, { useEffect, useState } from "react";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Stop Chrome's default mini-infobar
      e.preventDefault();
      // Save the event so we can trigger it later
      setDeferredPrompt(e);
      // Show your custom install button
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // Show browser install prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User response to install:", outcome);
    setDeferredPrompt(null);
    setShowButton(false);
  };

  return (
    <>
      {showButton && (
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
            cursor: "pointer"
          }}
        >
          Install App
        </button>
      )}
    </>
  );
};

export default InstallPrompt;