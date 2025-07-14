// client/src/hooks/useGeocodedProperties.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch geocoded latitude/longitude for a list of properties.
 * Relies on the server-side /api/geocode endpoint with Redis caching.
 *
 * @param {Array<Object>} properties - Array of property objects. Each must have a `location` string.
 * @returns {Array<Object>|null} geoProps - null while loading, then array of properties augmented with { lat, lng }.
 */
export default function useGeocodedProperties(properties) {
  const [geoProps, setGeoProps] = useState(null);

  useEffect(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      setGeoProps([]); 
      return;
    }

    let isMounted = true;

    async function fetchCoords() {
      try {
        // Extract all addresses from properties
        const addresses = properties.map(p => p.location);

        // Call your backend geocode endpoint
        const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/geocode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses })
        });

        if (!resp.ok) {
          console.error('Geocode API error', resp.statusText);
          if (isMounted) setGeoProps([]);
          return;
        }

        const { results } = await resp.json();
        // Merge coordinates back into original property objects
        const merged = properties.map((p, i) => ({
          ...p,
          lat: results[i]?.lat ?? null,
          lng: results[i]?.lng ?? null
        }));
        if (isMounted) {
          setGeoProps(merged);
        }
      } catch (err) {
        console.error('Error fetching geocodes:', err);
        if (isMounted) setGeoProps([]);
      }
    }

    fetchCoords();

    return () => {
      isMounted = false;
    };
  }, [properties]);

  return geoProps;
}




