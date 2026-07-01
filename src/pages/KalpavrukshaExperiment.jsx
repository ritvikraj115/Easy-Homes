import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import KalpavrukshaPage from './Kalpavruksha';
import KalpavrukshaV2 from './KalpavrukshaV2';
import { trackPageView } from '../utils/analytics';

const STORAGE_KEY = 'kalpavruksha_landing_variant';
const AB_TEST_NAME = 'kalpavruksha_landing_page';

function normalizeVariant(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'b' || normalized === 'lp_b' || normalized === 'v2') return 'B';
  if (normalized === 'a' || normalized === 'lp_a' || normalized === 'v1') return 'A';
  return '';
}

function readStoredVariant() {
  if (typeof window === 'undefined') return '';

  try {
    return normalizeVariant(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return '';
  }
}

function storeVariant(variant) {
  if (typeof window === 'undefined' || !variant) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, variant);
  } catch {
    // If storage is blocked, the page still renders. Tracking remains variant-stamped.
  }
}

function assignRandomVariant() {
  return Math.random() < 0.5 ? 'A' : 'B';
}

export default function KalpavrukshaExperiment() {
  const location = useLocation();
  const params = new URLSearchParams(location.search || '');
  const requestedVariant = normalizeVariant(
    params.get('variant') || params.get('lp') || params.get('ab')
  );

  const activeVariant = useMemo(() => {
    if (requestedVariant) {
      storeVariant(requestedVariant);
      return requestedVariant;
    }

    const storedVariant = readStoredVariant();
    if (storedVariant) return storedVariant;

    const assignedVariant = assignRandomVariant();
    storeVariant(assignedVariant);
    return assignedVariant;
  }, [requestedVariant]);

  useEffect(() => {
    const landingVersion = activeVariant === 'B' ? 'v2' : 'v1';
    const pagePayload = {
      page_path: location.pathname,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      page_name: 'kalpavruksha',
      project: 'Kalpavruksha',
      ab_test_name: AB_TEST_NAME,
      landing_variant: activeVariant,
      landing_version: landingVersion,
      version: landingVersion,
    };

    trackPageView(pagePayload);
  }, [activeVariant, location.pathname, location.search]);

  return activeVariant === 'B' ? <KalpavrukshaV2 /> : <KalpavrukshaPage />;
}
