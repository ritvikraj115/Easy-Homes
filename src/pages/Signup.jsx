// client/src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthDispatch, startVerification } from '../context/AuthContext';
import '../assets/auth.css';
import SocialLogin from '../components/SocialLogin';

const validateName = (value) => value.trim().length >= 2;
const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePassword = (value) => value.length >= 8;

export default function Signup() {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [isNameValid, setIsNameValid] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isPwdValid, setIsPwdValid]   = useState(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwdFocused, setPwdFocused]   = useState(false);
  const [error, setError]             = useState('');
  const navigate                      = useNavigate();
  const dispatch                      = useAuthDispatch();

  const handleNameChange = e => {
    const v = e.target.value;
    setName(v);
    setIsNameValid(validateName(v));
  };
  const handleEmailChange = e => {
    const v = e.target.value;
    setEmail(v);
    setIsEmailValid(validateEmail(v));
  };
  const handlePasswordChange = e => {
    const v = e.target.value;
    setPassword(v);
    setIsPwdValid(validatePassword(v));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // final sanity check
    if (!validateName(name) || !validateEmail(email) || !validatePassword(password)) {
      setNameFocused(true);
      setEmailFocused(true);
      setPwdFocused(true);
      return;
    }

    const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      return;
    }
    startVerification(dispatch, { name, email });
    navigate('/otp', { state: { email } });
  };

  const nameBorder = nameFocused
    ? (isNameValid ? 'var(--primary)' : 'var(--error)')
    : undefined;
  const emailBorder = emailFocused
    ? (isEmailValid ? 'var(--primary)' : 'var(--error)')
    : undefined;
  const pwdBorder = pwdFocused
    ? (isPwdValid ? 'var(--primary)' : 'var(--error)')
    : undefined;

  const isFormValid = isNameValid && isEmailValid && isPwdValid;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up with Easy Homes</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            required
            value={name}
            onChange={handleNameChange}
            onFocus={() => setNameFocused(true)}
            style={{ borderColor: nameBorder }}
          />
          {nameFocused && isNameValid === false && (
            <p className="auth-error">Name must be at least 2 characters.</p>
          )}

          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={handleEmailChange}
            onFocus={() => setEmailFocused(true)}
            style={{ borderColor: emailBorder }}
          />
          {emailFocused && isEmailValid === false && (
            <p className="auth-error">Please enter a valid email.</p>
          )}

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            required
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setPwdFocused(true)}
            style={{ borderColor: pwdBorder }}
          />
          {pwdFocused && isPwdValid === false && (
            <p className="auth-error">Password must be at least 8 characters.</p>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-button"
            disabled={!isFormValid}
          >
            Sign Up
          </button>
        </form>
        <SocialLogin />

        <p className="auth-footer" style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}



