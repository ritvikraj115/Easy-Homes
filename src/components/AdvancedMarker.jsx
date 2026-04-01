import { useEffect, useMemo, useRef, useState } from 'react';
import { useGoogleMap } from '@react-google-maps/api';

const DEFAULT_PIN_OPTIONS = {
  background: '#059669',
  borderColor: '#ffffff',
  glyphColor: '#ffffff',
  scale: 1,
};

function buildSyntheticDragEvent(position) {
  if (!position) {
    return null;
  }

  const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
  const lng = typeof position.lng === 'function' ? position.lng() : position.lng;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    latLng: {
      lat: () => lat,
      lng: () => lng,
    },
  };
}

export default function AdvancedMarker({
  position,
  title,
  onClick,
  onMouseOver,
  onMouseOut,
  draggable = false,
  onDragEnd,
  pinOptions,
  zIndex,
}) {
  const map = useGoogleMap();
  const [markerInstance, setMarkerInstance] = useState(null);
  const latestSetupRef = useRef({
    draggable,
    pinOptions,
    position,
    title,
    zIndex,
  });
  const pinOptionsKey = useMemo(() => JSON.stringify(pinOptions || {}), [pinOptions]);
  const hasPosition = Boolean(position);

  useEffect(() => {
    latestSetupRef.current = {
      draggable,
      pinOptions,
      position,
      title,
      zIndex,
    };
  }, [draggable, pinOptions, position, title, zIndex]);

  useEffect(() => {
    let isCancelled = false;
    let createdMarker = null;
    let createdContent = null;

    const createMarker = async () => {
      const initialSetup = latestSetupRef.current;

      if (!map || !initialSetup.position || !window.google?.maps?.importLibrary) {
        return;
      }

      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary('marker');
      if (isCancelled) {
        return;
      }

      const pin = new PinElement({
        ...DEFAULT_PIN_OPTIONS,
        ...(initialSetup.pinOptions || {}),
      });

      createdContent = pin.element;
      createdMarker = new AdvancedMarkerElement({
        map,
        position: initialSetup.position,
        title: initialSetup.title,
        content: createdContent,
        gmpDraggable: Boolean(initialSetup.draggable),
        zIndex: initialSetup.zIndex,
      });

      setMarkerInstance(createdMarker);
    };

    createMarker();

    return () => {
      isCancelled = true;

      if (createdMarker) {
        createdMarker.map = null;
      }

      if (createdContent?.remove) {
        createdContent.remove();
      }
    };
  }, [hasPosition, map, pinOptionsKey]);

  useEffect(() => {
    if (!markerInstance || !position) {
      return;
    }

    markerInstance.position = position;
  }, [markerInstance, position]);

  useEffect(() => {
    if (!markerInstance) {
      return;
    }

    markerInstance.title = title || '';
  }, [markerInstance, title]);

  useEffect(() => {
    if (!markerInstance) {
      return;
    }

    markerInstance.gmpDraggable = Boolean(draggable);
  }, [draggable, markerInstance]);

  useEffect(() => {
    if (!markerInstance) {
      return;
    }

    markerInstance.zIndex = zIndex;
  }, [markerInstance, zIndex]);

  useEffect(() => {
    if (!markerInstance) {
      return undefined;
    }

    const markerContent = markerInstance.content;
    const googleListeners = [];
    const domListeners = [];
    const isInteractiveContent =
      markerContent && typeof markerContent.addEventListener === 'function';

    if (onDragEnd) {
      googleListeners.push(
        markerInstance.addListener('dragend', () => {
          const syntheticEvent = buildSyntheticDragEvent(markerInstance.position);
          if (syntheticEvent) {
            onDragEnd(syntheticEvent);
          }
        }),
      );
    }

    if (isInteractiveContent) {
      markerContent.style.cursor = onClick ? 'pointer' : draggable ? 'grab' : '';

      if (onClick) {
        markerContent.tabIndex = 0;
        markerContent.setAttribute('role', 'button');
        markerContent.setAttribute('aria-label', title || 'Map marker');

        const handleClick = () => onClick();
        const handleKeyDown = (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        };

        markerContent.addEventListener('click', handleClick);
        markerContent.addEventListener('keydown', handleKeyDown);
        domListeners.push({ node: markerContent, type: 'click', listener: handleClick });
        domListeners.push({ node: markerContent, type: 'keydown', listener: handleKeyDown });
      }

      if (onMouseOver) {
        markerContent.addEventListener('mouseenter', onMouseOver);
        domListeners.push({ node: markerContent, type: 'mouseenter', listener: onMouseOver });
      }

      if (onMouseOut) {
        markerContent.addEventListener('mouseleave', onMouseOut);
        domListeners.push({ node: markerContent, type: 'mouseleave', listener: onMouseOut });
      }
    }

    return () => {
      googleListeners.forEach((listener) => {
        try {
          listener.remove();
        } catch (error) {}
      });

      domListeners.forEach(({ node, type, listener }) => {
        try {
          node.removeEventListener(type, listener);
        } catch (error) {}
      });
    };
  }, [draggable, markerInstance, onClick, onDragEnd, onMouseOut, onMouseOver, title]);

  return null;
}
