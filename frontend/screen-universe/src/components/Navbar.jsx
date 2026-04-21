import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Opcjonalnie zamykamy menu na telefonie po zmianie języka:
    // setIsOpen(false); 
  };

  // Minikomponent do wyświetlania przycisków języka
  const LangSwitcher = ({ isMobile }) => (
    <div className={`lang-switcher ${isMobile ? 'mobile-lang' : 'desktop-lang'}`}>
      <button 
        className={i18n.language === 'pl' ? 'active' : ''} 
        onClick={() => changeLanguage('pl')}
      >
        PL
      </button>
      <span className="lang-separator">|</span>
      <button 
        className={i18n.language === 'en' ? 'active' : ''} 
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );

  return (
    <nav className="navbar">
      {/* LEWA STRONA */}
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

      {/* ŚRODEK */}
      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={toggleMenu}><h6>{t('navbar.home')}</h6></Link></li>
        <li><Link to="/repertuar" onClick={toggleMenu}><h6>{t('navbar.showtimes')}</h6></Link></li>
        <li><Link to="/o-nas" onClick={toggleMenu}><h6>{t('navbar.about')}</h6></Link></li>
        
        {/* WERSJA MOBILNA LOGOWANIA */}
        {user ? (
          <li className="mobile-login">
            <Link to="/profil" onClick={toggleMenu}><h6>{t('navbar.profile')} ({user.firstName || user.email})</h6></Link>
          </li>
        ) : (
          <li className="mobile-login">
            <Link to="/logowanie" state={{ from: location.pathname }} onClick={toggleMenu}><h6>{t('navbar.login')}</h6></Link>
          </li>
        )}

        {/* PRZEŁĄCZNIK JĘZYKA DLA WERSJI MOBILNEJ */}
        <li className="mobile-lang-container">
          <LangSwitcher isMobile={true} />
        </li>
      </ul>

      {/* PRAWA STRONA */}
      <div className="desktop-right-section">
        <div className="desktop-login">
          {user ? (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link to="/profil"><h6>{user.firstName || user.email}</h6></Link>
            </div>
          ) : (
            <Link to="/logowanie" state={{ from: location.pathname }}><h6>{t('navbar.login')}</h6></Link>
          )}
        </div>
        
        {/* PRZEŁĄCZNIK JĘZYKA DLA WERSJI DESKTOP */}
        <div className="langContainer">
          <LangSwitcher isMobile={false} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;