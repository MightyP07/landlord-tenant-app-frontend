// SW-based reminders
import API_BASE from "../api.js"

export async function requestPermission() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications.");
    return false;
  }
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  return permission === "granted";
}

// Schedule a notification via Service Worker
export function scheduleNotification(complaintId, title, timeString) {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      payload: { complaintId, title, timeString },
    });
  });
}

// Cancel a scheduled reminder via Service Worker
export function cancelNotification(complaintId) {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: "CANCEL_NOTIFICATION",
      payload: { complaintId },
    });
  });
}

export async function subscribeUser() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Push notifications not supported");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VAPID_PUBLIC_KEY),
  });

  await fetch(`${API_BASE}/api/notifications/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  console.log("✅ User subscribed for push notifications");
}

// helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}