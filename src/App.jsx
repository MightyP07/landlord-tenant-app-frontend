// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChooseRole from "./pages/ChooseRole";
import ProtectedRoute from "./pages/ProtectedRoute";
import Profile from "./pages/Profile";
import ConnectLandlord from "./pages/ConnectLandlord";
import ManageTenants from "./pages/ManageTenants.jsx";
import ViewComplaints from "./pages/ViewComplaints.jsx";
import LogComplaints from "./pages/LogComplaints.jsx";
import InstallPrompt from "./components/InstallPrompt";
import DarkModeToggle from "./components/DarkModeToggle.jsx";
import { useEffect } from "react";
import UploadReceipts from "./pages/UploadReceipts.jsx";
import ViewReceipts from "./pages/ViewReceipts.jsx";

// ✅ Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Inner app so we can access auth state
function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Redirect logged-in users away from public pages to Profile
  useEffect(() => {
    if (!loading && user) {
      const publicPaths = ["/", "/login", "/register"];
      if (publicPaths.includes(window.location.pathname)) {
        navigate("/profile", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/choose-role" element={<ChooseRole />} />

      {/* Protected: any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Protected: only tenants */}
      <Route element={<ProtectedRoute allowedRole="tenant" />}>
        <Route path="/connect-landlord" element={<ConnectLandlord />} />
        <Route path="/complaints" element={<LogComplaints />} />
        <Route path="/upload-receipts" element={<UploadReceipts />} /> {/* NEW */}
      </Route>

      {/* Protected: only landlords */}
      <Route element={<ProtectedRoute allowedRole="landlord" />}>
        <Route path="/manage-tenants" element={<ManageTenants />} />
        <Route path="/viewcomplaints" element={<ViewComplaints />} />
        <Route path="/view-receipts" element={<ViewReceipts />} /> {/* NEW */}
      </Route>
    </Routes>
  );
}

// ✅ Final App with Navbar, Routes, InstallPrompt, Dark Mode Toggle & Toasts
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
        <InstallPrompt /> {/* Floating install button */}
        <DarkModeToggle /> {/* Floating dark mode toggle */}
        <ToastContainer position="top-right" autoClose={3000} /> {/* Toasts */}
      </Router>
    </AuthProvider>
  );
}
