// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchResults from './pages/SearchResults';  // make sure this exists
import Favourites from './pages/Favourites';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Search page: Buy a Plot */}
        <Route path="/search" element={<SearchResults />} />

        {/* You can stub out the other pages for now */}
        <Route path="/projects" element={<div>Projects Page</div>} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/contact" element={<div>Contact Page</div>} />
        <Route path="/enquire" element={<div>Enquire Page</div>} />
        <Route path="/favourites" element={<Favourites />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

