import { createContext, useContext, useState } from "react";
import API_BASE from "../api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { user: null, token: null };
  });

  const loading = false;

  const user = auth.user;
  const token = auth.token;

  const updateAuth = (userData, tokenData) => {
    const newAuth = { user: userData, token: tokenData ?? auth.token };
    setAuth(newAuth);

    if (newAuth.user && newAuth.token) {
      localStorage.setItem("auth", JSON.stringify(newAuth));
    } else {
      localStorage.removeItem("auth");
    }
  };

  const setUser = (newUser) => updateAuth(newUser, auth.token);

  const fetchCurrentUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        updateAuth(data.user, token);
      }
    } catch (err) {
      console.error("❌ Fetch current user error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth({ user: null, token: null });
  };

  // ✅ Debug log
  console.log("AuthContext value:", {
    user,
    token,
    setUser,
    updateAuth,
    fetchCurrentUser,
    logout,
    setAuth,
    loading,
  });

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, updateAuth, fetchCurrentUser, logout, setAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
