// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API_BASE from "../api.js";
import socket from "../utils/socket.js";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { user: null, token: null };
  });

  const loading = false;
  const user = auth.user;
  const token = auth.token;

  // 🔌 Socket connection + notification listener
  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("registerUser", user._id);

      socket.on("notification", (notif) => {
        console.log("📩 New Notification:", notif);
        if ("vibrate" in navigator) navigator.vibrate([300, 200, 300]);
        toast.info(notif.message, {
          autoClose: false,
          closeOnClick: true,
          draggable: true,
        });
      });
    }

    return () => {
      socket.off("notification");
      socket.disconnect();
    };
  }, [user]);

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
      // Persist full photo URL
      const userWithFullPhoto = {
        ...data.user,
        photo: data.user.photo ? `${data.user.photo}` : null,
      };
      updateAuth(userWithFullPhoto, token);
    }
  } catch (err) {
    console.error("❌ Fetch current user error:", err);
  }
};


  const logout = () => {
    localStorage.removeItem("auth");
    setAuth({ user: null, token: null });
    socket.disconnect();
  };

  // ✅ NEW: Fetch fresh user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        updateAuth,
        fetchCurrentUser,
        logout,
        setAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
