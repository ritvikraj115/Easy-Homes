// client/src/pages/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import '../assets/searchPage.css';
import FilterPanel from '../components/FilterPanel';
import MapView from '../components/MapView';
import PropertyCard from '../components/PropertyCard';

export default function SearchResults() {
  const [filters, setFilters] = useState({
    radius: 5,
    budget: [0, 50],
    type: 'Plot',
    size: [100, 500],
    gated: false,
  });
  const [location, setLocation] = useState('');
  const [listings, setListings] = useState([]);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    // fetch & setListings based on location, filters, bounds...
  }, [location, filters, bounds]);

  return (
    <div className="search-page">
      <div className="search-main">
        {/* LEFT (30%): Location input + Map */}
        <div className="search-left">
          <div className="search-location">
            <input
              type="text"
              placeholder="Enter city or area"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <div className="map-wrapper">
            {/* <MapView listings={listings} onBoundsChange={setBounds} /> */}
             <p className='text-xl bg-pink-400'>Map features will be implemented here </p>
          </div>
        </div>

        {/* RIGHT (70%): Horizontal Filters + Results */}
        <div className="search-right">
          <div className="filters-horizontal">
            <FilterPanel filters={filters} onChange={setFilters} horizontal />
          </div>
          <div className="results-wrapper">
            {listings.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}









