import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import API_BASE from "../api.js";
import "./paymentReceipts.css";

export default function PaymentReceipts() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState([]);

  const fetchReceipts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payments/my`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch receipts");
      setReceipts(data.receipts || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="receipts-container">
      <h2 className="receipts-title">Payment History</h2>
      {receipts.length === 0 ? (
        <p className="no-receipts">No payment history found.</p>
      ) : (
        <div className="receipts-grid">
          {receipts.map((r) => (
            <div key={r._id} className="receipt-card">
              <span className="paid-badge">Paid ✅</span>
              <h3 className="receipt-header">Payment Receipt</h3>
              <p><strong>Amount Paid:</strong> ₦{r.amount}</p>
              <p><strong>Date:</strong> {new Date(r.paidAt).toLocaleString()}</p>
              <p><strong>Reference:</strong> {r.reference}</p>
              <p><strong>Payment Channel:</strong> {r.channel}</p>
              <p><strong>Gateway Response:</strong> {r.gatewayResponse}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
