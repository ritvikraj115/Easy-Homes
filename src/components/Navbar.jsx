// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/Navbar.css';
import '../assets/fonts.css';
import logo from '../assets/logo.png';
import { useAuthState, useAuthDispatch, logout as logoutAction } from '../context/AuthContext';

const MENU_ITEMS = [
  { label: 'Featured Projects',  to: '/projects' },
  { label: 'Search Properties',  to: '/searchProperties'   },
  { label: 'About',              to: '/about'    },
  { label: 'Contact',            to: '/contact'  },
   { label: 'Favourites',            to: '/favourites'  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate        = useNavigate();
  const { isAuthenticated, user } = useAuthState();
  const dispatch       = useAuthDispatch();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed, clearing client state anyway', err);
    }
    // clear global state and localStorage
    logoutAction(dispatch);
    navigate('/');  // redirect to home
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
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="navbar__hamburger" />
        </button>

        {/* Menu Links */}
        <nav className={`navbar__menu ${open ? 'navbar__menu--open' : ''}`}>
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
        </nav>

        {/* CTA */}
        <div className="navbar__cta">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="navbar__button"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="navbar__button"
            >
              Login/Signup
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

