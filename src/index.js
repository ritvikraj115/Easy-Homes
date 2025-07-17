import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css'
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: process.env.REACT_APP_AUTH0_SCOPE, // Dynamically load from .env
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      }}
    >
    <App />
  </Auth0Provider>
  </HelmetProvider>
);

