const GA_MEASUREMENT_ID = 'G-PS0CKM6BCZ';
const META_PIXEL_ID = '2391828714581394';
const THIRD_PARTY_LOAD_DELAY_MS = 6000;
const KALPAVRUKSHA_THIRD_PARTY_LOAD_DELAY_MS = 12000;
const GTM_CONTAINER_ID = String(process.env.REACT_APP_GTM_ID || '').trim();
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const KALPAVRUKSHA_VARIANT_STORAGE_KEY = 'kalpavruksha_landing_variant';
const KALPAVRUKSHA_AB_TEST_NAME = 'kalpavruksha_landing_page';

function normalizeLandingVariant(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'a' || normalized === 'lp_a' || normalized === 'v1') return 'A';
  if (normalized === 'b' || normalized === 'lp_b' || normalized === 'v2') return 'B';
  return undefined;
}

function normalizeLandingVersion(value, variant) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'v1' || normalized === 'version_1' || normalized === 'version 1') return 'v1';
  if (normalized === 'v2' || normalized === 'version_2' || normalized === 'version 2') return 'v2';
  if (variant === 'A') return 'v1';
  if (variant === 'B') return 'v2';
  return undefined;
}

function getKalpavrukshaRouteVariant() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const path = String(window.location.pathname || '').replace(/\/+$/, '').toLowerCase();
  if (path === '/kalpavruksha2') {
    return 'B';
  }

  const params = new URLSearchParams(window.location.search || '');
  const requestedVariant = normalizeLandingVariant(
    params.get('variant') || params.get('lp') || params.get('ab')
  );
  if (requestedVariant) {
    return requestedVariant;
  }

  if (path !== '/kalpavruksha') {
    return undefined;
  }

  try {
    return normalizeLandingVariant(window.localStorage.getItem(KALPAVRUKSHA_VARIANT_STORAGE_KEY));
  } catch {
    return undefined;
  }
}

function addVersionAliases(params = {}) {
  const explicitVariant = normalizeLandingVariant(
    params.landing_variant ||
    params.landingVariant ||
    params.ab_variant ||
    params.variant
  );
  const routeVariant = getKalpavrukshaRouteVariant();
  const landingVariant = explicitVariant || routeVariant;
  const landingVersion = normalizeLandingVersion(
    params.website_version ||
    params.landing_page_version ||
    params.landing_version ||
    params.landingVersion ||
    params.version ||
    params.version_name,
    landingVariant,
  );

  if (!landingVariant && !landingVersion) {
    return params;
  }

  const resolvedVersion = landingVersion || normalizeLandingVersion(undefined, landingVariant);
  const resolvedVariant = landingVariant || normalizeLandingVariant(resolvedVersion);
  const websiteVersionName = resolvedVersion
    ? `Kalpavruksha ${String(resolvedVersion).toUpperCase()}`
    : undefined;

  return {
    ...params,
    ab_test_name: params.ab_test_name || KALPAVRUKSHA_AB_TEST_NAME,
    experiment_name: params.experiment_name || KALPAVRUKSHA_AB_TEST_NAME,
    landing_variant: params.landing_variant || resolvedVariant,
    landing_version: params.landing_version || resolvedVersion,
    version: params.version || resolvedVersion,
    website_version: params.website_version || resolvedVersion,
    landing_page_version: params.landing_page_version || resolvedVersion,
    version_name: params.version_name || resolvedVersion,
    website_version_name: params.website_version_name || websiteVersionName,
    content_group: params.content_group || websiteVersionName,
    ab_variant: params.ab_variant || resolvedVariant,
    variant_name: params.variant_name || (resolvedVariant ? `Variant ${resolvedVariant}` : undefined),
  };
}

function sanitizeValue(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  return value;
}

function sanitizeParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, sanitizeValue(value)])
      .filter(([, value]) => value !== undefined),
  );
}

function isTagManagerEnabled() {
  return GTM_ID_PATTERN.test(GTM_CONTAINER_ID);
}

function isKalpavrukshaRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return /^\/kalpavruksha\/?$/i.test(window.location.pathname || '');
}

