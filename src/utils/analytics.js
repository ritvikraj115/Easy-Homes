const GA_MEASUREMENT_ID = 'G-PS0CKM6BCZ';
const META_PIXEL_ID = '2391828714581394';
const THIRD_PARTY_LOAD_DELAY_MS = 6000;

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

  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
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
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
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
  bootstrapGoogleAnalytics();

  let hasLoadedThirdPartyScripts = false;

  const loadThirdPartyScripts = () => {
    if (hasLoadedThirdPartyScripts) {
      return;
    }

    hasLoadedThirdPartyScripts = true;
    appendScriptOnce({
      id: 'ga4',
      src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
    });
    bootstrapMetaPixel();
    appendScriptOnce({
      id: 'meta-pixel',
      src: 'https://connect.facebook.net/en_US/fbevents.js',
    });
  };

  const scheduleDeferredLoad = () => {
    window.setTimeout(loadThirdPartyScripts, THIRD_PARTY_LOAD_DELAY_MS);
  };

  const interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
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
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, sanitizeParams(params));
}

export function trackPageView({ page_path, page_location, page_title } = {}) {
  trackEvent('page_view', {
    page_path,
    page_location,
    page_title,
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
