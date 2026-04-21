import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext); // Wyrzuciliśmy stąd logout!
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/" onClick={() => setIsOpen(false)}>
          <h5>SCR<span className='shadow'>EE</span>N UNIVERSE</h5>
        </Link>
      </div>

      <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={toggleMenu}><h6>Home</h6></Link></li>
        <li><Link to="/repertuar" onClick={toggleMenu}><h6>Showtimes</h6></Link></li>
        <li><Link to="/o-nas" onClick={toggleMenu}><h6>About us</h6></Link></li>
        
        {/* WERSJA MOBILNA */}
        {user ? (
          <li className="mobile-login">
            <Link to="/profil" onClick={toggleMenu}><h6>Profile ({user.firstName || user.email})</h6></Link>
          </li>
        ) : (
          <li className="mobile-login">
            <Link to="/logowanie" state={{ from: location.pathname }} onClick={toggleMenu}><h6>Login</h6></Link>
          </li>
        )}
      </ul>

      {/* WERSJA DESKTOP */}
      <div className="desktop-login">
        {user ? (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/profil"><h6>{user.firstName || user.email}</h6></Link>
            {/* Przycisk wylogowania usunięty stąd! */}
          </div>
        ) : (
          <Link to="/logowanie" state={{ from: location.pathname }}><h6>Login</h6></Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;