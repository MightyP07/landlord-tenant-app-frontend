import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './index.css';
import { useState, useEffect } from 'react';

// Force Update Overlay component
function ForceUpdateOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION') {
          setShow(true); // show overlay
        }
      });
    }
  }, []);

  useEffect(() => {
    if (show) {
      // Reload after short delay to ensure overlay is visible
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

function RootApp() {
  return (
    <>
      <App />
      <ForceUpdateOverlay />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

// Register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Service worker registered:', reg);
      })
      .catch((err) => console.log('Service worker registration failed:', err));
  });
}