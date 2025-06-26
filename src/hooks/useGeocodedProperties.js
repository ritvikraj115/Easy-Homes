// client/src/hooks/useGeocodedProperties.js
import { useState, useEffect } from 'react';

export default function useGeocodedProperties(properties, googleLoaded) {
  // null = loading, [] = done but empty, […] = geocoded props
  const [geoProps, setGeoProps] = useState(null);

  useEffect(() => {
    if (!googleLoaded) return;               // wait for Maps script
    if (!window.google?.maps?.Geocoder) return;

    const geocoder = new window.google.maps.Geocoder();
    let isMounted = true;

    Promise.all(
      properties.map(p =>
        new Promise(res => {
          geocoder.geocode({ address: p.location }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const loc = results[0].geometry.location;
              res({ ...p, lat: loc.lat(), lng: loc.lng() });
            } else {
              console.warn('Geocode failed for', p.location, status);
              res(null);
            }
          });
        })
      )
    ).then(arr => {
      if (isMounted) setGeoProps(arr.filter(Boolean));
    });

    return () => {
      isMounted = false;
    };
  }, [properties, googleLoaded]);

  return geoProps;
}



