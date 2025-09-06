// client/src/pages/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import '../assets/searchPage.css';
import { useJsApiLoader } from '@react-google-maps/api';  // ← ensure this is imported
import FilterPanel from '../components/FilterPanel';
import MapView from '../components/MapView';
import PropertyCard from '../components/PropertyCard';
import { mockProperties } from '../data/mockdata';
import useGeocodedProperties from '../hooks/useGeocodedProperties';
import { MAP_LIBRARIES } from '../config/googleMaps';

export default function SearchResults() {
  const [hoveredListingId, setHoveredListingId] = useState(null);
  // 1) Always call your hooks first, in the same order:
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
    libraries: MAP_LIBRARIES,
  });

  // Pass google‐loaded flag into your hook
  const geoListings = useGeocodedProperties(mockProperties, isLoaded);

  // 2) State definitions
  const [filters, setFilters] = useState({
    radius: 5,
    budget: [0, 50],
    type: 'Plot',
    size: [100, 500],
    gated: false,
  });
  const [searchLocation, setSearchLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [bounds, setBounds] = useState(null);
  const [filteredListings, setFilteredListings] = useState([]);

  // 3) Reset when location cleared
  useEffect(() => {
    if (!locationQuery) {
      setBounds(null);
      setFilteredListings([]);
    }
  }, [locationQuery]);

  // 4) Early returns *after* hooks but *before* allGeocoded check:
  if (loadError) {
    return <div className="map-wrapper">Error loading maps</div>;
  }
  if (!isLoaded) {
    return <div className="map-wrapper">Loading Maps…</div>;
  }

  // 5) Now that the script is loaded, your hook can run.
  //    geoListings starts `null`, flips to array once done.
  //    We guard until it's a full array matching mockProperties length.
  const allGeocoded =
    Array.isArray(geoListings) &&
    geoListings.length === mockProperties.length &&
    geoListings.every(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

  if (!allGeocoded) {
    return (
      <div
        className="map-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Geocoding properties…
      </div>
    );
  }

  // 6) Pre-filter by budget/type/size/gated
  const preFiltered = geoListings.filter(p => {
    // const [minB, maxB] = filters.budget;
    // const [loP, hiP] = p.priceRange.replace(/[^0-9–]/g, '').split('–').map(Number);
    // if (hiP < minB || loP > maxB) return false;

    if (filters.type && !p.propertyType.includes(filters.type)) return false;

    // const [minS, maxS] = filters.size;
    // const [loS, hiS] = p.basicInformation.lotSize
    //   .replace(/[^0-9–]/g, '')
    //   .split('–')
    //   .map(Number);
    // if (hiS < minS || loS > maxS) return false;

    if (filters.gated) {
      const hasGate = p.additionalInfo?.amenities?.includes('Security cabin');
      if (!hasGate) return false;
    }
    return true;
  });

  // 7) Filter by viewport bounds
  const inBounds = bounds
    ? preFiltered.filter(p =>
        p.lat <= bounds.north &&
        p.lat >= bounds.south &&
        p.lng <= bounds.east &&
        p.lng >= bounds.west
      )
    : preFiltered;


  // 8) Render the full UI
  return (
    <div className="search-page">
      <div className="search-main">
        {/* LEFT */}
        <div className="search-left">
          <form
            className="search-location"
            onSubmit={e => {
              e.preventDefault();
              setLocationQuery(searchLocation.trim());
            }}
          >
            <input
              type="text"
              placeholder="Enter city or area"
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
            />
          </form>
          <div className="map-wrapper">
            <MapView
              listings={inBounds}
              hoveredListingId={hoveredListingId}
              onHoverListing={setHoveredListingId}
              onBoundsChange={setBounds}
              searchLocation={locationQuery}
              radiusKm={filters.radius}
              onFilteredListings={setFilteredListings}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="search-right">
          <div className="filters-horizontal">
            <FilterPanel filters={filters} onChange={setFilters} horizontal />
          </div>
          <div className="properties-container">
            {filteredListings.map(property => (
              <PropertyCard key={property.mlsNumber} property={property} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}










