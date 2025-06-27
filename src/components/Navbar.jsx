import React, { useState, useRef, useEffect } from 'react';  // import useRef, useEffect
import { Link, useNavigate } from 'react-router-dom';
import '../assets/Navbar.css';
import logo from '../assets/logo.png';
import {
  useAuthState,
  useAuthDispatch,
  logout as logoutAction
} from '../context/AuthContext';

const MENU_ITEMS = [
  { label: 'Featured Projects', to: '/projects' },
  { label: 'Search Properties', to: '/searchProperties' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [openMobile, setOpenMobile] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthState();
  const dispatch = useAuthDispatch();

  // create a ref for the profile dropdown container
  const profileRef = useRef();

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    catch (err) { console.warn('Logout failed', err); }
    logoutAction(dispatch);
    navigate('/');
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        openProfile &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openProfile]);

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
          onClick={() => setOpenMobile(v => !v)}
          aria-label="Toggle menu"
        >
          <span className="navbar__hamburger" />
        </button>

        {/* Desktop Menu */}
        <nav className="navbar__menu">
          {MENU_ITEMS.map(item => (
            <Link key={item.label} to={item.to} className="navbar__link">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Profile (only) */}
        <div className="navbar__actions" ref={profileRef}>
          {isAuthenticated ? (
            <div className="profile-wrapper">
              <button
                className="profile-btn"
                onClick={() => setOpenProfile(v => !v)}
                aria-label="Profile menu"
              >
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </button>
              {openProfile && (
                <div className="profile-dropdown">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setOpenProfile(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/favourites"
                    className="dropdown-item"
                    onClick={() => setOpenProfile(false)}
                  >
                    Your Favourites
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpenProfile(false);
                    }}
                    className="dropdown-item"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__button">
              Login/Signup
            </Link>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {openMobile && (
          <nav className="navbar__menu navbar__menu--mobile open">
            {MENU_ITEMS.map(item => (
              <Link
                key={item.label}
                to={item.to}
                className="navbar__link"
                onClick={() => setOpenMobile(false)}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className="navbar__link"
                  onClick={() => {
                    setOpenMobile(false);
                  }}
                >
                  Your Profile
                </Link>
                <Link
                  to="/favourites"
                  className="navbar__link"
                  onClick={() => {
                    setOpenMobile(false);
                  }}
                >
                  Your Favourites
                </Link>
                <Link
                  to="#logout"
                  className="navbar__link"
                  onClick={() => {
                    handleLogout();
                    setOpenMobile(false);
                  }}
                >
                  Log Out
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                className="navbar__link"        // ← use the same class as the other mobile items
                onClick={() => setOpenMobile(false)}
              >
                Login/Signup
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}




