import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/Navbar.css';
import '../assets/fonts.css';
import logo from '../assets/logo.png';
import { useAuthState, useAuthDispatch, logout as logoutAction } from '../context/AuthContext';

const MENU_ITEMS = [
  { label: 'Featured Projects', to: '/projects' },
  { label: 'Search Properties', to: '/searchProperties' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Favourites', to: '/favourites' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const dispatch = useAuthDispatch();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed, clearing client state anyway', err);
    }
    logoutAction(dispatch);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="Easy Homes" />
        </Link>

        {/* Hamburger (mobile) */}
        <button
          className="navbar__toggle"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className="navbar__hamburger" />
        </button>

        {/* Desktop Menu */}
        <nav className="navbar__menu">
          {MENU_ITEMS.map(item => (
            <Link
              key={item.label}
              to={item.to}
              className="navbar__link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="navbar__cta">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="navbar__button">
              Logout
            </button>
          ) : (
            <Link to="/login" className="navbar__button">
              Login/Signup
            </Link>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {open && (
          <nav className="navbar__menu navbar__menu--mobile open">
            {MENU_ITEMS.map(item => (
              <Link
                key={item.label}
                to={item.to}
                className="navbar__link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="navbar__cta navbar__cta--mobile">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="navbar__button">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="navbar__button">
                  Login/Signup
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
);
}

