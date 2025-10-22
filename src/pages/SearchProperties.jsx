// client/src/pages/SearchResults.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../assets/searchPage.css';
import { useJsApiLoader } from '@react-google-maps/api';
import FilterPanel from '../components/FilterPanel';
import MapView from '../components/MapView';
import PropertyCard from '../components/PropertyCard';
import { mockProperties } from '../data/mockdata';
import useGeocodedProperties from '../hooks/useGeocodedProperties';
import { MAP_LIBRARIES } from '../config/googleMaps';

export default function SearchResults() {
  const [hoveredListingId, setHoveredListingId] = useState(null);

  // 1) Hooks that must always run in the same order
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
    libraries: MAP_LIBRARIES, // must include 'places'
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

  // NEW: suggestions state + keyboard index
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const serviceRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsVisible = suggestions.length > 0;

  // NEW: key to force MapView remount (resets map to MapView's defaults)
  const [mapKey, setMapKey] = useState(0);

  // Compute preFiltered defensively (so it's safe before maps/geocoding finish)
  const preFiltered = Array.isArray(geoListings)
    ? geoListings.filter(p => {
        if (filters.type && !p.propertyType.includes(filters.type)) return false;
        if (filters.gated) {
          const hasGate = p.additionalInfo?.amenities?.includes('Security cabin');
          if (!hasGate) return false;
        }
        return true;
      })
    : [];

  // Initialize AutocompleteService once maps script is loaded
  useEffect(() => {
    if (!isLoaded) return;
    if (!window.google || !window.google.maps) return;
    if (!serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  // Query suggestions (debounced)
  useEffect(() => {
    if (!isLoaded || !serviceRef.current) return;
    const q = searchLocation?.trim();
    if (!q) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    // debounce 250ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const request = {
        input: q,
      };
      serviceRef.current.getPlacePredictions(request, (preds, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && Array.isArray(preds)) {
          setSuggestions(preds.slice(0, 5)); // take up to 5 suggestions
          setActiveIndex(-1);
        } else {
          setSuggestions([]);
          setActiveIndex(-1);
        }
      });
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchLocation, isLoaded]);

  // Reset when location cleared -> show all preFiltered properties and clear bounds
  // <-- IMPORTANT: this useEffect is declared BEFORE any early returns so hooks order is stable
  useEffect(() => {
    if (!locationQuery) {
      setBounds(null);
      setFilteredListings(preFiltered);
    }
  }, [locationQuery, preFiltered]);

  // 3) Early returns *after* all hooks
  if (loadError) {
    return <div className="map-wrapper">Error loading maps</div>;
  }
  if (!isLoaded) {
    return <div className="map-wrapper">Loading Maps…</div>;
  }

  // 4) Now that the script is loaded, your hook can run.
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

  // 5) Filter by viewport bounds (use preFiltered computed above)
  const inBounds = bounds
    ? preFiltered.filter(
        p =>
          p.lat <= bounds.north &&
          p.lat >= bounds.south &&
          p.lng <= bounds.east &&
          p.lng >= bounds.west
      )
    : preFiltered;

  // --- Handlers for suggestion selection & keyboard ---
  const handleSelectSuggestion = suggestion => {
    // suggestion has description and place_id
    setSearchLocation(suggestion.description);
    setLocationQuery(suggestion.description); // trigger search immediately
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleInputKeyDown = e => {
    if (!suggestions.length) {
      // still allow Enter to submit even if suggestions empty
      if (e.key === 'Enter') {
        // no active suggestion, submit form normally
        setLocationQuery(searchLocation.trim());
        setSuggestions([]);
        setActiveIndex(-1);
        if (!searchLocation.trim()) {
          setMapKey(k => k + 1);
          setBounds(null);
          setFilteredListings(preFiltered);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[activeIndex]);
      } else {
        // no active suggestion, submit form normally
        setLocationQuery(searchLocation.trim());
        setSuggestions([]);
        setActiveIndex(-1);
        if (!searchLocation.trim()) {
          setMapKey(k => k + 1);
          setBounds(null);
          setFilteredListings(preFiltered);
        }
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="search-page">
      <div className="search-main">
        {/* LEFT */}
        <div className="search-left">
          <form
            className="search-location"
            onSubmit={e => {
              e.preventDefault();
              const q = searchLocation.trim();
              setLocationQuery(q);
              setSuggestions([]);
              setActiveIndex(-1);

              if (!q) {
                // user cleared the input and pressed Enter -> reset map + show all properties
                setMapKey(k => k + 1);
                setBounds(null);
                setFilteredListings(preFiltered);
              }
            }}
            autoComplete="off"
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                ref={inputRef}
                name="location"
                type="text"
                placeholder="Enter city or area"
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={() => {
                  // delay hide so click can register
                  setTimeout(() => {
                    setSuggestions([]);
                    setActiveIndex(-1);
                  }, 150);
                }}
              />

              {/* Suggestions dropdown */}
              {suggestionsVisible && (
                <ul className="suggestions-list" role="listbox">
                  {suggestions.map((s, idx) => (
                    <li
                      key={s.place_id}
                      role="option"
                      aria-selected={idx === activeIndex}
                      className={`suggestion-item ${idx === activeIndex ? 'active' : ''}`}
                      onMouseDown={e => {
                        // use onMouseDown to prevent blur from clearing suggestions before click
                        e.preventDefault();
                        handleSelectSuggestion(s);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <strong>{s.structured_formatting.main_text}</strong>{' '}
                      <span className="secondary-text">
                        {s.structured_formatting.secondary_text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>

          <div className="map-wrapper">
            {/* key causes MapView to remount when mapKey changes */}
            <MapView
              key={mapKey}
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
