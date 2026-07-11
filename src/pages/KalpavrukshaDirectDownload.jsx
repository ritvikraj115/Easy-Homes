import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import {
  captureGoogleAdsAttributionFromLocation,
  getGoogleAdsAttributionPayload,
} from '../utils/googleAdsAttribution';

const PDF_OPEN_DELAY_MS = 350;
const REDIRECT_DELAY_MS = 1200;

const DOWNLOAD_ASSETS = {
  brochure: {
    url: '/mainBrouche.pdf',
    fileName: 'Kalpavruksha Project Brochure.pdf',
    eventName: 'brochure_downloaded',
    conversionType: 'brochure_download',
    leadType: 'brochure_download',
    assetType: 'brochure',
    leadStatus: 'Downloaded Brochure',
  },
  masterplan: {
    url: '/Kalpavruksha Master Layout.pdf',
    fileName: 'Kalpavruksha Master Layout.pdf',
    eventName: 'master_layout_downloaded',
    conversionType: 'master_layout_download',
    leadType: 'master_layout_download',
    assetType: 'master_layout',
    leadStatus: 'Downloaded Layout',
  },
};

function buildGoogleAdsEventParams(googleAdsAttribution) {
  return {
    google_ads_attributed: googleAdsAttribution?.hasGoogleAdsClick || undefined,
    google_ads_click_id_type: googleAdsAttribution?.clickIdType,
    google_ads_campaign_id: googleAdsAttribution?.campaignId,
    gclid: googleAdsAttribution?.gclid,
    gbraid: googleAdsAttribution?.gbraid,
    wbraid: googleAdsAttribution?.wbraid,
    utm_source: googleAdsAttribution?.utmSource,
    utm_medium: googleAdsAttribution?.utmMedium,
    utm_campaign: googleAdsAttribution?.utmCampaign,
    utm_term: googleAdsAttribution?.utmTerm,
    utm_content: googleAdsAttribution?.utmContent,
  };
}

function downloadFile(asset) {
  if (typeof document === 'undefined' || !asset?.url) {
    return;
  }

  const link = document.createElement('a');
  link.href = asset.url;
  link.download = asset.fileName || 'download.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openFile(asset) {
  if (typeof window === 'undefined' || !asset?.url) {
    return;
  }

  window.open(asset.url, '_blank', 'noopener,noreferrer');
}

export default function KalpavrukshaDirectDownload({ assetKey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const asset = DOWNLOAD_ASSETS[assetKey];
  const hasTriggeredDownloadRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredDownloadRef.current) {
      return undefined;
    }

    hasTriggeredDownloadRef.current = true;

    if (!asset) {
      navigate('/kalpavruksha/', { replace: true });
      return undefined;
    }

    captureGoogleAdsAttributionFromLocation();
    const googleAdsAttribution = getGoogleAdsAttributionPayload();

    trackEvent(asset.eventName, {
      ...buildGoogleAdsEventParams(googleAdsAttribution),
      event_category: 'conversion',
      conversion_type: asset.conversionType,
      form_name: 'kalpavruksha_download_form',
      lead_type: asset.leadType,
      project: 'Kalpavruksha',
      source: 'direct_download_link',
      placement: location.pathname,
      asset_type: asset.assetType,
      lead_status: asset.leadStatus,
      file_name: asset.fileName,
      file_extension: 'pdf',
      link_url: asset.url,
      delivery_channel: 'direct_download',
      page_path: location.pathname,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    });

    downloadFile(asset);

    const openTimer = window.setTimeout(() => {
      openFile(asset);
    }, PDF_OPEN_DELAY_MS);

    const redirectTimer = window.setTimeout(() => {
      navigate('/kalpavruksha/', { replace: true });
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [asset, location.pathname, navigate]);

  return <div className="min-h-screen bg-white" aria-hidden="true" />;
}
