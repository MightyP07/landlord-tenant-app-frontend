// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";
import API_BASE from "../api.js";

axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ Load user immediately from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ✅ We no longer need loading for initial fetch since we trust localStorage
  const loading = false;
  // Optional: manual refresh from backend
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("❌ Fetch current user error:", err);
      // do NOT clear localStorage on error
    }
  };

  // ✅ Wrapper to update state + localStorage
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    else localStorage.removeItem("user");
  };

  // ✅ Logout helper
  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      updateUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser: updateUser, fetchCurrentUser, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
