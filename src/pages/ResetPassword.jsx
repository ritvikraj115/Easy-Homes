// client/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import '../assets/auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token   = searchParams.get('token');
  const email   = searchParams.get('email');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, email, newPassword: password }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message);
    } else {
      setMessage(data.message);
    //   // store JWT, then redirect to dashboard
    //   localStorage.setItem('token', data.token);
      setTimeout(() => navigate('/login'), 1500);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Create a new password</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter your new password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error   && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button type="submit" className="auth-button">Reset Password</button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
