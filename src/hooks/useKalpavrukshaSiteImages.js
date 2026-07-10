import { useEffect, useMemo, useState } from 'react';
import api from '../api';

function resolveImageUrl(imageUrl) {
  const url = String(imageUrl || '').trim();
  if (url.startsWith('/uploads/')) {
    return `${process.env.REACT_APP_API_URL || ''}${url}`;
  }
  return url;
}

function mergeSiteImages(defaultImages, overrides) {
  const safeDefaults = Array.isArray(defaultImages) ? defaultImages : [];
  const safeOverrides = Array.isArray(overrides) ? overrides : [];
  if (!safeOverrides.length) return safeDefaults;

  const defaultsById = new Map(safeDefaults.map((item) => [item?.id, item]));
  return safeOverrides.map((override, index) => {
    const item = defaultsById.get(override?.id) || safeDefaults[index] || {};
    const image = resolveImageUrl(override?.imageUrl) || item.image;
    if (!image) return null;
    const label = String(override.label || '').trim() || item.label || item.title;
    return {
      ...item,
      id: item.id || override.id || `site-image-${index + 1}`,
      label,
      title: label,
      detail: item.detail || 'Latest live site update from Kalpavruksha.',
      image,
      alt: String(override.alt || '').trim() || item.alt || label,
    };
  }).filter(Boolean);
}

export default function useKalpavrukshaSiteImages(defaultImages) {
  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    let active = true;
    api.get('/api/kalpavruksha/content')
      .then((response) => {
        if (!active) return;
        setOverrides(Array.isArray(response.data?.data?.siteImages) ? response.data.data.siteImages : []);
      })
      .catch(() => {
        if (active) setOverrides([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => mergeSiteImages(defaultImages, overrides), [defaultImages, overrides]);
}
