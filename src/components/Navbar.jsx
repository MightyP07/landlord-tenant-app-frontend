// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Navbar.css";
import API_BASE from "../api.js";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const handleLogout = async () => {
    toast.info("Please wait, logging out...");
    try {
      await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("❌ Logout failed:", err);
      toast.error("Logout failed. Try again.");
    }
  };

  const renderLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
        </>
      );
    }

    if (user.role === "tenant") {
      return (
        <>
          <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
          <Link to="/complaints" onClick={() => setMenuOpen(false)}>Log a complaint</Link>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              handleLogout();
            }}
          >
            Logout
          </Link>
        </>
      );
    }

    if (user.role === "landlord") {
      return (
        <>
          <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
          <Link to="/view-complaints" onClick={() => setMenuOpen(false)}>View Complaints</Link>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              handleLogout();
            }}
          >
            Logout
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <nav className="navbar">
      <ToastContainer />
      <div className="navbar-top-row">
        <div className="navbar-logo">🏠 RentEase</div>
        <button className="menu-toggle" onClick={toggleMenu}>
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      <div className={`navbar-links ${menuOpen ? "show" : ""}`}>
        {renderLinks()}
      </div>
    </nav>
  );
}

export default Navbar;
