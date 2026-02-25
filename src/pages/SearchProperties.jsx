import React, { useState, useEffect, useRef } from 'react';
import '../assets/searchPage.css';
import { useJsApiLoader } from '@react-google-maps/api';
import FilterPanel from '../components/FilterPanel';
import MapView from '../components/MapView';
import PropertyCard from '../components/PropertyCard';
import useGeocodedProperties from '../hooks/useGeocodedProperties';
import useProperties from '../hooks/useProperties';
import { MAP_LIBRARIES, MAPS_LOADER_ID } from '../config/googleMaps';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function SearchResults() {
    const searchSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Search Properties | Easy Homes",
    "url": "https://easyhomess.com/searchProperties",
    "description":
      "Search and filter CRDA-approved plots in Vijayawada and Amaravati. Compare verified properties, locations, prices, and amenities.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://easyhomess.com/PropertyDetails",
    }
  };
  // -------------------------
  // All hooks / state (stable order)
  // -------------------------
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();

  // Load maps once at parent
  const { isLoaded, loadError } = useJsApiLoader({
    id: MAPS_LOADER_ID,
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
    libraries: MAP_LIBRARIES,
  });

  // custom hook to geocode properties (always called)
  const geoListings = useGeocodedProperties(properties);

  // Main UI state
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

  // Suggestions + keyboard
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const serviceRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // Flags
  const [hasSearched, setHasSearched] = useState(false); // search applied
  const [mapInteracting, setMapInteracting] = useState(false); // true when user interacting with map (drag/scroll/zoom)

  // Make geoListings safe to operate on
  const safeGeo = Array.isArray(geoListings) ? geoListings : [];

  // Show suggestions only when:
  // - there are suggestions,
  // - the user has typed a non-empty query,
  // - no completed search is active,
  // - and the user is not interacting with the map.
  const suggestionsVisible =
    suggestions.length > 0 &&
    searchLocation.trim().length > 0 &&
    !hasSearched &&
    !mapInteracting;

  // -------------------------
  // Effects (always declared)
  // -------------------------
  useEffect(() => {
    if (!locationQuery) {
      setBounds(null);
      setFilteredListings([]);
      setHasSearched(false);
    }
  }, [locationQuery]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!window.google || !window.google.maps) return;
    if (!serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  useEffect(() => {
    // If a search was just performed, suppress suggestions until user types again
    if (hasSearched) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    if (!isLoaded || !serviceRef.current) return;
    const q = searchLocation?.trim();
    if (!q) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const request = { input: q };
      serviceRef.current.getPlacePredictions(request, (preds, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && Array.isArray(preds)) {
          setSuggestions(preds.slice(0, 5));
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
  }, [searchLocation, isLoaded, hasSearched]);

  // Hide suggestions on outside click
  useEffect(() => {
    const onDocClick = e => {
      if (!inputRef.current) return;
      if (inputRef.current.contains(e.target)) return;
      setSuggestions([]);
      setActiveIndex(-1);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // -------------------------
  // Derived data & handlers
  // -------------------------
  const allGeocoded =
    safeGeo.length === properties.length &&
    safeGeo.every(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

  const preFiltered = safeGeo.filter(p => {
    if (filters.type && !p.propertyType?.includes(filters.type)) return false;
    if (filters.gated) {
      const hasGate = p.additionalInfo?.amenities?.includes('Security cabin');
      if (!hasGate) return false;
    }
    return true;
  });

  const inBounds = bounds
    ? preFiltered.filter(
        p =>
          p.lat <= bounds.north &&
          p.lat >= bounds.south &&
          p.lng <= bounds.east &&
          p.lng >= bounds.west
      )
    : preFiltered;

  const handleSelectSuggestion = suggestion => {
    setSearchLocation(suggestion.description);
    setLocationQuery(suggestion.description);
    setSuggestions([]);
    setActiveIndex(-1);
    setHasSearched(true);
    inputRef.current?.blur();
  };

  const handleInputKeyDown = e => {
    if (suggestions.length && !hasSearched && !mapInteracting) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        return;
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[activeIndex]);
          return;
        }
      } else if (e.key === 'Escape') {
        setSuggestions([]);
        setActiveIndex(-1);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      setLocationQuery(searchLocation.trim());
      setSuggestions([]);
      setActiveIndex(-1);
      setHasSearched(true);
      inputRef.current?.blur();
    }
  };

  // -------------------------
  // Render (no conditional hooks)
  // -------------------------
  return (
    <>
     <Helmet>
        {/* ================= PRIMARY SEO ================= */}

        <title>
          Search CRDA Approved Plots in Vijayawada & Amaravati | Easy Homes
        </title>

        <meta
          name="description"
          content="Search, compare, and shortlist CRDA-approved plots in Vijayawada and Amaravati. Verified listings, clear titles, and gated community projects by Easy Homes."
        />

        <meta
          name="keywords"
          content="search plots Vijayawada, CRDA approved plots Amaravati, buy open plots Andhra Pradesh, property search Easy Homes, gated community plots"
        />

        <meta name="robots" content="noindex,follow" />
        <link
          rel="canonical"
          href="https://easyhomess.com/searchProperties"
        />

        {/* ================= STRUCTURED DATA ================= */}
        <script type="application/ld+json">
          {JSON.stringify(searchSchema)}
        </script>
    </Helmet>
    <h1 className="sr-only">
      Search CRDA Approved Plots in Vijayawada and Amaravati
      <Link to="/kalpavruksha">View All Projects</Link>
    </h1>
    <div className="search-page">
      <div className="search-main">
        {/* LEFT */}
        <div className="search-left">
          <form
            className="search-location"
            onSubmit={e => {
              e.preventDefault();
              setLocationQuery(searchLocation.trim());
              setSuggestions([]);
              setActiveIndex(-1);
              setHasSearched(true);
              inputRef.current?.blur();
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
                onChange={e => {
                  setSearchLocation(e.target.value);
                  if (hasSearched) setHasSearched(false);
                }}
                onKeyDown={handleInputKeyDown}
                onBlur={() => {
                  // short delay so clicks on suggestions register
                  setTimeout(() => {
                    setSuggestions([]);
                    setActiveIndex(-1);
                  }, 150);
                }}
              />

              {suggestionsVisible && (
                <ul className="suggestions-list" role="listbox">
                  {suggestions.map((s, idx) => (
                    <li
                      key={s.place_id}
                      role="option"
                      aria-selected={idx === activeIndex}
                      className={`suggestion-item ${idx === activeIndex ? 'active' : ''}`}
                      onMouseDown={e => {
                        // use mousedown so blur doesn't clear before click
                        e.preventDefault();
                        handleSelectSuggestion(s);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <strong>{s.structured_formatting?.main_text}</strong>{' '}
                      <span className="secondary-text">
                        {s.structured_formatting?.secondary_text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>

          <div className="map-wrapper">
            {/* Inline handling of loading/error/geocoding to avoid conditional hook placement */}
            {!isLoaded ? (
              <div className="map-wrapper">Loading Maps…</div>
            ) : loadError ? (
              <div className="map-wrapper">Error loading maps</div>
            ) : propertiesLoading ? (
              <div className="map-wrapper">Loading properties...</div>
            ) : propertiesError ? (
              <div className="map-wrapper">{propertiesError}</div>
            ) : !allGeocoded ? (
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
            ) : (
              <MapView
                isLoaded={isLoaded}
                loadError={loadError}
                listings={inBounds}
                hoveredListingId={hoveredListingId}
                onHoverListing={setHoveredListingId}
                onBoundsChange={setBounds}
                searchLocation={locationQuery}
                radiusKm={filters.radius}
                onFilteredListings={setFilteredListings}
                hasSearched={hasSearched}
                onUserMovedMap={() => setHasSearched(false)}
                onMapInteractionChange={isInteracting => {
                  setMapInteracting(Boolean(isInteracting));
                  if (isInteracting) {
                    setSuggestions([]);
                    setActiveIndex(-1);
                  }
                }}
              />
            )}
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
    </>
  );
}
