import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChooseRole = () => {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId; // User ID from Register page

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
      const res = await fetch(`https://landlord-tenant-app.onrender.com/api/users/set-role/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`✅ Account created as ${role}!`);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to set role.");
      }
    } catch (err) {
      console.error("❌ Error setting role:", err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <section className="auth">
      <ToastContainer />
      <h2>Choose Your Role</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="radio"
            name="role"
            value="tenant"
            checked={role === "tenant"}
            onChange={(e) => setRole(e.target.value)}
          />
          Tenant
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="landlord"
            checked={role === "landlord"}
            onChange={(e) => setRole(e.target.value)}
          />
          Landlord
        </label>
        <button type="submit">Continue</button>
      </form>
    </section>
  );
};

export default ChooseRole;
