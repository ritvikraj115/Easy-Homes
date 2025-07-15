// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthDispatch, loginSuccess, startVerification } from '../context/AuthContext';
import '../assets/auth.css';
import SocialLogin from '../components/SocialLogin';

const validateEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};
const validatePassword = (value) => {
  return value.length >= 8;
};

export default function Login() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [isEmailValid, setIsEmailValid]       = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(null);
  const [emailFocused, setEmailFocused]       = useState(false);
  const [pwdFocused, setPwdFocused]           = useState(false);
  const [apiError, setApiError]               = useState('');
  const navigate                              = useNavigate();
  const dispatch                              = useAuthDispatch();

  const handleEmailChange = e => {
    const v = e.target.value;
    setEmail(v);
    setIsEmailValid(validateEmail(v));
  };
  const handlePasswordChange = e => {
    const v = e.target.value;
    setPassword(v);
    setIsPasswordValid(validatePassword(v));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');

    // Final check before submit
    if (!validateEmail(email) || !validatePassword(password)) {
      setEmailFocused(true);
      setPwdFocused(true);
      return;
    }

    const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!data.success) {
      setApiError(data.message);
      return;
    }
    if (data.needsVerification) {
      startVerification(dispatch, { email });
      navigate('/otp', { state: { email } });
      return;
    }
    loginSuccess(dispatch, { email }, data.token);
    navigate('/');
  };

  // border-color helpers
  const emailBorder = emailFocused
    ? (isEmailValid ? 'var(--primary)' : 'var(--error)')
    : undefined;
  const pwdBorder = pwdFocused
    ? (isPasswordValid ? 'var(--primary)' : 'var(--error)')
    : undefined;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to your Easy Homes account</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            placeholder="Enter your password"
            required
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setPwdFocused(true)}
            style={{ borderColor: pwdBorder }}
          />
          {pwdFocused && isPasswordValid === false && (
            <p className="auth-error">Password must be at least 8 characters.</p>
          )}

          {apiError && <p className="auth-error">{apiError}</p>}

          <button
            type="submit"
            className="auth-button"
            disabled={!isEmailValid || !isPasswordValid}
          >
            Login
          </button>
        </form>
        <SocialLogin />

        <div className="auth-footer" style={{ marginTop: '1rem' }}>
          <Link to="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </div>

        <p className="auth-footer" style={{ marginTop: '0.5rem' }}>
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}





