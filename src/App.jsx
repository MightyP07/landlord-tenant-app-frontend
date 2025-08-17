// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChooseRole from './pages/ChooseRole';
import ProtectedRoute from "./pages/ProtectedRoute";
import Profile from "./pages/Profile"; // ✅ new

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/choose-role" element={<ChooseRole />} />

          {/* ✅ Protected Profile */}
          <Route element={<ProtectedRoute />}>
  <Route path="/profile" element={<Profile />} />
</Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
