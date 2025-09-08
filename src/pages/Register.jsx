// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/register.css";
import API_BASE from "../api.js";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Capitalize first letter of each word in a string
  const capitalize = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
    if (!emailPattern.test(formData.email)) {
      toast.error("❌ Please use a valid Gmail or Yahoo email address.");
      setLoading(false);
      return;
    }

    // Trim and capitalize names before sending to backend
    let trimmedData = {
      firstName: capitalize(formData.firstName.trim()),
      lastName: capitalize(formData.lastName.trim()),
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    // ✅ Enforce minimum password length
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
        toast.success("🎉 Registration successful! Redirecting...");

        // ✅ Redirect to ChooseRole
        setTimeout(() => {
          navigate("/choose-role", { state: { userId: data.user._id } });
        }, 1200);
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Please wait..." : "Sign Up"}
          </button>
        </form>
      </div>
    </section>
  );
}
