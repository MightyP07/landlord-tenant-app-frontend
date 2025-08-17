// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();

      if (!loginRes.ok) throw new Error(loginData.message || "Invalid credentials");

      // Set user in context directly from login response
      setUser(loginData.user);

      toast.success("✅ Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // PASSWORD RESET - STEP 1
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

  // PASSWORD RESET - STEP 2
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <ToastContainer />
        {/* LOGIN FORM */}
        {!forgotMode && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <span
                className="absolute right-2 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div
              className="cursor-pointer mb-4 text-blue-600 hover:text-blue-800 text-sm text-right"
              onClick={() => {
                setForgotMode(true);
                setResetStep(1);
              }}
            >
              Forgot Password?
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Login
            </button>

            <p className="mt-4 text-center text-sm">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign Up
              </Link>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {forgotMode && (
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Forgot Password
            </h2>

            {resetStep === 1 && (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                  required
                />
                <button
                  onClick={handleRequestReset}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition mb-2"
                >
                  Send Reset Code
                </button>
                <button
                  onClick={() => setForgotMode(false)}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </>
            )}

            {resetStep === 2 && (
              <>
                <input
                  type="text"
                  placeholder="Enter reset code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                  required
                />
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition mb-2"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    setForgotMode(false);
                    setResetStep(1);
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
