// client/src/pages/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import '../assets/searchPage.css';
import FilterPanel from '../components/FilterPanel';
import MapView from '../components/MapView';
import PropertyCard from '../components/PropertyCard';
import {mockProperties} from '../data/mockdata';



// Demo Component

// export default function PropertyCardsDemo() {
//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">

//     </div>
//   )
// }

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
    <div className="overflow-hidden max-h-screen">
      <div className="flex">
        {/* LEFT (30%): Location input + Map */}
        <div className="flex flex-col bg-white border-r border-border basis-[40%] flex-none fixed overflow-hidden z-10 w-[40%] h-[100vh]">
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
            <p className='h-screen text-xl bg-pink-100 flex justify-center items-center'>Map features will be implemented here </p>
          </div>
        </div>

        {/* RIGHT (70%): Horizontal Filters + Results */}
        <div className="overflow-hidden ml-[40%] w-[60%] h-[100vh] overflow-x-hidden overflow-y-scroll scrollbar-hide rightPart">
          <div className="filters-horizontal">
            <FilterPanel filters={filters} onChange={setFilters} horizontal />
          </div>
          <div className="">
            {/* {listings.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))} */}
            <div className="w-full py-4 mx-3">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {mockProperties.map((property, index) => (
                  <PropertyCard key={index} property={property} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









