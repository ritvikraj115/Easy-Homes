// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchResults from './pages/SearchResults';  // make sure this exists
import Favourites from './pages/Favourites';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Otp from './pages/Otp';
import { AuthProvider } from './context/AuthContext'
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Search page: Buy a Plot */}
          <Route path="/search" element={<SearchResults />} />

          {/* You can stub out the other pages for now */}
          <Route path="/" element={<div>home page</div>} />
          <Route path="/projects" element={<div>Projects Page</div>} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/contact" element={<div>Contact Page</div>} />
          <Route path="/enquire" element={<div>Enquire Page</div>} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;

