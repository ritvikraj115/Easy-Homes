import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../assets/Navbar.css';
import logo from '../assets/logo.png';
import {
  useAuthState,
  useAuthDispatch,
  logout as logoutAction
} from '../context/AuthContext';
import { Phone } from 'lucide-react';

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
  const profileRef = useRef();

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    catch (err) { console.warn('Logout failed', err); }
    logoutAction(dispatch);
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (openProfile && profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openProfile]);

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="Easy Homes" />
        </Link>

        <button
          className="navbar__toggle"
          onClick={() => setOpenMobile(v => !v)}
          aria-label="Toggle menu"
        >
          <span className="navbar__hamburger" />
        </button>

        <nav className="navbar__menu">
          {MENU_ITEMS.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'navbar__link active' : 'navbar__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions" ref={profileRef}>

          {/* ←– Added phone pill –– */}
          <div className="navbar__phone-pill">
            <a href="tel:+918988896666" aria-label="Call us">
              <Phone size={16} className="pill-icon" />
              +91 89888 96666
            </a>
          </div>

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
                  <hr style={{margin: "0 10% 0 10%"}}/>
                  <Link
                    to="/favourites"
                    className="dropdown-item"
                    onClick={() => setOpenProfile(false)}
                  >
                    Your Favourites
                  </Link>
                   <hr style={{margin: "0 10% 0 10%"}}/>
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

        {openMobile && (
          <nav className="navbar__menu navbar__menu--mobile open">
            {MENU_ITEMS.map(item => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'navbar__link active' : 'navbar__link'
                }
                onClick={() => setOpenMobile(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className="navbar__link"
                  onClick={() => setOpenMobile(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/favourites"
                  className="navbar__link"
                  onClick={() => setOpenMobile(false)}
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
                className="navbar__link"
                onClick={() => setOpenMobile(false)}
              >
                Login/Signup
              </Link>
            )}

            {/* ←– Added phone pill to mobile menu –– */}
            <div className="navbar__phone-pill">
              <a
                href="tel:+918988896666"
                onClick={() => setOpenMobile(false)}
                aria-label="Call us"
              >
                <Phone size={18} className="pill-icon" />
                +91 89888 96666
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}


