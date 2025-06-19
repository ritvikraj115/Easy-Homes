// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import '../assets/fonts.css';
import logo from '../assets/logo.png';

const MENU_ITEMS = [
  { label: 'Featured Projects', to: '/projects' },
  { label: 'Search Properties', to: '/search' },      // <-- changed to /search
  { label: 'About',      to: '/about' },
  { label: 'Contact',    to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
          <Link to="/login" className="navbar__button">
            Login/Signup
          </Link>
        </div>
      </div>
    </header>
  );
}
