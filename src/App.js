import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes WITH Navbar */}
          <Route element={<MainLayout />}>
            {/* Search page: Buy a Plot */}
            <Route path="/searchProperties" element={<SearchResults />} />

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
          </Route>
          {/* Routes WITHOUT Navbar */}
          <Route element={<PlainLayout />}>
            <Route path="/PropertyDetails" element={<PropertyDetails />} />
            {/* You can add property detail page here too */}
          </Route>
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/compare"   element={<Compare />} />
          <Route path="/profile"   element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;

