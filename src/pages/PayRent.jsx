// src/pages/PayRent.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PaystackButton } from "react-paystack";
import API_BASE from "../api.js";
import { scheduleRentReminder, cancelRentReminder } from "../utils/rentNotification.js";
import "./payrent.css";

export default function PayRent() {
  const { user, token, setAuth } = useAuth();
  const navigate = useNavigate();
  const [pendingRent, setPendingRent] = useState(null);
  const notified = useRef(false);
  const alarmRef = useRef(null);

  // Init alarm
  useEffect(() => {
    alarmRef.current = new Audio("/sounds/alarm.mp3");
    alarmRef.current.loop = true;
  }, []);

  // Fetch tenant data
  const fetchTenantData = async () => {
    try {
      const authToken = token || (() => {
        const stored = localStorage.getItem("auth");
        return stored ? JSON.parse(stored)?.token : null;
      })();

      if (!authToken) throw new Error("No auth token found. Please log in again.");

      const res = await fetch(`${API_BASE}/api/tenants/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch tenant data");

      setPendingRent(data.user.pendingRent || null);
      setAuth(prev => ({ ...prev, user: data.user, token: authToken }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchTenantData();
    const interval = setInterval(fetchTenantData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    if (user.landlordId?.bankDetails?.accountNumber) {
      navigator.clipboard.writeText(user.landlordId.bankDetails.accountNumber);
      toast.success("✅ Account number copied!");
    }
  };

  const handleCancel = () => navigate("/profile");

  // 🔹 Calculate amounts
  const rentAmount = pendingRent?.amount || 0;
  const serviceFee = parseFloat((rentAmount * 0.03).toFixed(2)); // 3%
  const totalToPay = rentAmount + serviceFee;
  const amountInKobo = totalToPay * 100; // for Paystack

  // Paystack enable only if landlord has set rent
  const canPay = !!pendingRent?.amount && !!user.email;

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const componentProps = {
    email: user.email,
    amount: amountInKobo,
    publicKey,
    currency: "NGN",
    text: "Pay Rent",
    onSuccess: async (reference) => {
      toast.success("✅ Payment initiated! Verifying...");
      try {
        const res = await fetch(`${API_BASE}/api/payments/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reference: reference.reference }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Verification failed");

        const receipt = data.receipt;
        toast.success(`✅ Payment verified! Ref: ${receipt.reference}, Amount: ₦${receipt.amount}`);

        if (pendingRent?._id) cancelRentReminder(pendingRent._id);

        stopAlarm(); // stop alarm once paid
        setPendingRent(null);
        setAuth(prev => ({ ...prev, user: { ...prev.user, pendingRent: null } }));
      } catch (err) {
        toast.error(err.message);
      }
    },
    onClose: () => toast.error("❌ Payment cancelled"),
  };

  // Aggressive rent reminder
  useEffect(() => {
    if (pendingRent?.amount && !notified.current) {
      toast.error(`🔥 Rent reminder: ₦${pendingRent.amount} due! Pay now!`, { autoClose: false });

      if (alarmRef.current) {
        alarmRef.current.play().catch(err => console.warn("Autoplay blocked", err));
      }

      if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500, 200, 1000, 200, 1000]);
      }

      if (pendingRent._id) scheduleRentReminder(pendingRent._id, pendingRent.amount);
      notified.current = true;
    } else if (!pendingRent?.amount) {
      notified.current = false;
      stopAlarm();
    }
  }, [pendingRent]);

  const stopAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
    navigator.vibrate(0);
  };

  const handleStopReminder = () => {
    stopAlarm();
    if (pendingRent?._id) cancelRentReminder(pendingRent._id);
    toast.info("❌ Rent reminder stopped");
  };

  return (
    <div className="payrent-container">
      <h2 className="payrent-title">Pay Rent</h2>

      <div className="pending-rent">
        {pendingRent?.amount ? (
          <>
            <p><strong>Landlord set your rent:</strong> ₦{rentAmount}</p>
            <p><strong>Service Fee (3%):</strong> ₦{serviceFee}</p>
            <p><strong>Total to Pay:</strong> ₦{totalToPay}</p>
          </>
        ) : (
          <p className="no-rent">Your landlord has not set the rent yet. Paystack disabled.</p>
        )}
      </div>

      {user.landlordId ? (
        <div className="payrent-card">
          <p><strong>Bank Name:</strong> {user.landlordId?.bankDetails?.bankName || "N/A"}</p>
          <p><strong>Account Name:</strong> {user.landlordId?.bankDetails?.accountName || "N/A"}</p>
          <p><strong>Account Number:</strong> {user.landlordId?.bankDetails?.accountNumber || "N/A"}</p>
          {user.landlordId?.bankDetails?.accountNumber && (
            <button className="copy-btn" onClick={handleCopy}>📋 Copy Account Number</button>
          )}
        </div>
      ) : (
        <p>No landlord connected yet. You cannot pay rent.</p>
      )}

      <div className="payrent-actions">
        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        <PaystackButton
          {...componentProps}
          className={`proceed-btn ${!canPay ? "disabled-btn" : ""}`}
          disabled={!canPay}
        />
        {pendingRent && (
          <button className="stop-alarm-btn" onClick={handleStopReminder}>
            🔊 Stop Alarm
          </button>
        )}
      </div>
    </div>
  );
}
