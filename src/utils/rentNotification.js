import { requestPermission, scheduleNotification, cancelNotification } from "./notification.js";

const alarmRefs = {};

export async function scheduleRentReminder(rentId, amount) {
  const granted = await requestPermission();
  if (!granted) return;
  if (!navigator.serviceWorker.controller) return;

  const delay = 1000; // aggressive immediate ping
  setTimeout(() => {
    scheduleNotification(rentId, `🔥 Rent due: ₦${amount}`);
    const alarm = new Audio("/sounds/alarm.mp3");
    alarm.loop = true;
    alarm.play().catch((e) => console.error("Alarm play error:", e));
    alarmRefs[rentId] = alarm;
  }, delay);

  // show notification
  navigator.serviceWorker.controller.postMessage({
    type: "PLAY_ALARM",
    payload: { title: rentId, amount },
  });

  // optional local toast
  toast.error(`🔥 Rent due: ₦${amount}`, { autoClose: false });
}

export function stopRentAlarm(rentId) {
  const alarm = alarmRefs[rentId];
  if (alarm) {
    alarm.pause();
    alarm.currentTime = 0;
    delete alarmRefs[rentId];
  }
}

export function cancelRentReminder(rentId) {
  cancelNotification(rentId);
  stopRentAlarm(rentId);
}
