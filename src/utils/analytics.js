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
