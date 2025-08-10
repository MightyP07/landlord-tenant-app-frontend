import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
  document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
}, [menuOpen]);


  return (
    <nav className="navbar">
  <div className="navbar-top-row">
    <div className="navbar-logo">🏠 RentEase</div>

    <button className="menu-toggle" onClick={toggleMenu}>
      {menuOpen ? '✖' : '☰'}
    </button>
  </div>

  <div className={`navbar-links ${menuOpen ? 'show' : ''}`}>
    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
    <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
    <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
  </div>
</nav>
  );
}

export default Navbar;