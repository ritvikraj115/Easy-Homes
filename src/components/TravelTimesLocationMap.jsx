import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Polyline, useJsApiLoader } from '@react-google-maps/api';
import AdvancedMarker from './AdvancedMarker';
import { GOOGLE_MAP_ID, MAP_LIBRARIES, MAPS_LOADER_ID } from '../config/googleMaps';

function formatUpdatedTime(date) {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function TravelTimesLocationMap({
  propertyPosition,
  propertyLabel,
  destinations,
  fallbackEmbedUrl,
}) {
  const apiKey = process.env.REACT_APP_MAP_KEY || '';
  const mapRef = useRef(null);
  const [resolvedDestinations, setResolvedDestinations] = useState([]);
  const [travelTimes, setTravelTimes] = useState({});
  const [travelError, setTravelError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const destinationKey = useMemo(
    () => JSON.stringify(destinations.map(({ id, address }) => ({ id, address }))),
    [destinations],
  );

  const { isLoaded, loadError } = useJsApiLoader({
    id: MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: MAP_LIBRARIES,
    mapIds: [GOOGLE_MAP_ID],
    preventGoogleFontsLoading: true,
  });

  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.Geocoder) {
      return undefined;
    }

    let isActive = true;
    const geocoder = new window.google.maps.Geocoder();

    const geocodeDestination = (destination) =>
      new Promise((resolve) => {
        geocoder.geocode({ address: destination.address }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve({
              ...destination,
              position: {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              },
            });
            return;
          }

          resolve(null);
        });
      });

    Promise.all(destinations.map(geocodeDestination)).then((results) => {
      if (!isActive) {
        return;
      }

      setResolvedDestinations(results.filter(Boolean));
    });

    return () => {
      isActive = false;
    };
  }, [destinationKey, destinations, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.DistanceMatrixService || resolvedDestinations.length === 0) {
      return undefined;
    }

    let isActive = true;
    const distanceMatrixService = new window.google.maps.DistanceMatrixService();

    const updateTravelTimes = () => {
      distanceMatrixService.getDistanceMatrix(
        {
          origins: [propertyPosition],
          destinations: resolvedDestinations.map((destination) => destination.position),
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
          },
        },
        (response, status) => {
          if (!isActive) {
            return;
          }

          if (status !== 'OK' || !response?.rows?.[0]) {
            setTravelError('Live drive times are temporarily unavailable.');
            return;
          }

          const elements = response.rows[0].elements || [];
          const nextTravelTimes = {};

          resolvedDestinations.forEach((destination, index) => {
            const element = elements[index];

            if (element?.status === 'OK') {
              nextTravelTimes[destination.id] = {
                duration: element.duration_in_traffic?.text || element.duration?.text || 'Check route',
                distance: element.distance?.text || '',
              };
              return;
            }

            nextTravelTimes[destination.id] = {
              duration: destination.fallbackLabel || 'Check route',
              distance: '',
            };
          });

          setTravelError('');
          setTravelTimes(nextTravelTimes);
          setLastUpdated(new Date());
        },
      );
    };

    updateTravelTimes();
    const intervalId = window.setInterval(updateTravelTimes, 300000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isLoaded, propertyPosition, resolvedDestinations]);

  useEffect(() => {
    if (!mapRef.current || !isLoaded || resolvedDestinations.length === 0 || !window.google?.maps?.LatLngBounds) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(propertyPosition);
    resolvedDestinations.forEach((destination) => bounds.extend(destination.position));
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    mapRef.current.fitBounds(bounds, {
      top: 40,
      right: 40,
      bottom: 40,
      left: isDesktop ? 280 : 40,
    });

    window.setTimeout(() => {
      if (mapRef.current && mapRef.current.getZoom() > 12) {
        mapRef.current.setZoom(12);
      }
    }, 0);
  }, [isLoaded, propertyPosition, resolvedDestinations]);

  const mapOptions = useMemo(
    () => ({
      clickableIcons: false,
      fullscreenControl: false,
      mapId: GOOGLE_MAP_ID,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
    }),
    [],
  );

  if (!apiKey || loadError) {
    return (
      <div className="relative h-full min-h-[380px] overflow-hidden">
        <iframe
          title="Kalpavruksha location map"
          src={fallbackEmbedUrl}
          className="h-full min-h-[380px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[380px] overflow-hidden bg-slate-100">
      {!isLoaded ? (
        <div className="flex h-full min-h-[380px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)]">
          <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
            Loading live map...
          </div>
        </div>
      ) : (
        <>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={propertyPosition}
            zoom={11}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            options={mapOptions}
          >
            {resolvedDestinations.map((destination) => (
              <Polyline
                key={`${destination.id}-route`}
                path={[propertyPosition, destination.position]}
                options={{
                  geodesic: true,
                  strokeColor: destination.pinOptions?.background || '#059669',
                  strokeOpacity: 0.85,
                  strokeWeight: 3,
                  zIndex: 1,
                }}
              />
            ))}

            <AdvancedMarker
              position={propertyPosition}
              title={propertyLabel}
              zIndex={3}
              pinOptions={{
                background: '#059669',
                borderColor: '#ecfdf5',
                glyph: 'K',
                glyphColor: '#ffffff',
                scale: 1.25,
              }}
            />

            {resolvedDestinations.map((destination) => (
              <AdvancedMarker
                key={destination.id}
                position={destination.position}
                title={destination.label}
                zIndex={2}
                pinOptions={{
                  ...destination.pinOptions,
                  borderColor: destination.pinOptions?.borderColor || '#ffffff',
                  scale: Math.max(destination.pinOptions?.scale || 1, 1.18),
                }}
              />
            ))}
          </GoogleMap>

          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 md:bottom-4 md:left-4 md:right-auto md:top-auto md:w-[18rem]">
            <div className="rounded-[24px] border border-white/75 bg-white/90 p-3.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Live Drive Time
              </p>
              <h3 className="mt-2 text-[1.15rem] font-bold text-slate-900">
                From {propertyLabel}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                Current road-time estimate based on driving conditions.
              </p>

              <div className="mt-3.5 space-y-2.5">
                {destinations.map((destination) => {
                  const travelTime = travelTimes[destination.id];
                  return (
                    <div
                      key={destination.id}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/92 px-3.5 py-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-base" aria-hidden="true">
                          {destination.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[0.95rem] font-semibold text-slate-900">
                            {destination.label}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-600">
                            {travelTime?.duration || 'Calculating drive time...'}
                            {travelTime?.distance ? ` - ${travelTime.distance}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {travelError || (lastUpdated ? `Updated at ${formatUpdatedTime(lastUpdated)}` : 'Updating live drive times...')}
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute right-3 top-3 z-10 md:right-4 md:top-4">
            <div className="rounded-2xl border border-white/75 bg-white/92 px-3 py-3 shadow-[0_14px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Map Legend
              </p>
              <div className="mt-2.5 space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    K
                  </span>
                  <span>Kalpavruksha</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm">
                    A
                  </span>
                  <span>Airport</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                    R
                  </span>
                  <span>Railway Station</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
