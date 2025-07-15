// client/src/components/SocialLogin.jsx
import React, { memo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import googleImg from '../assets/google.png';
import facebookImg from '../assets/facebook.png';
import appleImg from '../assets/apple.png';
import '../assets/auth.css';
import axios from 'axios';
import { useAuthDispatch, loginSuccess } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SocialLogin({ onSuccess }) {
  const { loginWithPopup, getIdTokenClaims } = useAuth0();
  const dispatch = useAuthDispatch();
  const navigate = useNavigate();

  const handleLogin = async (provider) => {
    try {
      // 1) Open the Auth0 popup
      await loginWithPopup({ connection: provider });

      // 2) Grab the raw ID token
      const claims = await getIdTokenClaims();
      const idToken = claims.__raw;

      // 3) Send it to our backend for verification & user‑upsert
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth0/verify-token`,
        { idToken },
        { withCredentials: true }
      );
      if (response.data.success) {
        loginSuccess(dispatch, response.data.user, response.data.token);
        navigate('/');
        if (onSuccess) onSuccess(response.data.user);
      }
    } catch (err) {
      console.error('Auth0 login failed:', err);
    }
  };

  return (
    <div className="social-login">
      <p className="social-text">Or continue with</p>
      <div className="social-buttons">
        <button
          type="button"
          className="social-button google"
          onClick={() => handleLogin('google-oauth2')}
        >
          <img
            src={googleImg}
            alt="Google"
            className="social-icon"
            width="32"
            height="32"
            loading="lazy"
            decoding="async"
          />
        </button>
        <button
          type="button"
          className="social-button facebook"
          onClick={() => handleLogin('facebook')}
        >
          <img
            src={facebookImg}
            alt="Facebook"
            className="social-icon"
            width="32"
            height="32"
            loading="lazy"
            decoding="async"
          />
        </button>
        <button
          type="button"
          className="social-button apple"
          onClick={() => handleLogin('apple')}
        >
          <img
            src={appleImg}
            alt="Apple"
            className="social-icon"
            width="32"
            height="32"
            loading="lazy"
            decoding="async"
          />
        </button>
      </div>
    </div>
  );
}

export default memo(SocialLogin);
