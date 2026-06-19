const STORAGE_KEY = 'easyHomes.googleAdsAttribution.v1';
const STORAGE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

const URL_PARAM_TO_FIELD = Object.freeze({
  gclid: 'gclid',
  gbraid: 'gbraid',
  wbraid: 'wbraid',
  campaignid: 'campaignId',
  campaign_id: 'campaignId', // Added for Google Ads standard ValueTrack
  adgroupid: 'adGroupId',
  creative: 'creativeId',
  targetid: 'targetId',
  device: 'device',
  network: 'network',
  matchtype: 'matchType',
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
});

function normalizeText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const text = String(value).trim();
  return text || undefined;
}

function getClickIdType(attribution) {
  if (attribution?.gclid) return 'gclid';
  if (attribution?.gbraid) return 'gbraid';
  if (attribution?.wbraid) return 'wbraid';
  return undefined;
}

function sanitizeAttribution(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const sanitized = {};

  Object.values(URL_PARAM_TO_FIELD).forEach((field) => {
    const value = normalizeText(raw[field]);
    if (value) {
      sanitized[field] = value;
    }
  });

  // CRITICAL FIX: Cross-populate Campaign ID and UTM Campaign
  // This ensures your backend and WhatsApp link ALWAYS find 'campaignId' 
  // regardless of whether the URL used ?campaignid= or ?utm_campaign=
  if (sanitized.utmCampaign && !sanitized.campaignId) {
    sanitized.campaignId = sanitized.utmCampaign;
  }
  if (sanitized.campaignId && !sanitized.utmCampaign) {
    sanitized.utmCampaign = sanitized.campaignId;
  }

  const landingPage = normalizeText(raw.landingPage);
  if (landingPage) {
    sanitized.landingPage = landingPage;
  }

  const firstCapturedAt = normalizeText(raw.firstCapturedAt);
  if (firstCapturedAt) {
    sanitized.firstCapturedAt = firstCapturedAt;
  }

  const lastCapturedAt = normalizeText(raw.lastCapturedAt);
  if (lastCapturedAt) {
    sanitized.lastCapturedAt = lastCapturedAt;
  }

  const clickIdType = getClickIdType(sanitized);
  if (clickIdType) {
    sanitized.clickIdType = clickIdType;
    sanitized.hasGoogleAdsClick = true;
  } else {
    sanitized.hasGoogleAdsClick = false;
  }

  return Object.keys(sanitized).length ? sanitized : null;
}

function readStoredRawAttribution() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function writeStoredAttribution(value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures and continue without persistent attribution state.
  }
}

export function getGoogleAdsAttributionPayload() {
  const stored = sanitizeAttribution(readStoredRawAttribution());
  if (!stored) {
    return null;
  }

  const lastCapturedAtMs = Date.parse(stored.lastCapturedAt || stored.firstCapturedAt || '');
  if (Number.isFinite(lastCapturedAtMs) && (Date.now() - lastCapturedAtMs) > STORAGE_MAX_AGE_MS) {
    // Auto-expire data older than 90 days
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }

  return stored;
}

export function captureGoogleAdsAttributionFromLocation(locationLike) {
  if (typeof window === 'undefined') {
    return null;
  }

  const currentLocation = locationLike || window.location;
  const search = normalizeText(currentLocation?.search) || '';
  const params = new URLSearchParams(search);
  const captured = {};

  Object.entries(URL_PARAM_TO_FIELD).forEach(([paramName, fieldName]) => {
    const value = normalizeText(params.get(paramName));
    if (value) {
      captured[fieldName] = value;
    }
  });

  const stored = getGoogleAdsAttributionPayload() || {};
  if (!Object.keys(captured).length) {
    return Object.keys(stored).length ? stored : null;
  }

  const now = new Date().toISOString();
  const nextValue = sanitizeAttribution({
    ...stored,
    ...captured,
    landingPage: normalizeText(currentLocation?.href?.split('?')[0]) || stored?.landingPage,
    firstCapturedAt: stored?.firstCapturedAt || now,
    lastCapturedAt: now,
  });

  if (nextValue) {
    writeStoredAttribution(nextValue);
  }

  return nextValue;
}

// Helper export to easily trigger without passing window.location manually
export function captureGoogleAdsAttribution() {
  return captureGoogleAdsAttributionFromLocation();
}