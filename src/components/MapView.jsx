// client/src/components/MapView.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useJsApiLoader
} from '@react-google-maps/api';
import { MAP_LIBRARIES } from '../config/googleMaps';
import { useNavigate } from 'react-router-dom';

export default function MapView({
  listings,
  hoveredListingId,
  onHoverListing,
  onBoundsChange,
  searchLocation,
  radiusKm,
  onFilteredListings
}) {
  const mapRef = useRef(null);
  const navigate = useNavigate(); 
  const [activeId, setActiveId] = useState(null);
  const [center, setCenter] = useState({ lat: 16.5937, lng: 80.6629 });
  const [zoom, setZoom] = useState(10);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
    libraries: MAP_LIBRARIES
  });

  // numeric coords
  const validListings = useMemo(
    () =>
      listings
        .map(p => ({ ...p, lat: parseFloat(p.lat), lng: parseFloat(p.lng) }))
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [listings]
  );

  // 1) Geocode when user clicks Search
  useEffect(() => {
    if (!isLoaded || !searchLocation) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const newCenter = { lat: loc.lat(), lng: loc.lng() };
        setCenter(newCenter);
        mapRef.current?.panTo(newCenter);
        mapRef.current?.setZoom(12);
      }
    });
  }, [isLoaded, searchLocation]);

  // 2) Pan on card hover
  useEffect(() => {
    if (!isLoaded || !hoveredListingId) return;
    const target = validListings.find(l => l.mlsNumber === hoveredListingId);
    console.log(target)
    if (target) {
      mapRef.current?.panTo({ lat: target.lat, lng: target.lng });
      setActiveId(target.mlsNumber);
    }
  }, [isLoaded, hoveredListingId, validListings]);

  useEffect(() => {
    if (!mapRef.current || !radiusKm || !searchLocation) return;
    // This formula maps radius (km) to a zoom level—tweak constants to taste
    const zoomLevel = Math.max(
      2,
      Math.min(
        21,
        Math.round(16 - Math.log2(radiusKm))
      )
    );
    setZoom(zoomLevel);
    mapRef.current.setZoom(zoomLevel);
  }, [radiusKm]);

  // 3) Radius filter
  const withinRadius = useMemo(() => {
    if (!radiusKm || !searchLocation) return validListings;
    const R = 6371;
    const toRad = d => (d * Math.PI) / 180;
    return validListings.filter(p => {
      const dLat = toRad(p.lat - center.lat);
      const dLng = toRad(p.lng - center.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(center.lat)) *
        Math.cos(toRad(p.lat)) *
        Math.sin(dLng / 2) ** 2;
      const d = 2 * R * Math.asin(Math.sqrt(a));
      setZoom(15 - radiusKm / 10)
      return d <= radiusKm;
    });
  }, [validListings, center, radiusKm, searchLocation]);

  // 4) Whenever withinRadius changes—report it immediately
  useEffect(() => {
    console.log(withinRadius)
    onFilteredListings(withinRadius);
  }, [
    withinRadius.length,   // only cares about a change in count
    radiusKm,              // or the radius filter
    center.lat,            // or the map’s center
    center.lng,
    searchLocation         // or the searchLocation term
  ]);

  // 5) Also report new bounds on every idle
  const handleIdle = () => {
    const b = mapRef.current?.getBounds()?.toJSON();
    if (b) onBoundsChange(b);
  };

  if (loadError) return <div className="map-wrapper">Error loading map</div>;
  if (!isLoaded) return <div className="map-wrapper">Loading…</div>;

  const activeListing = withinRadius.find(p => p.mlsNumber === activeId);

  return (
    <GoogleMap
      mapContainerClassName="map-wrapper"
      center={center}
      zoom={zoom}
      onLoad={map => { mapRef.current = map; }}
      onIdle={handleIdle}
      onZoomChanged={() => {
        if (mapRef.current) setZoom(mapRef.current.getZoom());
      }}
      onDragEnd={() => {
        if (mapRef.current) {
          const c = mapRef.current.getCenter();
          setCenter({ lat: c.lat(), lng: c.lng() });
        }
      }}
    >
      {withinRadius.map(p => (
        <MarkerF
          key={p.mlsNumber}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
          onClick={() => setActiveId(p.mlsNumber)}
          onMouseOver={() => onHoverListing?.(p.mlsNumber)}
          onMouseOut={() => onHoverListing?.(null)}
        />
      ))}

      {activeListing && (
        <InfoWindowF
          position={{ lat: activeListing.lat, lng: activeListing.lng }}
          onCloseClick={() => setActiveId(null)}
        >
          <div
            onClick={() =>
              navigate('/PropertyDetails', { state: { property: activeListing } })
            }
            style={{
              width: 220,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              fontFamily: 'Arial, sans-serif',
              cursor: 'pointer'                     // ← indicate clickability
            }}
          >
            {activeListing.media?.images?.[0] && (
              <img
                src={activeListing.media.images[0]}
                alt={activeListing.name}
                style={{ width: '100%', height: 120, objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: '8px 10px' }}>
              <h3 style={{ margin: 0, fontSize: 16, color: '#222' }}>
                {activeListing.name}
              </h3>
              <p style={{ margin: '6px 0 4px', fontSize: 14, color: '#555' }}>
                {activeListing.location}
              </p>
              <p style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: '#000'
              }}>
                {activeListing.priceRange}
              </p>
            </div>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}








