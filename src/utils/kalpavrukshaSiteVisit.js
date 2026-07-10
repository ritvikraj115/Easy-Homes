export const DEFAULT_SLOT_AVAILABILITY = {
  issue: false,
  reason: '',
  source: 'zoho_live',
};

export const KALPAVRUKSHA_FALLBACK_VISIT_SLOTS = Array.from({ length: 28 }, (_, index) => {
  const totalMinutes = (10 * 60) + 15 + (index * 15);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

export function resolveVisitSlotAvailability(responseData, normalizeSlots) {
  const liveSlots = normalizeSlots(responseData?.slots);
  const status = String(responseData?.availabilityStatus || '').trim().toLowerCase();

  if (!status || status === 'live') {
    return {
      slots: liveSlots,
      availability: DEFAULT_SLOT_AVAILABILITY,
    };
  }

  return {
    slots: normalizeSlots(KALPAVRUKSHA_FALLBACK_VISIT_SLOTS),
    availability: {
      issue: true,
      reason: responseData?.availabilityMessage || `Zoho availability status: ${status}`,
      source: 'fallback',
    },
  };
}

export function getVisitSlotNetworkFallback(error, normalizeSlots) {
  return {
    slots: normalizeSlots(KALPAVRUKSHA_FALLBACK_VISIT_SLOTS),
    availability: {
      issue: true,
      reason: error?.response?.data?.message || error?.message || 'Zoho slots request failed',
      source: 'fallback',
    },
  };
}
