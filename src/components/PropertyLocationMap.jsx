// client/src/components/PropertyLocationMap.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MAP_LIBRARIES, MAPS_LOADER_ID } from '../config/googleMaps';


export default function PropertyLocationMap({ address }) {
  const [center, setCenter] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({
    id: MAPS_LOADER_ID,
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
    libraries: MAP_LIBRARIES
  });

  // Geocode the address once it (or API) loads
  useEffect(() => {
    if (!isLoaded || !address) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setCenter({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        });
      } else {
        console.error('Geocode failed:', status);
      }
    });
  }, [isLoaded, address]);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded || !center) return <div>Loading map…</div>;

  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={15}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        <MarkerF position={center} />
      </GoogleMap>
    </div>
  );
}
