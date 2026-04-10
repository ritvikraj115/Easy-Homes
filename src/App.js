import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'
import './index.css'
import MainLayout from './layouts/MainLayout';
import PlainLayout from './layouts/PlainLayout';
import { trackPageView } from './utils/analytics';

const SearchResults = lazy(() => import('./pages/SearchProperties'));
const Favourites = lazy(() => import('./pages/Favourites'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Otp = lazy(() => import('./pages/Otp'));
const ForgotPassword = lazy(() => import('./pages/ForgetPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PropertyDetails = lazy(() => import('./pages/Propertydetails'));
const Compare = lazy(() => import('./pages/Compare'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Home = lazy(() => import('./pages/Home'));
const KalpavrukshaPage = lazy(() => import('./pages/Kalpavruksha2'));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function RouteFallback() {
  return <div className="min-h-screen bg-white" aria-hidden="true" />;
}

function withSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function App() {
  function ScrollToTop() {
    const { pathname } = useLocation();

  useEffect(() => {
    trackPageView({
      page_path: pathname,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    });
  }, [pathname]);

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  }
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Routes WITH Navbar */}
          <Route element={<MainLayout />}>
            {/* Search page: Buy a Plot */}
            <Route path="/searchProperties" element={withSuspense(<SearchResults />)} />
            {/* You can stub out the other pages for now */}
            <Route path="/" element={withSuspense(<Home />)} />
            <Route path="/about" element={withSuspense(<About />)} />
            <Route path="/contact" element={withSuspense(<Contact />)} />
            <Route path="/enquire" element={<div>Enquire Page</div>} />
            <Route path="/favourites" element={withSuspense(<Favourites />)} />
            <Route path="/login" element={withSuspense(<Login />)} />
            <Route path="/signup" element={withSuspense(<Signup />)} />
            <Route path="/otp" element={withSuspense(<Otp />)} />
            <Route path="/forgot-password" element={withSuspense(<ForgotPassword />)} />
            <Route path="/reset-password" element={withSuspense(<ResetPassword />)} />
          </Route>
          {/* Routes WITHOUT Navbar */}
          <Route element={<PlainLayout />}>
            <Route path="/PropertyDetails" element={withSuspense(<PropertyDetails />)} />
            <Route path="/property/:mlsNumber" element={withSuspense(<PropertyDetails />)} />
            <Route path="/property/:mlsNumber/:slug" element={withSuspense(<PropertyDetails />)} />
            {/* You can add property detail page here too */}
          </Route>
          <Route path="/favourites" element={withSuspense(<Favourites />)} />
          <Route path="/compare" element={withSuspense(<Compare />)} />
          <Route path="/profile" element={withSuspense(<ProfilePage />)} />
          {/* Kalpavruksha page */}
          <Route path="/kalpavruksha" element={withSuspense(<KalpavrukshaPage />)} />
          <Route path="/kalpavruksha2/*" element={<Navigate to="/kalpavruksha" replace />} />
          <Route path="/projects" element={<Navigate to="/kalpavruksha/" replace />} />
          {/* Thankyou page */}
          <Route path="/thank-you" element={withSuspense(<ThankYouPage />)} />
          <Route path="/admin" element={withSuspense(<AdminPanel />)} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;

