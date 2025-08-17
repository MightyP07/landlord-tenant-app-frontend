// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Always include credentials for cookie-based auth
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Central API base (comes from .env)
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        withCredentials: true
      });
      setUser(res.data.user); // backend now sends { user: {...} }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Error fetching user:", err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
