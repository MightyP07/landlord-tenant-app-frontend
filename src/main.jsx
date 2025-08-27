import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Service worker registered:', reg);

        // Listen for new version message from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'NEW_VERSION') {
            // Force reload immediately
            window.location.reload();
          }
        });
      })
      .catch((err) => console.log('Service worker registration failed:', err));
  });
}