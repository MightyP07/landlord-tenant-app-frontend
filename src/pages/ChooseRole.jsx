// src/pages/ChooseRole.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE from "../api.js";
import { useAuth } from "../context/AuthContext";

export default function ChooseRole() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth(); // ✅ update context after role set

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

    try {
      const res = await fetch(`${API_BASE}/api/users/set-role/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Update AuthContext immediately
        setUser(data.user);

        toast.success(`✅ Account created as ${role}! Redirecting...`);
        setTimeout(() => {
          if (role === "landlord") navigate("/profile");
          else if (role === "tenant") navigate("/connect-landlord");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to set role.");
      }
    } catch (err) {
      console.error("❌ Role selection error:", err);
      toast.error("Something went wrong. Please try again.");
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
              />
              <span>Landlord</span>
            </label>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
