// client/src/pages/Signup.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/auth.css';

export default function Signup() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up with Easy Homes</p>

        <form className="auth-form">
          <label>Full Name</label>
          <input type="text" placeholder="Your name" required />

          <label>Email</label>
          <input type="email" placeholder="you@example.com" required />

          <label>Password</label>
          <input type="password" placeholder="Create a password" required />

          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
