import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import API_BASE from "../api.js";
import "./paymentreceipts.css";

export default function TenantPaymentReceipts() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/payments/my`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch receipts");

      setReceipts(data.receipts || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="receipts-container">
      <h2 className="receipts-title">My Payment History</h2>

      {loading ? (
        <p>Loading receipts...</p>
      ) : receipts.length === 0 ? (
        <p className="no-receipts">You have no payment history yet.</p>
      ) : (
        <div className="receipts-grid">
          {receipts.map((r) => (
            <div key={r._id} className="receipt-card">
              <span className="paid-badge">Paid ✅</span>
              <h3 className="receipt-header">Payment Receipt</h3>
              <p><strong>Amount Paid:</strong> ₦{r.amount}</p>
              <p><strong>Date:</strong> {new Date(r.paidAt || r.uploadedAt).toLocaleString()}</p>
              <p><strong>Reference:</strong> {r.reference}</p>
              <p><strong>Payment Channel:</strong> {r.channel}</p>
              <p><strong>Gateway Response:</strong> {r.gatewayResponse}</p>
              {r.receiptUrl && (
                <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer" className="btn-download">
                  Download Receipt
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
