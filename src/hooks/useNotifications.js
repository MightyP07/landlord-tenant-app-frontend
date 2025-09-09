// src/hooks/useNotifications.js
import { useEffect } from "react";
import socket from "../utils/socket.js";
import { toast } from "react-toastify";

export function useNotifications() {
  useEffect(() => {
    if (!socket.connected) return;

    socket.on("rentPaid", (data) => {
      toast.success(`💰 Tenant ${data.tenantName} paid ₦${data.amount}`);
    });

    socket.on("newComplaint", (data) => {
      toast.error(`⚠️ Complaint: ${data.message}`);
    });

    return () => {
      socket.off("rentPaid");
      socket.off("newComplaint");
    };
  }, []);
}
