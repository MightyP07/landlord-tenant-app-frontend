// SW-based reminders

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
