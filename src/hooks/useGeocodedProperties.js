// client/src/hooks/useGeocodedProperties.js
import { useState, useEffect } from 'react';

const GEOCODE_CACHE_KEY = 'easyHomes.geocodeCache.v1';
const GEOCODE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GEOCODE_CACHE_MAX_ITEMS = 250;

function normalizeAddress(address) {
  return String(address || '').trim().toLowerCase();
}

function readGeocodeCache() {
  if (typeof window === 'undefined') return {};

  try {
    const rawValue = window.localStorage.getItem(GEOCODE_CACHE_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeGeocodeCache(cache) {
  if (typeof window === 'undefined') return;

  try {
    const entries = Object.entries(cache)
      .sort(([, a], [, b]) => Number(b?.cachedAt || 0) - Number(a?.cachedAt || 0))
      .slice(0, GEOCODE_CACHE_MAX_ITEMS);

    window.localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Ignore storage quota/private-mode failures; server cache still protects the API.
  }
}

function getCachedCoords(cache, addressKey) {
  const entry = cache[addressKey];
  if (!entry || typeof entry !== 'object') return null;

  if (Date.now() - Number(entry.cachedAt || 0) > GEOCODE_CACHE_TTL_MS) {
    delete cache[addressKey];
    return null;
  }

  const lat = entry.lat ?? null;
  const lng = entry.lng ?? null;
  const isValidCoordinate =
    (lat === null && lng === null) ||
    (typeof lat === 'number' && typeof lng === 'number');

  return isValidCoordinate ? { lat, lng } : null;
}

function setCachedCoords(cache, addressKey, coords) {
  cache[addressKey] = {
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    cachedAt: Date.now(),
  };
}

/**
 * Custom hook to fetch geocoded latitude/longitude for a list of properties.
 * Uses browser cache first, then the server-side /api/geocode endpoint.
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
        const addresses = properties.map(p => String(p.location || '').trim());
        const cache = readGeocodeCache();
        const coordsByAddress = new Map();
        const missingAddressMap = new Map();

        addresses.forEach((address) => {
          const addressKey = normalizeAddress(address);
          if (!addressKey) {
            coordsByAddress.set(addressKey, { lat: null, lng: null });
            return;
          }

          const cachedCoords = getCachedCoords(cache, addressKey);
          if (cachedCoords) {
            coordsByAddress.set(addressKey, cachedCoords);
          } else {
            missingAddressMap.set(addressKey, address);
          }
        });

        const missingAddresses = Array.from(missingAddressMap.values());

        if (missingAddresses.length) {
          const resp = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/geocode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses: missingAddresses })
          });

          if (!resp.ok) {
            const payload = await resp.json().catch(() => null);
            console.error('Geocode API error', resp.status, payload?.code || resp.statusText, payload?.error || '');
          } else {
            const { results } = await resp.json();
            missingAddresses.forEach((address, index) => {
              const addressKey = normalizeAddress(address);
              const coords = {
                lat: results?.[index]?.lat ?? null,
                lng: results?.[index]?.lng ?? null,
              };

              coordsByAddress.set(addressKey, coords);
              setCachedCoords(cache, addressKey, coords);
            });
            writeGeocodeCache(cache);
          }
        }

        const merged = properties.map((p, i) => ({
          ...p,
          lat: coordsByAddress.get(normalizeAddress(addresses[i]))?.lat ?? null,
          lng: coordsByAddress.get(normalizeAddress(addresses[i]))?.lng ?? null
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




