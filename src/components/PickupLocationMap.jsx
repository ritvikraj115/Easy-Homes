import React from 'react';
import { GoogleMap, LoadScriptNext } from '@react-google-maps/api';
import AdvancedMarker from './AdvancedMarker';
import { GOOGLE_MAP_ID } from '../config/googleMaps';

function PickupLocationMap({
  apiKey,
  center,
  containerStyle,
  libraries,
  mapLoaderId,
  onLoadError,
  onMapClick,
  onMarkerDragEnd,
  selectedPosition,
}) {
  return (
    <LoadScriptNext
      id={mapLoaderId}
      googleMapsApiKey={apiKey}
      libraries={libraries}
      mapIds={[GOOGLE_MAP_ID]}
      preventGoogleFontsLoading
      onError={onLoadError}
      loadingElement={<div className="p-3 text-xs text-gray-600">Loading map...</div>}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onClick={onMapClick}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, mapId: GOOGLE_MAP_ID }}
      >
        {selectedPosition && (
          <AdvancedMarker
            position={selectedPosition}
            draggable
            onDragEnd={onMarkerDragEnd}
            title="Selected pickup location"
          />
        )}
      </GoogleMap>
    </LoadScriptNext>
  );
}

export default React.memo(PickupLocationMap);