function getDataLayer() {
  if (typeof window === 'undefined') {
    return null;
  }

  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function pushDataLayerEvent(eventName, params = {}) {
  const dataLayer = getDataLayer();
  if (!dataLayer) {
    return;
  }

  dataLayer.push({
    event: eventName,
    ...sanitizeParams(addVersionAliases(params)),
  });
}

function appendScriptOnce({ id, src }) {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.querySelector(`script[data-analytics-script="${id}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.dataset.analyticsScript = id;
  document.head.appendChild(script);
}

function ensureGtagStub() {
  if (typeof window === 'undefined') {
    return;
  }

  const dataLayer = getDataLayer();
  if (!dataLayer) {
    return;
  }

  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      dataLayer.push(arguments);
    };
  }
}

function ensureMetaPixelStub() {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.fbq === 'function') {
    return;
  }

  const queue = [];
  const fbq = function fbq() {
    if (fbq.callMethod) {
      fbq.callMethod.apply(fbq, arguments);
      return;
    }

    queue.push(arguments);
  };

  fbq.queue = queue;
  fbq.push = queue.push.bind(queue);
  fbq.loaded = false;
  fbq.version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;
}

function bootstrapGoogleAnalytics() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || isTagManagerEnabled()) {
    return;
  }

  ensureGtagStub();

  if (!window.__easyHomesGaConfigured) {
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false,
    });
    window.__easyHomesGaConfigured = true;
  }
}

function bootstrapMetaPixel() {
  if (typeof window === 'undefined' || !META_PIXEL_ID || window.__easyHomesMetaPixelConfigured) {
    return;
  }

  ensureMetaPixelStub();
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
  window.__easyHomesMetaPixelConfigured = true;
}

export function initializeAnalytics() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || window.__easyHomesAnalyticsBootstrapped) {
    return;
  }

  window.__easyHomesAnalyticsBootstrapped = true;
  getDataLayer();
  bootstrapGoogleAnalytics();

  let hasLoadedThirdPartyScripts = false;
  const onKalpavrukshaRoute = isKalpavrukshaRoute();

  const loadThirdPartyScripts = () => {
    if (hasLoadedThirdPartyScripts) {
      return;
    }

    hasLoadedThirdPartyScripts = true;
    if (!isTagManagerEnabled()) {
      appendScriptOnce({
        id: 'ga4',
        src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
      });
    }
    bootstrapMetaPixel();
    appendScriptOnce({
      id: 'meta-pixel',
      src: 'https://connect.facebook.net/en_US/fbevents.js',
    });
  };

  const scheduleDeferredLoad = () => {
    const delay = onKalpavrukshaRoute
      ? KALPAVRUKSHA_THIRD_PARTY_LOAD_DELAY_MS
      : THIRD_PARTY_LOAD_DELAY_MS;
    window.setTimeout(loadThirdPartyScripts, delay);
  };

  const interactionEvents = onKalpavrukshaRoute
    ? ['pointerdown', 'keydown', 'touchstart']
    : ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  const handleUserInteraction = () => {
    loadThirdPartyScripts();
    interactionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, handleUserInteraction, interactionListenerOptions);
    });
  };
  const interactionListenerOptions = { passive: true, once: true };

  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleUserInteraction, interactionListenerOptions);
  });

  if (document.readyState === 'complete') {
    scheduleDeferredLoad();
    return;
  }

  window.addEventListener('load', scheduleDeferredLoad, { once: true });
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const analyticsParams = addVersionAliases(params);

  pushDataLayerEvent(eventName, analyticsParams);

  if (isTagManagerEnabled() || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, sanitizeParams(analyticsParams));
}

export function trackPageView({ page_path, page_location, page_title, ...params } = {}) {
  trackEvent('page_view', {
    page_path,
    page_location,
    page_title,
    ...params,
  });
}

export function trackGenerateLead(params = {}) {
  trackEvent('generate_lead', params);
}

export function trackScheduleVisit(params = {}) {
  trackEvent('schedule_visit', params);
}

export function trackFileDownload(params = {}) {
  trackEvent('file_download', params);
}

export function trackWhatsAppClick(params = {}) {
  trackEvent('whatsapp_click', params);
}
