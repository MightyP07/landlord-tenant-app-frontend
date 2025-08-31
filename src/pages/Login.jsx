import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css";
import API_BASE from "../api.js";

export default function Login() {
  const { updateAuth } = useAuth(); // ✅ use updateAuth to store user + token
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showLandlordCodeInput, setShowLandlordCodeInput] = useState(false);
  const [landlordCode, setLandlordCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // -------------------- LOGIN HANDLER --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
    if (!emailPattern.test(email)) {
      toast.error("❌ Please use a valid Gmail or Yahoo email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // ✅ store user + token in context + localStorage
      updateAuth(data.user, data.token);
      toast.success("✅ Login successful!");

      if (data.user.role === "landlord") {
        setTimeout(() => navigate("/profile"), 1000);
      } else if (data.user.role === "tenant") {
        if (data.user.landlordId) {
          setTimeout(() => navigate("/profile"), 1000);
        } else {
          setShowLandlordCodeInput(true);
        }
      } else {
        setTimeout(() => navigate("/profile"), 1000);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- TENANT CONNECT LANDLORD --------------------
  const handleConnectLandlord = async () => {
    if (!landlordCode) return toast.error("❌ Please enter a landlord code.");
    setLoading(true);

    try {
      const stored = localStorage.getItem("auth");
      const token = stored ? JSON.parse(stored)?.token : null;

      const res = await fetch(`${API_BASE}/api/tenants/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ landlordCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");

      updateAuth(data.user, data.token); // ✅ update user + token
      toast.success("✅ Landlord connected successfully!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- PASSWORD RESET --------------------
  const handleRequestReset = async () => {
    if (!email) return toast.error("❌ Please enter your email");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending code");

      toast.success("📧 Reset code sent! Check your email.");
      setResetStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !resetCode || !newPassword)
      return toast.error("❌ All fields are required");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      setLoading(false);
    }
  };

  // -------------------- RENDER --------------------
  return (
    <section className="auth">
      <div className="auth-container">
        <ToastContainer />

        {/* LOGIN FORM */}
        {!forgotMode && !showLandlordCodeInput && (
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>

            <p className="auth-footer">
              Don’t have an account?{" "}
              <Link to="/register" className="auth-link">
                Sign Up
              </Link>
            </p>
          </form>
        )}

        {/* TENANT LANDLORD CODE INPUT */}
        {showLandlordCodeInput && (
          <div className="auth-form">
            <h2 className="auth-title">Enter Landlord Code</h2>

            <input
              type="text"
              placeholder="Landlord Code"
              value={landlordCode}
              onChange={(e) => setLandlordCode(e.target.value)}
              className="auth-input"
            />

            <div className="reset-box">
              <button
                onClick={handleConnectLandlord}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Connect Landlord"}
              </button>
              <button
                onClick={() => setShowLandlordCodeInput(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
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
                  <button
                    onClick={handleRequestReset}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>
                  <button
                    onClick={() => setForgotMode(false)}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
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
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
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
                    disabled={loading}
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
