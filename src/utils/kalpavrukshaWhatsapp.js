import { getGoogleAdsAttributionPayload } from './googleAdsAttribution';

export const KALPAVRUKSHA_WHATSAPP_NUMBER = '918019298488';

export function buildKalpavrukshaWhatsAppMessage({ projectName = 'Kalpavruksha', pageUrl } = {}) {
  const lines = [
    `Hi Easy Homes, I want current price and available plots for ${projectName}.`,
  ];

  if (pageUrl) {
    lines.push(`Page: ${pageUrl}`);
  }

  const attribution = getGoogleAdsAttributionPayload();
  const clickId = attribution?.gclid || attribution?.gbraid || attribution?.wbraid;
  const campaign = attribution?.utmCampaign || attribution?.campaignId;

  if (clickId || campaign) {
    lines.push(`[Ref: ${clickId || 'NA'},${campaign || 'NA'}]`);
  }

  return {
    message: lines.join('\n'),
    attribution,
  };
}

export function buildKalpavrukshaWhatsAppUrl(options = {}) {
  const { message, attribution } = buildKalpavrukshaWhatsAppMessage(options);
  return {
    url: `https://wa.me/${KALPAVRUKSHA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    message,
    attribution,
  };
}
