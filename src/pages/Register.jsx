// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import "../styles/register.css"
import API_BASE from "../api";


const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
  if (!emailPattern.test(formData.email)) {
    toast.error("Please use a valid Gmail or Yahoo email address.");
    return;
  }

    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(trimmedData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Registration successful!");
        setTimeout(() => {
          navigate("/choose-role", { state: { userId: data.user._id } });
        }, 1500);
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
  <section className="auth">
    <div>
      <div>
        <ToastContainer />
        <h2>Register</h2>
        <p>
          Already have an account?{" "}
          <Link to="/login">Log In</Link>
        </p>

        <form onSubmit={handleSubmit}>
          {/* First + Last Name beside each other */}
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
  <span onClick={toggleShowPassword}>
    {showPassword ? "🙈" : "👁️"}
  </span>
</div>


          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  </section>
);

}
