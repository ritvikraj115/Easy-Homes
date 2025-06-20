import { useAuthState, useAuthDispatch, verifySuccess, loginSuccess } from '../context/AuthContext';
import '../assets/auth.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Otp() {
  const { needsVerification, user } = useAuthState();
  const dispatch                     = useAuthDispatch();
  const location                     = useLocation();
  const navigate                     = useNavigate();
  const email                        = location.state?.email || user?.email;
  const [otp, setOtp]                = useState('');
  const [timer, setTimer]            = useState(60);
  const [canResend, setCanResend]    = useState(false);
  const [message, setMessage]        = useState('');

  useEffect(() => {
    if (timer === 0) return setCanResend(true);
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/verify-otp', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!data.success) {
      return setMessage(data.message);
    }
    // Verified: dispatch appropriate action
    if (needsVerification && !user?.name) {
      // from signup: user object has name/email
      loginSuccess(dispatch, user, data.token);
    } else {
      // from login-only flow
      verifySuccess(dispatch, data.token);
    }
    navigate('/');
  };


    const handleResend = async () => {
        setTimer(60);
        setCanResend(false);
        await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Enter OTP</h2>
                <p className="auth-subtitle">
                    We’ve sent a 6-digit code to <strong>{email}</strong>
                </p>

                <form className="auth-form" onSubmit={handleVerify}>
                    <label>OTP Code</label>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        required
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                    />

                    <button type="submit" className="auth-button">Verify OTP</button>
                </form>

                {message && <p className="auth-error">{message}</p>}

                <div className="auth-footer" style={{ marginTop: '1rem' }}>
                    {canResend
                        ? <button className="auth-link" onClick={handleResend}>Resend OTP</button>
                        : <p className="auth-subtitle">Resend in {timer}s</p>
                    }
                    <p className="auth-text">
                        Wrong email? <Link to="/login">Go back to login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
