import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, LogOut, FileText, Bell, Settings, ShieldAlert, Key } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const leftLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Démarches', path: '/demarches' },
    { name: 'Projet', path: '/projet' },
    { name: 'Services', path: '/services' },
  ];

  const rightLinks = [
    { name: 'Actualités', path: '/actualites' },
    { name: 'Culture', path: '/culture' },
    { name: 'Santé', path: '/sante' },
    { name: 'Contact', path: '/contact' },
  ];

  const allLinks = [...leftLinks, ...rightLinks];

  const handleLogoutClick = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`navbar-header-premium ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container-prem">
        
        {/* Left Desktop Links */}
        <nav className="navbar-menu-desktop left">
          <ul className="navbar-links-prem">
            {leftLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar-link-prem ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Centered Brand Logo */}
        <Link to="/" className="navbar-logo-prem center">
          <img src="/logo_dembeni.svg" alt="Blason de Dembéni" className="navbar-logo-img-vector" />
          <span className="logo-text-p">DEMB<span className="accent-red">É</span>NI</span>
        </Link>

        {/* Right Desktop Links & Action Button */}
        <div className="navbar-right-wrap-desktop">
          <nav className="navbar-menu-desktop right">
            <ul className="navbar-links-prem">
              {rightLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`navbar-link-prem ${isActive(link.path) ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar-actions-desktop" ref={dropdownRef}>
            {user ? (
              <div className="user-dropdown-container">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="user-nav-dropdown-trigger"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.firstname} className="user-nav-avatar" />
                  ) : (
                    <div className="user-nav-avatar-placeholder">
                      {user.firstname.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-nav-firstname">
                    {user.firstname} <span className="dropdown-caret">▼</span>
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="user-nav-dropdown-menu">
                    <div className="dropdown-user-header">
                      <p className="user-full-name">{user.firstname} {user.lastname}</p>
                      <p className="user-role-badge">{user.role === 'admin' ? 'Administrateur' : 'Citoyen de Dembéni'}</p>
                    </div>
                    
                    <div className="dropdown-divider" />
                    
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="dropdown-item admin-console-link"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <ShieldAlert size={16} /> Console Administrateur
                      </Link>
                    )}

                    <Link 
                      to="/compte" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={16} /> Mon profil
                    </Link>

                    <Link 
                      to="/compte?tab=demarches" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FileText size={16} /> Mes démarches
                    </Link>

                    <Link 
                      to="/compte?tab=notifications" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Bell size={16} /> Notifications
                    </Link>

                    <Link 
                      to="/compte?tab=settings" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} /> Paramètres
                    </Link>

                    <div className="dropdown-divider" />

                    <button 
                      onClick={handleLogoutClick}
                      className="dropdown-item logout-btn"
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="visitor-auth-btns">
                <Link to="/login" className="btn-navbar-register">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`navbar-mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <ul className="navbar-mobile-links">
          {allLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`navbar-mobile-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
          
          <li className="mobile-action-li">
            {user ? (
              <div className="mobile-user-nav-wrapper">
                <div className="mobile-user-info-header">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.firstname} className="user-nav-avatar" />
                  ) : (
                    <div className="user-nav-avatar-placeholder">
                      {user.firstname.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="mob-user-fullname">{user.firstname} {user.lastname}</p>
                    <p className="mob-user-role">{user.role === 'admin' ? 'Administrateur' : 'Citoyen'}</p>
                  </div>
                </div>

                <div className="mobile-sublinks-grid">
                  {user.role === 'admin' && (
                    <Link to="/admin" className="mobile-sublink admin" onClick={() => setIsMenuOpen(false)}>
                      <ShieldAlert size={16} /> Console Admin
                    </Link>
                  )}
                  <Link to="/compte" className="mobile-sublink" onClick={() => setIsMenuOpen(false)}>
                    <User size={16} /> Profil
                  </Link>
                  <Link to="/compte?tab=demarches" className="mobile-sublink" onClick={() => setIsMenuOpen(false)}>
                    <FileText size={16} /> Démarches
                  </Link>
                  <Link to="/compte?tab=notifications" className="mobile-sublink" onClick={() => setIsMenuOpen(false)}>
                    <Bell size={16} /> Notifications
                  </Link>
                </div>

                <button 
                  onClick={handleLogoutClick} 
                  className="btn-nav-logout-mob"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            ) : (
              <div className="mobile-visitor-auth-btns">
                <Link 
                  to="/login" 
                  className="btn-navbar-register-mob"
                  onClick={() => setIsMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
