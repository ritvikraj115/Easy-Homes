import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SearchResults from './pages/SearchProperties';  // make sure this exists
import Favourites from './pages/Favourites';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Otp from './pages/Otp';
import { AuthProvider } from './context/AuthContext'
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import './index.css'
import MainLayout from './layouts/MainLayout';
import PlainLayout from './layouts/PlainLayout';
import PropertyDetails from './pages/Propertydetails';
import Compare from './pages/Compare';
import ProfilePage from './pages/ProfilePage';
import Home from './pages/Home';
import KalpavrukshaPage from './pages/Kalpavruksha';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ThankYouPage from './pages/ThankYouPage';
import AdminPanel from './pages/AdminPanel';

function App() {
  function ScrollToTop() {
    const { pathname } = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-PS0CKM6BCZ', {
        page_path: pathname,
      });
    }
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
            <Route path="/searchProperties" element={<SearchResults />} />
            {/* You can stub out the other pages for now */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<div style={{padding: '80px 0', textAlign: 'center', fontSize: '1.25rem'}}>About page is under development.</div>} />
            <Route path="/contact" element={<div style={{padding: '80px 0', textAlign: 'center', fontSize: '1.25rem'}}>Contact page is under development.</div>} />
            <Route path="/enquire" element={<div>Enquire Page</div>} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          {/* Routes WITHOUT Navbar */}
          <Route element={<PlainLayout />}>
            <Route path="/PropertyDetails" element={<PropertyDetails />} />
            {/* You can add property detail page here too */}
          </Route>
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Kalpavruksha page */}
          <Route path="/kalpavruksha" element={<KalpavrukshaPage />} />
          <Route path="/projects" element={<Navigate to="/kalpavruksha" replace />} />
          {/* Thankyou page */}
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;

