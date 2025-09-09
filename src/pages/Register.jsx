// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/register.css";
import API_BASE from "../api.js";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const capitalize = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
    if (!emailPattern.test(formData.email)) {
      toast.error("❌ Please use a valid Gmail or Yahoo email address.");
      setLoading(false);
      return;
    }

    // ✅ Role required
    if (!formData.role) {
      toast.error("❌ Please select a role (Tenant or Landlord).");
      setLoading(false);
      return;
    }

    const trimmedData = {
      firstName: capitalize(formData.firstName.trim()),
      lastName: capitalize(formData.lastName.trim()),
      email: formData.email.trim(),
      password: formData.password.trim(),
      role: formData.role,
    };

    if (trimmedData.password.length < 4) {
      toast.error("❌ Password must be at least 4 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmedData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Show landlord code if provided
        if (trimmedData.role === "landlord" && data.user.landlordCode) {
          toast.info(`🎉 Your landlord code is: ${data.user.landlordCode}. Save it safely!`, {
            autoClose: 8000,
          });
        }

        toast.success("🎉 Registration successful! Please log in.");

        // ✅ Redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 1800);
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth-container">
        <ToastContainer />
        <h2>Register</h2>
        <p>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Log In</Link>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="name-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="toggle-password" onClick={toggleShowPassword}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* ✅ Role selection */}
          <div className="role-selection">
            <label>
              <input
                type="radio"
                name="role"
                value="tenant"
                checked={formData.role === "tenant"}
                onChange={handleChange}
                required
              />
              Tenant
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="landlord"
                checked={formData.role === "landlord"}
                onChange={handleChange}
                required
              />
              Landlord
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Please wait..." : "Sign Up"}
          </button>
        </form>
      </div>
    </section>
  );
}
