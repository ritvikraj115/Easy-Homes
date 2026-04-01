import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { initializeAnalytics } from './utils/analytics';

initializeAnalytics();

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

