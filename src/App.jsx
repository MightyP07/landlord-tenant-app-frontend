import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";
import Profile from "./pages/Profile";
import ConnectLandlord from "./pages/ConnectLandlord";
import ManageTenants from "./pages/ManageTenants.jsx";
import ViewComplaints from "./pages/ViewComplaints.jsx";
import LogComplaints from "./pages/LogComplaints.jsx";
import InstallPrompt from "./components/InstallPrompt";
import DarkModeToggle from "./components/DarkModeToggle.jsx";
import { useEffect } from "react";
import ViewReceipts from "./pages/ViewReceipts.jsx";
import TenantReceipts from "./pages/TenantReceipts.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddBankDetails from "./pages/AddBankDetails";
import PayRent from "./pages/PayRent.jsx";
import { useNotifications } from "./hooks/useNotifications.js";
import UnderConstruction from "../src/components/UnderConstruction.jsx";
import PaymentReceipts from "./pages/PaymentReceipts.jsx";

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

      {/* Protected: any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Protected: only tenants */}
      <Route element={<ProtectedRoute allowedRole="tenant" />}>
        <Route path="/connect-landlord" element={<ConnectLandlord />} />
        <Route path="/complaints" element={<LogComplaints />} />
        <Route path="/pay-rent" element={<PayRent />} />
        <Route path="/payment-receipt" element={<PaymentReceipts />} />
      </Route>

      {/* Protected: only landlords */}
      <Route element={<ProtectedRoute allowedRole="landlord" />}>
        <Route path="/manage-tenants" element={<ManageTenants />} />
        <Route path="/viewcomplaints" element={<ViewComplaints />} />
        <Route path="/view-receipts" element={<ViewReceipts />} />
        <Route path="/my-receipts" element={<TenantReceipts />} />
        <Route path="/add-bank-details" element={<AddBankDetails />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  // ✅ Toggle this flag to show/hide the Under Construction screen
  const underConstruction = false;
  useNotifications();

  return (
    <AuthProvider>
      <Router>
        {underConstruction ? (
          <UnderConstruction />
        ) : (
          <>
            <Navbar />
            <AppRoutes />
            <InstallPrompt />
            <DarkModeToggle />
            <ToastContainer position="top-right" autoClose={3000} />
          </>
        )}
      </Router>
    </AuthProvider>
  );
}
