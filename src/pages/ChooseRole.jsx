// src/pages/ChooseRole.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE from "../api.js";

export default function ChooseRole() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Track loading
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId; // Passed from Register page

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User ID missing. Please register again.");
      navigate("/register");
      return;
    }

    if (!role) {
      toast.warn("Please select a role.");
      return;
    }

    setLoading(true); // ✅ Start loading
    const waitingToast = toast.info("Please wait…", { autoClose: false });

    try {
      const res = await fetch(`${API_BASE}/api/users/set-role/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      toast.dismiss(waitingToast); // ✅ Remove "Please wait…" toast

      if (res.ok) {
        // ✅ Landlord: show their special code
        if (role === "landlord" && data.user.landlordCode) {
          toast.info(`🎉 Your landlord code is: ${data.user.landlordCode}. Save it safely!`, {
            autoClose: 8000,
          });
        }

        toast.success(`Role ${role} set! Redirecting to login...`);

        // ✅ Redirect everyone to login
        setTimeout(() => {
          navigate("/login");
        }, 1800);
      } else {
        toast.error(data.message || "Failed to set role.");
        setLoading(false); // ✅ Reset so they can retry
      }
    } catch (err) {
      console.error("❌ Role selection error:", err);
      toast.dismiss(waitingToast);
      toast.error("Something went wrong. Please try again.");
      setLoading(false); // ✅ Reset
    }
  };

  return (
    <section className="auth">
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
          <ToastContainer />
          <h2 className="text-2xl font-bold mb-4 text-center">
            Choose Your Role
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                value="tenant"
                checked={role === "tenant"}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              <span>Tenant</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                value="landlord"
                checked={role === "landlord"}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              <span>Landlord</span>
            </label>
            <button
              type="submit"
              disabled={loading} // ✅ prevent double click
              className={`w-full py-2 rounded transition text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Processing..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
