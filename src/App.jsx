import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'
import TenantProfile from './pages/TenantProfile';
import LandlordProfile from './pages/LandlordProfile';
import ChooseRole from './pages/ChooseRole';


function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/tenant-profile" element={<TenantProfile />}/>
        <Route path="/landlord-profile" element={<LandlordProfile />}/>
        <Route path="/choose-role" element={<ChooseRole />}/>
      </Routes>
    </Router>
  );
}

export default App;