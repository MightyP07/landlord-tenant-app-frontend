import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE from "../api.js";
import { scheduleRentReminder, cancelRentReminder } from "../utils/rentNotification.js";
import "./payrent.css";

export default function PayRent() {
  const { user, token, setAuth } = useAuth();
  const navigate = useNavigate();
  const [pendingRent, setPendingRent] = useState(null);
  const notified = useRef(false);

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

  if (!user || !user.landlordId?.bankDetails) {
    return (
      <div className="payrent-container">
        <p>No landlord bank details found. Connect to a landlord first.</p>
      </div>
    );
  }

  const { bankName, accountName, accountNumber } = user.landlordId.bankDetails;

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("✅ Account number copied!");
  };

  const handleCancel = () => navigate("/profile");

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const amountInKobo = pendingRent ? Number(pendingRent.amount.toString().replace(/,/g, "")) * 100 : 0;

  // Paystack inline payment
  const handlePay = () => {
    if (!pendingRent || !user.email) return;
    if (!window.PaystackPop) {
      toast.error("❌ Paystack not loaded. Refresh the page.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: user.email,
      amount: amountInKobo,
      currency: "NGN",
      onClose: () => toast.error("❌ Payment cancelled"),
      callback: async function (response) {
        toast.success("✅ Payment initiated! Verifying...");
        try {
          const res = await fetch(`${API_BASE}/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reference: response.reference }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Verification failed");

          const receipt = data.receipt;
          toast.success(`✅ Payment verified! Reference: ${receipt.reference}, Amount: ₦${receipt.amount}`);

          if (pendingRent?._id) cancelRentReminder(pendingRent._id);
          setPendingRent(null);
          setAuth(prev => ({ ...prev, user: { ...prev.user, pendingRent: null } }));
        } catch (err) {
          toast.error(err.message);
        }
      },
    });
    handler.openIframe();
  };

  // Aggressive rent reminder
  useEffect(() => {
    if (pendingRent && !notified.current) {
      toast.error(`🔥 Rent reminder: ₦${pendingRent.amount} due! Pay now!`, { autoClose: false });
      if (pendingRent._id) scheduleRentReminder(pendingRent._id, pendingRent.amount);
      notified.current = true;
    } else if (!pendingRent) {
      notified.current = false;
    }
  }, [pendingRent]);

  const handleStopReminder = () => {
    if (pendingRent?._id) {
      cancelRentReminder(pendingRent._id);
      toast.info("❌ Rent reminder stopped");
    }
  };

  return (
    <div className="payrent-container">
      <h2 className="payrent-title">Pay Rent</h2>

      {pendingRent && (
        <div className="pending-rent">
          <p>
            <strong>Landlord set your rent:</strong> ₦{pendingRent.amount}
          </p>
        </div>
      )}

      <div className="payrent-card">
        <p><strong>Bank Name:</strong> {bankName || "N/A"}</p>
        <p><strong>Account Name:</strong> {accountName || "N/A"}</p>
        <p><strong>Account Number:</strong> {accountNumber || "N/A"}</p>
        {accountNumber && (
          <button className="copy-btn" onClick={handleCopy}>📋 Copy Account Number</button>
        )}
      </div>

      <div className="payrent-actions">
        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        <button
          className={`proceed-btn ${!pendingRent ? "disabled-btn" : ""}`}
          disabled={!pendingRent}
          onClick={handlePay}
        >
          Pay Rent
        </button>
        {pendingRent && (
          <button className="stop-alarm-btn" onClick={handleStopReminder}>
            🔊 Stop Alarm
          </button>
        )}
      </div>
    </div>
  );
}
