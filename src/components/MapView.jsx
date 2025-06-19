// client/src/components/MapView.jsx
import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export default function MapView({ listings, onBoundsChange }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
  });

  if (!isLoaded) {
    return <div className="map-wrapper">Loading map…</div>;
  }

  return (
    <GoogleMap
      mapContainerClassName="map-wrapper"
      center={{ lat: 16.541, lng: 80.642 }}
      zoom={12}
      onBoundsChanged={map => {
        const b = map.getBounds();
        onBoundsChange(b.toJSON());
      }}
    >
      {listings.map(p => (
        <Marker key={p.id} position={{ lat: p.lat, lng: p.lng }} />
      ))}
    </GoogleMap>
  );
}



