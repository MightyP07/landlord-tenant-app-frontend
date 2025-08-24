// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ViewComplaints from "./pages/ViewComplaints.jsx"
import LogComplaints from "./pages/LogComplaints.jsx"

// ✅ Inner app so we can access auth state
function AppRoutes() {
  const { user, loading } = useAuth();

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
      </Route>

      <Route element={<ProtectedRoute allowedRole="landlord" />}>
  <Route path="/manage-tenants" element={<ManageTenants />} />
</Route>

<Route element={<ProtectedRoute allowedRole="landlord" />}>
  <Route path="/viewcomplaints" element={<ViewComplaints />} />
</Route>

<Route element={<ProtectedRoute allowedRole="tenant" />}>
  <Route path="/complaints" element={<LogComplaints />} />
</Route>


    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}