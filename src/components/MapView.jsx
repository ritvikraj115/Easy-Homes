import React, { useRef, useEffect, useState, useMemo } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

export default function MapView({
  isLoaded,
  loadError,
  listings = [],
  hoveredListingId,
  onHoverListing,
  onBoundsChange,
  searchLocation,
  radiusKm,
  onFilteredListings = () => {},
  hasSearched,
  onUserMovedMap,
  onMapInteractionChange // optional callback
}) {
  // -------------------------
  // Hooks declared first (stable)
  // -------------------------
  const mapRef = useRef(null);
  const googleListenersRef = useRef([]);
  const domListenersRef = useRef([]);
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const [center, setCenter] = useState({ lat: 16.5937, lng: 80.6629 });
  const [zoom, setZoom] = useState(10);

  const validListings = useMemo(
    () =>
      (listings || [])
        .map(p => ({ ...p, lat: parseFloat(p.lat), lng: parseFloat(p.lng) }))
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [listings]
  );

  // Geocode centering when a textual search is performed
  useEffect(() => {
    if (!isLoaded || !searchLocation) return;
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        const newCenter = { lat: loc.lat(), lng: loc.lng() };
        setCenter(newCenter);
        if (mapRef.current) {
          mapRef.current.panTo(newCenter);
          mapRef.current.setZoom(12);
        }
      }
    });
  }, [isLoaded, searchLocation]);

  // Pan to hovered listing
  useEffect(() => {
    if (!isLoaded || !hoveredListingId) return;
    const target = validListings.find(l => l.mlsNumber === hoveredListingId);
    if (target && mapRef.current) {
      mapRef.current.panTo({ lat: target.lat, lng: target.lng });
      setActiveId(target.mlsNumber);
    }
  }, [isLoaded, hoveredListingId, validListings]);

  // Adjust zoom for radius when search is active
  useEffect(() => {
    if (!mapRef.current || !radiusKm || !searchLocation) return;
    const zoomLevel = Math.max(2, Math.min(21, Math.round(16 - Math.log2(radiusKm))));
    setZoom(zoomLevel);
    mapRef.current.setZoom(zoomLevel);
  }, [radiusKm, searchLocation]);

  // Compute withinRadius (only when hasSearched)
  const withinRadius = useMemo(() => {
    if (!radiusKm || !searchLocation || !hasSearched) return validListings;
    const R = 6371;
    const toRad = d => (d * Math.PI) / 180;
    return validListings.filter(p => {
      const dLat = toRad(p.lat - center.lat);
      const dLng = toRad(p.lng - center.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(center.lat)) * Math.cos(toRad(p.lat)) * Math.sin(dLng / 2) ** 2;
      const d = 2 * R * Math.asin(Math.sqrt(a));
      return d <= radiusKm;
    });
  }, [validListings, center, radiusKm, searchLocation, hasSearched]);

  // Report filtered listings to parent
  useEffect(() => {
    onFilteredListings(withinRadius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withinRadius.length, radiusKm, center.lat, center.lng, searchLocation, hasSearched]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      // Google Maps listeners
      googleListenersRef.current.forEach(l => {
        try {
          l.remove();
        } catch (e) {}
      });
      googleListenersRef.current = [];

      // DOM listeners
      domListenersRef.current.forEach(({ el, type, fn }) => {
        try {
          el.removeEventListener(type, fn);
        } catch (e) {}
      });
      domListenersRef.current = [];
    };
  }, []);

  // -------------------------
  // Render (no conditional hooks)
  // -------------------------
  return (
    <>
      {!isLoaded ? (
        <div className="map-wrapper">Loading…</div>
      ) : loadError ? (
        <div className="map-wrapper">Error loading map</div>
      ) : (
        <GoogleMap
          mapContainerClassName="map-wrapper"
          center={center}
          zoom={zoom}
          onLoad={map => {
            mapRef.current = map;

            // remove previous listeners (safety)
            googleListenersRef.current.forEach(l => {
              try {
                l.remove();
              } catch (e) {}
            });
            googleListenersRef.current = [];

            // Google map events: signal interaction start and end
            googleListenersRef.current.push(
              map.addListener('dragstart', () => onMapInteractionChange?.(true))
            );
            googleListenersRef.current.push(
              map.addListener('zoom_changed', () => onMapInteractionChange?.(true))
            );
            googleListenersRef.current.push(
              map.addListener('dragend', () => {
                onUserMovedMap?.();
                // idle will fire after dragend and will set interaction=false and report bounds
              })
            );
            googleListenersRef.current.push(
              map.addListener('idle', () => {
                const b = mapRef.current?.getBounds()?.toJSON();
                if (b) onBoundsChange?.(b);
                onMapInteractionChange?.(false);
              })
            );

            // DOM-level wheel/touch detection so scroll/trackpad gestures also suppress suggestions
            const div = map.getDiv();
            if (div) {
              const wheelFn = () => onMapInteractionChange?.(true);
              const touchFn = () => onMapInteractionChange?.(true);
              div.addEventListener('wheel', wheelFn, { passive: true });
              div.addEventListener('touchstart', touchFn, { passive: true });
              domListenersRef.current.push({ el: div, type: 'wheel', fn: wheelFn });
              domListenersRef.current.push({ el: div, type: 'touchstart', fn: touchFn });
            }
          }}
          onZoomChanged={() => {
            if (mapRef.current) setZoom(mapRef.current.getZoom());
          }}
          onDragEnd={() => {
            if (mapRef.current) {
              const c = mapRef.current.getCenter();
              const newCenter = { lat: c.lat(), lng: c.lng() };
              setCenter(newCenter);
              onUserMovedMap?.();
              // idle will call onMapInteractionChange(false)
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

          {(() => {
            const activeListing = withinRadius.find(p => p.mlsNumber === activeId);
            if (!activeListing) return null;
            return (
              <InfoWindowF
                position={{ lat: activeListing.lat, lng: activeListing.lng }}
                onCloseClick={() => setActiveId(null)}
              >
                <div
                  onClick={() => navigate('/PropertyDetails', { state: { property: activeListing } })}
                  style={{
                    width: 220,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    fontFamily: 'Arial, sans-serif',
                    cursor: 'pointer'
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
            );
          })()}
        </GoogleMap>
      )}
    </>
  );
}
