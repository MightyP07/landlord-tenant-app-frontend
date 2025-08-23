// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css";
import API_BASE from "../api.js";

export default function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  // LOGIN HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
    if (!emailPattern.test(email)) {
      toast.error("❌ Please use a valid Gmail or Yahoo email address.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // ✅ Save user to context (also updates localStorage)
      setUser(data.user);

      toast.success("✅ Login successful! Redirecting...");
      
      // ✅ Redirect based on role
      setTimeout(() => {
        if (data.user.role === "landlord") {
          navigate("/profile");
        } else if (data.user.role === "tenant") {
          if (data.user.landlordId) {
            navigate("/profile");
          } else {
            navigate("/connect-landlord");
          }
        } else {
          navigate("/profile"); // fallback
        }
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // PASSWORD RESET HANDLERS
  const handleRequestReset = async () => {
    if (!email) return toast.error("❌ Please enter your email");

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending code");

      toast.success("📧 Reset code sent! Check your email.");
      setResetStep(2);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !resetCode || !newPassword)
      return toast.error("❌ All fields are required");

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: resetCode, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      toast.success("🎉 Password reset successful! You can now log in.");
      setForgotMode(false);
      setResetStep(1);
      setEmail("");
      setResetCode("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="auth">
      <div className="auth-container">
        <ToastContainer />

        {/* LOGIN FORM */}
        {!forgotMode && (
          <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-title">Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="forgot-wrap">
              <span
                className="forgot-link"
                onClick={() => {
                  setForgotMode(true);
                  setResetStep(1);
                }}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" className="btn btn-primary">
              Login
            </button>

            <p className="auth-footer">
              Don’t have an account?{" "}
              <Link to="/register" className="auth-link">
                Sign Up
              </Link>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {forgotMode && (
          <div className="auth-form">
            <h2 className="auth-title">Forgot Password</h2>

            {resetStep === 1 && (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />

                <div className="reset-box">
                  <button onClick={handleRequestReset} className="btn btn-primary">
                    Send Reset Code
                  </button>
                  <button onClick={() => setForgotMode(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {resetStep === 2 && (
              <>
                <input
                  type="text"
                  placeholder="Enter reset code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="auth-input"
                  required
                />

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <div className="reset-box">
                  <button
                    onClick={handleResetPassword}
                    className="btn btn-primary"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      setForgotMode(false);
                      setResetStep(1);
                      setEmail("");
                      setResetCode("");
                      setNewPassword("");
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
