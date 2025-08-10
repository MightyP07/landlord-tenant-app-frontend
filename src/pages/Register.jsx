import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedData = {
      name: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    try {
      const res = await fetch("https://landlord-tenant-app.onrender.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(trimmedData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Registration success:", data);
        toast.success("🎉 Registration successful!");
        setTimeout(() => {
          navigate("/choose-role", { state: { userId: data.user._id } });
        }, 1500);
      } else {
        console.error("❌ Backend error:", data);
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
      toast.error("An error occurred. Check your connection or try again.");
    }
  };

  return (
    <section className="auth">
      <ToastContainer />
      <h2>Register</h2>
      <p className="loginButt">
        Have an account? <Link to="/login" className="loginButton">Log In</Link>
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </section>
  );
};

export default Register;
