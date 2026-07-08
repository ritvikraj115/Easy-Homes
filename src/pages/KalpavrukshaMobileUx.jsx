import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api';
import { trackEvent, trackWhatsAppClick } from '../utils/analytics';
import { captureGoogleAdsAttribution, getGoogleAdsAttributionPayload } from '../utils/googleAdsAttribution';
import { KALPAVRUKSHA_WHATSAPP_NUMBER } from '../utils/kalpavrukshaWhatsapp';
import ZohoSalesIQWidgetLoader from '../components/ZohoSalesIQWidgetLoader';
import siteEntranceWall from '../assets/kalpavruksha/live-entrance-wall-1200.webp';
import siteCompoundWall from '../assets/kalpavruksha/live-compound-wall-1200.webp';
import siteClubhouseLawn from '../assets/kalpavruksha/live-clubhouse-lawn-1200.webp';
import siteSeatingPavilion from '../assets/kalpavruksha/live-seating-pavilion-1200.webp';
import siteMainGate from '../assets/kalpavruksha/live-main-gate-1200.webp';

const CALL_URL = 'tel:+918988896666';
const KALPAVRUKSHA_FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap';
const GOOGLE_REVIEW_FALLBACK = {
  rating: '5.0',
  reviewCount: '22',
  reviewUrl: 'https://share.google/OHvpBdiGZ7sqZGHYR',
  source: 'fallback',
};
const KALPAVRUKSHA_ZOHO_THEME = {
  color: '#cba159',
  primary: '#cba159',
  accent: '#d7b16f',
  title: '#1d1609',
  text: '#221c14',
  background: '#fff9ef',
  surface: '#fffaf1',
};
const KALPAVRUKSHA_ZOHO_HOME_WIDGETS = [
  {
    type: 'command_panel',
    title: 'Start a conversation with Easy Bot',
    actions: [
      {
        type: 'chat',
        label: 'Start Live Chat',
      },
    ],
  },
];

const siteImages = [
  {
    title: 'Entrance wall',
    image: siteEntranceWall,
    alt: 'Kalpavruksha entrance wall at the live site',
  },
  {
    title: 'Main gate',
    image: siteMainGate,
    alt: 'Kalpavruksha main gate at the live site',
  },
  {
    title: 'Compound wall',
    image: siteCompoundWall,
    alt: 'Kalpavruksha compound wall and boundary work at the live site',
  },
  {
    title: 'Clubhouse lawn',
    image: siteClubhouseLawn,
    alt: 'Kalpavruksha clubhouse lawn and walking path at the live site',
  },
  {
    title: 'Seating pavilion',
    image: siteSeatingPavilion,
    alt: 'Kalpavruksha outdoor seating pavilion at the live site',
  },
];

const quickFacts = [
  ['From Vijayawada', '7.5 km'],
  ['From Amaravati', '13.5 km'],
  ['Approval', 'CRDA Layout'],
  ['Plot Sizes', '174-525 Sq.yd.'],
];

const amenities = [
  {
    icon: 'hill',
    title: 'Hill views',
    text: 'Unobstructed views of the Kondapalli hills from most plots in the layout.',
  },
  {
    icon: 'creek',
    title: 'Creek & walking trail',
    text: 'A live creek runs through Kalpavruksha with a dedicated trail alongside it.',
  },
  {
    icon: 'clubhouse',
    title: 'Clubhouse',
    text: 'Infinity pool, private theatre, banquet hall, BBQ deck and an AC gym.',
  },
  {
    icon: 'sports',
    title: 'Boulder park & sports courts',
    text: 'Pickleball and box cricket courts, plus a landscaped boulder park.',
  },
  {
    icon: 'roads',
    title: 'CC roads & underground utilities',
    text: 'Every internal road is concrete; every utility line runs underground.',
  },
  {
    icon: 'wall',
    title: '11-ft wall & 24/7 CCTV',
    text: 'The entire layout is enclosed and monitored around the clock.',
  },
];

const buildWhatsAppUrl = (message) =>
  `https://wa.me/${KALPAVRUKSHA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

const buildGoogleAdsEventParams = (attribution = getGoogleAdsAttributionPayload()) => ({
  google_ads_attributed: attribution?.hasGoogleAdsClick || undefined,
  google_ads_click_id_type: attribution?.clickIdType,
  google_ads_campaign_id: attribution?.campaignId,
  gclid: attribution?.gclid,
  gbraid: attribution?.gbraid,
  wbraid: attribution?.wbraid,
  utm_source: attribution?.utmSource,
  utm_medium: attribution?.utmMedium,
  utm_campaign: attribution?.utmCampaign,
  utm_term: attribution?.utmTerm,
  utm_content: attribution?.utmContent,
});

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" aria-hidden="true">
    <path d="M20 12a8 8 0 1 1-3.6-6.7" />
    <path d="M20 4l-8 8" />
  </svg>
);

const SmallTreeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3C9 7 7 10 7 13.5C7 17 9.2 19 12 19C14.8 19 17 17 17 13.5C17 10 15 7 12 3Z" />
    <path d="M12 19V22" />
  </svg>
);

const StarRow = ({ rating }) => (
  <span className="kmux-stars" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <svg key={index} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.6l2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 16.9l-5.7 2.9 1.1-6.2-4.5-4.4 6.3-.9L12 2.6z" />
      </svg>
    ))}
  </span>
);

const AmenityIcon = ({ type }) => {
  const paths = {
    hill: <path d="M3 18l5-8 4 5 3-4 6 7" />,
    creek: (
      <>
        <path d="M4 9c2 2 4 2 6 0s4-2 6 0 3 2 4 1" />
        <path d="M4 15c2 2 4 2 6 0s4-2 6 0 3 2 4 1" />
      </>
    ),
    clubhouse: (
      <>
        <rect x="3" y="10" width="18" height="9" rx="1" />
        <path d="M7 10V6a5 5 0 0 1 10 0v4" />
      </>
    ),
    sports: (
      <>
        <circle cx="7" cy="8" r="2" />
        <circle cx="17" cy="8" r="2" />
        <circle cx="7" cy="16" r="2" />
        <circle cx="17" cy="16" r="2" />
      </>
    ),
    roads: (
      <>
        <path d="M4 20h16" />
        <path d="M7 20l2-16" />
        <path d="M17 20L15 4" />
        <path d="M12 7v3M12 13v3" />
      </>
    ),
    wall: (
      <>
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
        <path d="M12 8v5" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[type]}
    </svg>
  );
};

export default function KalpavrukshaMobileUx({
  landingVariant = 'A',
  landingVersion = 'v1',
  googleReviewSummary = GOOGLE_REVIEW_FALLBACK,
  onBookSiteVisit,
}) {
  const rootRef = useRef(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', consent: false });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isV2 = landingVariant === 'B' || landingVersion === 'v2';

  const reviewSummary = {
    ...GOOGLE_REVIEW_FALLBACK,
    ...googleReviewSummary,
  };

  const activeHeroImage = siteImages[activeHeroIndex] || siteImages[0];
  const trackingContext = useMemo(() => ({
    landing_variant: landingVariant,
    landingVariant,
    landing_version: landingVersion,
    landingVersion,
    version: landingVersion,
    project: 'Kalpavruksha',
    source: 'kalpavruksha_mobile_ux',
    ab_test_name: 'kalpavruksha_landing_page',
  }), [landingVariant, landingVersion]);

  useEffect(() => {
    captureGoogleAdsAttribution();
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % siteImages.length);
    }, 4200);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !rootRef.current) {
      return undefined;
    }

    const revealNodes = rootRef.current.querySelectorAll('.kmux-reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealNodes.forEach((node) => node.classList.add('kmux-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('kmux-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.12,
    });

    revealNodes.forEach((node, index) => {
      node.style.setProperty('--kmux-delay', `${Math.min(index % 5, 4) * 70}ms`);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [isV2]);

  const trackFormOpen = (placement) => {
    trackEvent('form_open', {
      ...trackingContext,
      ...buildGoogleAdsEventParams(),
      event_category: 'engagement',
      form_name: 'kalpavruksha_brochure_map_mobile',
      placement,
    });
  };

  const openSiteVisitForm = (placement) => {
    if (typeof onBookSiteVisit === 'function') {
      onBookSiteVisit(placement);
      return;
    }

    trackFormOpen(placement);
    if (typeof document !== 'undefined') {
      document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const trackPhoneClick = (placement) => {
    trackEvent('phone_click', {
      ...trackingContext,
      ...buildGoogleAdsEventParams(),
      event_category: 'lead',
      placement,
      phone_number: CALL_URL.replace('tel:', ''),
    });
  };

  const openWhatsApp = (placement, message) => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;
    const defaultMessage = [
      'Hi Easy Homes, I want current price and location details for Kalpavruksha.',
      pageUrl ? `Page: ${pageUrl}` : '',
    ].filter(Boolean).join('\n');

    trackWhatsAppClick({
      ...trackingContext,
      ...buildGoogleAdsEventParams(),
      event_category: 'lead',
      placement,
      link_url: buildWhatsAppUrl(message || defaultMessage),
    });
  };

  const trackReviewClick = () => {
    trackEvent('google_reviews_click', {
      ...trackingContext,
      event_category: 'engagement',
      placement: 'mobile_hero_review_badge',
      rating_source: reviewSummary.source,
      review_url: reviewSummary.reviewUrl,
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLeadSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const phone = normalizePhone(form.phone);
    if (!name || phone.length !== 10 || !form.consent) {
      setStatus('Please enter your name, 10-digit mobile number, and consent.');
      return;
    }

    const googleAdsAttribution = getGoogleAdsAttributionPayload();
    const leadEventId = `kalpa_mobile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setIsSubmitting(true);
    setStatus('');

    try {
      await api.post('/api/leads/enquiry', {
        project: 'Kalpavruksha',
        name,
        phone,
        requirements: 'Mobile brochure and map request. Share brochure, location pin, master plan and next available site visit slots on WhatsApp.',
        placement: 'mobile_brochure_map_form',
        platform_source: 'website',
        platformSource: 'Website',
        leadStatus: 'Brochure and Map Requested on WhatsApp',
        landingVariant,
        landing_variant: landingVariant,
        landingVersion,
        landing_version: landingVersion,
        version: landingVersion,
        website_version: landingVersion,
        landing_page_version: landingVersion,
        ab_test_name: 'kalpavruksha_landing_page',
        googleAdsAttribution,
      });

      const mobileConversionPayload = {
        ...trackingContext,
        ...buildGoogleAdsEventParams(googleAdsAttribution),
        event_category: 'conversion',
        form_name: 'kalpavruksha_brochure_map_mobile',
        placement: 'mobile_brochure_map_form',
        source: 'kalpavruksha_mobile_brochure_map_form',
        form_source: 'mobile_brochure_map_form',
        lead_type: 'brochure_map_request',
        lead_event_id: leadEventId,
        event_id: leadEventId,
        brochure_requested: true,
        map_requested: true,
        platform_source: 'website',
        phone,
        page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        page_location: typeof window !== 'undefined' ? window.location.href : undefined,
        page_title: typeof document !== 'undefined' ? document.title : undefined,
        website_version: landingVersion,
        landing_page_version: landingVersion,
        landing_page_variant: landingVariant,
      };

      trackEvent('brochure_downloaded', {
        ...mobileConversionPayload,
        conversion_type: 'brochure_map_requested',
        file_name: 'Kalpavruksha Project Brochure.pdf',
        file_extension: 'pdf',
        delivery_channel: 'whatsapp_follow_up',
      });

      trackEvent('generate_lead', {
        ...mobileConversionPayload,
        conversion_type: 'generate_lead',
      });

      setForm({ name: '', phone: '', consent: false });
      setStatus('Thank you. Our team will send the brochure and location map on WhatsApp shortly.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ZohoSalesIQWidgetLoader
        hideFloatButton
        homeWidgets={KALPAVRUKSHA_ZOHO_HOME_WIDGETS}
        theme={KALPAVRUKSHA_ZOHO_THEME}
        autoLoad={false}
      />
      <div
        ref={rootRef}
        className={`kalpa-mobile-ux-shell ${isV2 ? 'kmux-theme-v2' : 'kmux-theme-v1'}`}
      >
      <Helmet>
        <title>Kalpavruksha Residential Plots near Vijayawada | Easy Homes</title>
        <meta
          name="description"
          content="Kalpavruksha by Easy Homes: CRDA and RERA approved residential plots near Vijayawada and Amaravati with clubhouse, parks, CC roads and underground utilities."
        />
        <link rel="preload" as="image" href={siteEntranceWall} type="image/webp" fetchPriority="high" />
        <link
          rel="stylesheet"
          href={KALPAVRUKSHA_FONT_STYLESHEET}
          media="print"
          onLoad={(event) => {
            event.currentTarget.media = 'all';
          }}
        />
      </Helmet>

      <style>
        {`
          .kalpa-mobile-ux-shell {
            --pine:#173629;
            --pine-dark:#0f241c;
            --cream:#fbf4e8;
            --cream-2:#f0e2ca;
            --paper:#fffaf1;
            --gold:#b8863b;
            --gold-light:#d7a94f;
            --ink:#1f261f;
            --muted:#6d746b;
            --line:rgba(130, 99, 54, .22);
            --radius:22px;
            --shadow:0 22px 54px rgba(58, 42, 22, .16);
            min-height:100vh;
            background:
              radial-gradient(circle at top left, rgba(215,169,79,.24), transparent 28%),
              linear-gradient(180deg, #efe4d1 0%, #f8efe0 46%, #e8d6ba 100%);
            color:var(--ink);
            font-family:'Manrope', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            padding:0 0 86px;
          }

          .kalpa-mobile-ux-shell.kmux-theme-v2 {
            --pine:#28392b;
            --pine-dark:#17251d;
            --cream:#fff2df;
            --cream-2:#ead6b6;
            --paper:#fff8ee;
            --gold:#b56f37;
            --gold-light:#d29252;
            --ink:#223327;
            --muted:#62715f;
            --line:rgba(181, 111, 55, .24);
            --radius:28px;
            --shadow:0 26px 62px rgba(64, 45, 23, .18);
            background:
              radial-gradient(circle at 12% 8%, rgba(181,111,55,.18), transparent 32%),
              radial-gradient(circle at 86% 12%, rgba(127,141,98,.20), transparent 34%),
              linear-gradient(180deg, #fbf0df 0%, #ead6b6 48%, #f6ead8 100%);
          }

          .kalpa-mobile-ux-shell * { box-sizing:border-box; }
          .kalpa-mobile-ux-shell a,
          .kalpa-mobile-ux-shell button,
          .kalpa-mobile-ux-shell input { font:inherit; }

          .kmux-page {
            width:100%;
            max-width:460px;
            min-height:100vh;
            margin:0 auto;
            background:linear-gradient(180deg, var(--cream) 0%, var(--paper) 52%, var(--cream-2) 100%);
            overflow:hidden;
            box-shadow:0 18px 70px rgba(0,0,0,.16);
          }

          .kmux-theme-v2 .kmux-page {
            background:
              linear-gradient(145deg, rgba(255,255,255,.46) 0 14%, transparent 14% 100%),
              linear-gradient(180deg, #fff2df 0%, #f2dec1 44%, #fff7ec 100%);
          }

          .kmux-topmark {
            position:absolute;
            z-index:20;
            left:16px;
            right:16px;
            top:14px;
            display:flex;
            align-items:center;
            gap:10px;
            min-height:58px;
            padding:11px 12px;
            border:1px solid rgba(255,255,255,.24);
            border-radius:24px;
            color:#fff8df;
            background:rgba(15,36,28,.66);
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
            box-shadow:0 14px 42px rgba(0,0,0,.20);
          }

          .kmux-theme-v2 .kmux-topmark {
            color:#223327;
            border-color:rgba(181,111,55,.22);
            background:rgba(255,248,238,.90);
            border-radius:24px;
            box-shadow:0 16px 42px rgba(87, 60, 31, .16);
          }

          .kmux-brand {
            display:flex;
            align-items:center;
            gap:10px;
            width:100%;
          }

          .kmux-topmark svg {
            width:24px;
            height:24px;
            flex:0 0 auto;
            fill:none;
            stroke:var(--gold-light);
            stroke-width:1.5;
          }

          .kmux-theme-v2 .kmux-topmark svg {
            stroke:#b56f37;
          }

          .kmux-wordmark {
            display:flex;
            flex-direction:column;
            gap:1px;
            line-height:1;
          }

          .kmux-wordmark strong {
            font-family:'Fraunces', serif;
            font-size:18px;
            letter-spacing:.08em;
            text-transform:uppercase;
          }

          .kmux-wordmark span {
            color:rgba(255,248,230,.74);
            font-size:9px;
            font-weight:800;
            letter-spacing:.22em;
            text-transform:uppercase;
          }

          .kmux-theme-v2 .kmux-wordmark span {
            color:#62715f;
          }

          .kmux-hero {
            position:relative;
            display:flex;
            align-items:flex-start;
            padding:92px 16px 24px;
            overflow:hidden;
            background:
              radial-gradient(circle at 16% 0%, rgba(215,169,79,.18), transparent 36%),
              linear-gradient(180deg, var(--pine-dark), var(--pine));
          }

          .kmux-theme-v2 .kmux-hero {
            padding:94px 16px 26px;
            background:
              radial-gradient(circle at 12% 8%, rgba(181,111,55,.14), transparent 36%),
              radial-gradient(circle at 88% 18%, rgba(127,141,98,.22), transparent 34%),
              linear-gradient(180deg, #fff2df 0%, #ead6b6 100%);
          }

          .kmux-hero-content {
            position:relative;
            z-index:2;
            width:100%;
            padding:22px;
            border:1px solid rgba(255,255,255,.15);
            border-radius:26px;
            background:linear-gradient(180deg, rgba(18,39,32,.86), rgba(12,29,23,.92));
            box-shadow:0 26px 70px rgba(0,0,0,.30);
          }

          .kmux-theme-v2 .kmux-hero-content {
            padding:20px;
            border-radius:32px 32px 18px 32px;
            border-color:rgba(181,111,55,.22);
            background:
              linear-gradient(145deg, rgba(255,255,255,.72) 0 16%, rgba(255,248,238,.92) 16% 100%),
              #fff8ee;
            box-shadow:0 24px 58px rgba(87, 60, 31, .18);
          }

          .kmux-eyebrow {
            margin:0 0 12px;
            color:var(--gold-light);
            font-size:10.5px;
            line-height:1.35;
            font-weight:900;
            letter-spacing:.16em;
            text-transform:uppercase;
          }

          .kmux-reviews-badge {
            display:flex;
            align-items:center;
            flex-wrap:wrap;
            gap:7px;
            width:max-content;
            max-width:100%;
            margin:0 0 16px;
            padding:8px 10px;
            border:1px solid rgba(255,255,255,.18);
            border-radius:999px;
            color:rgba(255,248,230,.93);
            background:rgba(255,255,255,.08);
            text-decoration:none;
            font-size:12.5px;
          }

          .kmux-reviews-badge b,
          .kmux-reviews-badge .kmux-read { color:#fff4d9; }
          .kmux-reviews-badge .kmux-read { text-decoration:underline; text-underline-offset:3px; }

          .kmux-theme-v2 .kmux-reviews-badge {
            border-color:rgba(181,111,55,.18);
            color:#52684a;
            background:rgba(255,255,255,.64);
          }

          .kmux-theme-v2 .kmux-reviews-badge b,
          .kmux-theme-v2 .kmux-reviews-badge .kmux-read {
            color:#b56f37;
          }

          .kmux-stars {
            display:inline-flex;
            gap:2px;
            color:var(--gold-light);
          }

          .kmux-stars svg {
            width:13px;
            height:13px;
            fill:currentColor;
          }

          .kmux-hero h1 {
            margin:0 0 14px;
            color:#fffaf0;
            font-family:'Fraunces', serif;
            font-size:clamp(2.1rem, 10vw, 3.18rem);
            font-weight:700;
            line-height:.99;
            letter-spacing:-.04em;
            text-wrap:balance;
          }

          .kmux-theme-v2 .kmux-hero h1 {
            font-size:clamp(2rem, 9.4vw, 3rem);
            line-height:1.02;
            color:#223327;
          }

          .kmux-sub {
            margin:0 0 20px;
            color:rgba(255,250,240,.82);
            font-size:15px;
            line-height:1.5;
          }

          .kmux-theme-v2 .kmux-sub {
            color:#62715f;
          }

          .kmux-hero-gallery {
            position:relative;
            width:100%;
            height:206px;
            margin:18px 0 10px;
            padding:0;
            border:1px solid rgba(255,255,255,.16);
            border-radius:22px;
            overflow:hidden;
            background:#10231b;
            box-shadow:0 18px 42px rgba(0,0,0,.20);
            cursor:pointer;
          }

          .kmux-theme-v2 .kmux-hero-gallery {
            border-color:rgba(181,111,55,.20);
            border-radius:30px 30px 14px 30px;
            background:#f2dec1;
            box-shadow:0 18px 42px rgba(87, 60, 31, .16);
          }

          .kmux-hero-gallery img {
            width:100%;
            height:100%;
            display:block;
            object-fit:cover;
            animation:kmux-hero-image-in 680ms ease both;
          }

          .kmux-hero-gallery::after {
            content:'';
            position:absolute;
            z-index:1;
            inset:42% 0 0;
            background:linear-gradient(180deg, rgba(12,29,23,0) 0%, rgba(12,29,23,.78) 100%);
            pointer-events:none;
          }

          .kmux-live-marker {
            position:absolute;
            z-index:2;
            left:12px;
            top:12px;
            display:inline-flex;
            align-items:center;
            gap:7px;
            padding:7px 10px;
            border:1px solid rgba(255,255,255,.22);
            border-radius:999px;
            color:#fff8df;
            background:rgba(15,36,28,.72);
            box-shadow:0 10px 24px rgba(0,0,0,.20);
            font-size:10px;
            font-weight:900;
            letter-spacing:.12em;
            text-transform:uppercase;
            pointer-events:none;
          }

          .kmux-site-image-label {
            position:absolute;
            z-index:2;
            left:14px;
            right:14px;
            bottom:13px;
            display:flex;
            align-items:flex-end;
            justify-content:space-between;
            gap:10px;
            color:#fff8df;
            text-align:left;
            pointer-events:none;
          }

          .kmux-site-image-label small {
            display:block;
            margin:0 0 4px;
            color:var(--gold-light);
            font-size:10px;
            line-height:1.2;
            font-weight:900;
            letter-spacing:.18em;
            text-transform:uppercase;
          }

          .kmux-site-image-label strong {
            display:block;
            color:#fffaf0;
            font-family:'Fraunces', serif;
            font-size:1.28rem;
            line-height:1.05;
            font-weight:700;
            text-shadow:0 8px 22px rgba(0,0,0,.35);
          }

          .kmux-site-image-count {
            flex:0 0 auto;
            border:1px solid rgba(255,255,255,.30);
            border-radius:999px;
            background:rgba(15,36,28,.68);
            padding:6px 9px;
            color:#fff8df;
            font-size:10px;
            font-weight:900;
            letter-spacing:.14em;
          }

          .kmux-theme-v2 .kmux-live-marker {
            color:#fff8df;
            background:rgba(34,51,39,.76);
          }

          .kmux-theme-v2 .kmux-site-image-label small {
            color:#ffd88a;
          }

          .kmux-theme-v2 .kmux-site-image-count {
            background:rgba(34,51,39,.72);
          }

          .kmux-live-dot {
            width:7px;
            height:7px;
            border-radius:999px;
            background:var(--gold-light);
            box-shadow:0 0 0 5px rgba(215,169,79,.20);
          }

          @keyframes kmux-hero-image-in {
            from { opacity:.62; transform:scale(1.035); }
            to { opacity:1; transform:scale(1); }
          }

          .kmux-hero-actions {
            display:grid;
            gap:10px;
            margin-top:16px;
          }

          .kmux-cta-primary,
          .kmux-cta-secondary,
          .kmux-stickybar a,
          .kmux-stickybar button,
          .kmux-hero-gallery {
            -webkit-tap-highlight-color:transparent;
          }

          .kmux-cta-primary {
            min-height:54px;
            width:100%;
            border:0;
            border-radius:16px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#17130d;
            background:linear-gradient(180deg, #e1b454 0%, var(--gold-light) 100%);
            font-size:15px;
            font-weight:900;
            text-align:center;
            text-decoration:none;
            box-shadow:0 14px 32px rgba(0,0,0,.18);
            cursor:pointer;
          }

          .kmux-theme-v2 .kmux-cta-primary {
            border-radius:999px;
            background:linear-gradient(180deg, #e0aa54 0%, #d29252 100%);
          }

          .kmux-cta-primary:disabled {
            cursor:not-allowed;
            opacity:.72;
          }

          .kmux-cta-secondary {
            min-height:48px;
            border:1px solid rgba(255,255,255,.20);
            border-radius:16px;
            display:flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            color:#fff4df;
            background:rgba(255,255,255,.08);
            text-decoration:none;
            font-size:14px;
            font-weight:800;
          }

          .kmux-theme-v2 .kmux-cta-secondary {
            border-radius:999px;
            border-color:rgba(181,111,55,.22);
            color:#52684a;
            background:rgba(255,255,255,.72);
          }

          .kmux-cta-secondary svg {
            width:18px;
            height:18px;
          }

          .kmux-hero-dots {
            display:flex;
            align-items:center;
            gap:8px;
            margin:0 0 4px;
          }

          .kmux-hero-dots button {
            width:8px;
            height:8px;
            padding:0;
            border:0;
            border-radius:999px;
            background:rgba(255,255,255,.36);
            cursor:pointer;
            transition:width 260ms ease, background 260ms ease;
          }

          .kmux-theme-v2 .kmux-hero-dots button {
            background:rgba(181,111,55,.24);
          }

          .kmux-hero-dots button.is-active {
            width:34px;
            background:var(--gold-light);
          }

          .kmux-section {
            position:relative;
            padding:34px 22px;
            border-top:1px solid var(--line);
          }

          @supports (content-visibility: auto) {
            .kmux-section,
            .kmux-footer {
              content-visibility:auto;
              contain-intrinsic-size:1px 560px;
            }
          }

          .kmux-reveal {
            opacity:0;
            transform:translateY(18px);
            transition:opacity 620ms ease var(--kmux-delay, 0ms), transform 620ms ease var(--kmux-delay, 0ms);
          }

          .kmux-reveal.kmux-visible {
            opacity:1;
            transform:translateY(0);
          }

          .kmux-section-title {
            margin:0 0 9px;
            color:var(--pine-dark);
            font-family:'Fraunces', serif;
            font-size:26px;
            line-height:1.08;
            letter-spacing:-.02em;
            text-wrap:balance;
          }

          .kmux-section-note {
            margin:0 0 20px;
            color:var(--muted);
            font-size:14.5px;
            line-height:1.55;
          }

          .kmux-facts {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
            background:var(--cream);
          }

          .kmux-theme-v2 .kmux-facts {
            background:linear-gradient(180deg, #fff5e7, #f1ddc0);
          }

          .kmux-fact {
            min-height:112px;
            display:flex;
            flex-direction:column;
            justify-content:space-between;
            padding:16px;
            border:1px solid var(--line);
            border-radius:22px;
            background:rgba(255,255,255,.70);
            box-shadow:0 14px 28px rgba(67,45,20,.08);
          }

          .kmux-theme-v2 .kmux-fact {
            border-radius:26px 26px 12px 26px;
            background:rgba(255,250,242,.78);
          }

          .kmux-label {
            margin:0;
            color:var(--gold);
            font-size:10px;
            font-weight:900;
            letter-spacing:.16em;
            text-transform:uppercase;
          }

          .kmux-value {
            margin:0;
            color:var(--ink);
            font-size:20px;
            line-height:1.12;
            font-weight:900;
          }

          .kmux-availability {
            background:var(--paper);
          }

          .kmux-availability-card {
            padding:18px;
            border:1px solid var(--line);
            border-radius:26px;
            background:linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,246,231,.76));
            box-shadow:var(--shadow);
          }

          .kmux-theme-v2 .kmux-availability-card {
            border-radius:30px 18px 30px 18px;
          }

          .kmux-bar {
            display:flex;
            height:18px;
            overflow:hidden;
            border-radius:999px;
            background:#ddd1ba;
            margin:4px 0 15px;
          }

          .kmux-bar .sold { background:var(--pine); }
          .kmux-bar .reserved { background:var(--gold); }
          .kmux-bar .available { background:var(--gold-light); }

          .kmux-legend {
            display:flex;
            flex-wrap:wrap;
            gap:12px 14px;
            margin-bottom:16px;
          }

          .kmux-legend-item {
            display:flex;
            align-items:center;
            gap:7px;
            color:var(--ink);
            font-size:12.5px;
            font-weight:700;
          }

          .kmux-legend-dot {
            width:10px;
            height:10px;
            border-radius:3px;
            flex-shrink:0;
          }

          .kmux-urgency-note {
            border:1px solid rgba(184,134,59,.30);
            background:#fff9ec;
            padding:13px 14px;
            border-radius:16px;
            color:#3a2a16;
            font-size:13.5px;
            line-height:1.45;
          }

          .kmux-amenities {
            background:linear-gradient(180deg, var(--cream-2), var(--cream));
          }

          .kmux-amenity-card {
            display:grid;
            grid-template-columns:48px 1fr;
            gap:15px;
            padding:16px 0;
            border-bottom:1px solid var(--line);
          }

          .kmux-amenity-card:last-child { border-bottom:0; }

          .kmux-amenity-icon {
            width:48px;
            height:48px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:16px;
            color:var(--gold-light);
            background:var(--pine);
            box-shadow:0 14px 24px rgba(18,39,32,.14);
          }

          .kmux-theme-v2 .kmux-amenity-icon {
            border-radius:20px 20px 8px 20px;
          }

          .kmux-amenity-icon svg {
            width:24px;
            height:24px;
            stroke:currentColor;
            stroke-width:1.7;
            fill:none;
          }

          .kmux-amenity-copy h3,
          .kmux-persona-card h3 {
            margin:0 0 6px;
            color:var(--pine-dark);
            font-size:17px;
            line-height:1.22;
            font-weight:900;
          }

          .kmux-amenity-copy p,
          .kmux-persona-card p {
            margin:0;
            color:var(--muted);
            font-size:14px;
            line-height:1.5;
          }

          .kmux-personas {
            background:var(--paper);
          }

          .kmux-persona-card {
            margin-top:12px;
            padding:18px;
            border:1px solid var(--line);
            border-radius:26px;
            background:rgba(255,255,255,.75);
            box-shadow:0 14px 28px rgba(67,45,20,.08);
          }

          .kmux-theme-v2 .kmux-persona-card {
            border-radius:30px 18px 30px 18px;
          }

          .kmux-persona-card a,
          .kmux-persona-card button {
            display:inline-flex;
            margin-top:13px;
            padding:0;
            border:0;
            color:var(--gold);
            background:transparent;
            text-decoration:none;
            font-size:14px;
            font-weight:900;
            cursor:pointer;
          }

          .kmux-cta-band {
            background:
              radial-gradient(circle at 20% 0%, rgba(215,169,79,.20), transparent 35%),
              linear-gradient(180deg, var(--pine), var(--pine-dark));
            color:#fffaf0;
            text-align:center;
          }

          .kmux-cta-band .kmux-section-title { color:#fffaf0; }
          .kmux-cta-band .kmux-section-note { color:rgba(255,250,240,.76); }

          .kmux-form-wrap {
            background:var(--cream);
          }

          .kmux-form {
            padding:18px;
            border:1px solid var(--line);
            border-radius:28px;
            background:rgba(255,255,255,.74);
            box-shadow:var(--shadow);
          }

          .kmux-theme-v2 .kmux-form {
            border-radius:34px 20px 34px 20px;
          }

          .kmux-form .field { margin-bottom:15px; }

          .kmux-form label {
            display:block;
            margin:0 0 7px;
            color:var(--ink);
            font-size:13px;
            font-weight:850;
          }

          .kmux-form input[type='text'],
          .kmux-form input[type='tel'] {
            width:100%;
            min-height:56px;
            border:1.4px solid rgba(130,99,54,.24);
            border-radius:16px;
            background:#fff;
            padding:0 16px;
            color:var(--ink);
            font-size:16px;
            outline:none;
          }

          .kmux-form input:focus {
            border-color:var(--gold);
            box-shadow:0 0 0 4px rgba(184,134,59,.16);
          }

          .kmux-consent {
            display:grid !important;
            grid-template-columns:28px 1fr;
            align-items:start;
            gap:11px;
            margin:6px 0 18px !important;
            color:var(--muted);
            font-size:13px !important;
            font-weight:500 !important;
            line-height:1.4;
          }

          .kmux-consent input {
            width:28px;
            height:28px;
            margin:0;
            accent-color:var(--gold);
          }

          .kmux-form-status {
            min-height:18px;
            margin:12px 0 0;
            color:var(--pine);
            font-size:13px;
            font-weight:800;
          }

          .kmux-footer {
            padding:30px 24px 34px;
            background:var(--pine-dark);
            color:rgba(255,250,240,.72);
            font-size:12.5px;
            line-height:1.65;
          }

          .kmux-fwordmark {
            margin-bottom:12px;
            color:#fffaf0;
            font-family:'Fraunces', serif;
            font-size:21px;
            font-weight:700;
          }

          .kmux-stickybar {
            position:fixed;
            z-index:80;
            left:50%;
            bottom:0;
            transform:translateX(-50%);
            width:100%;
            max-width:460px;
            display:flex;
            gap:10px;
            padding:10px;
            background:rgba(255,248,238,.98);
            border-top:1px solid var(--line);
            box-shadow:0 -10px 30px rgba(0,0,0,.13);
          }

          .kmux-stickybar .kmux-icon-btn {
            width:48px;
            height:48px;
            flex-shrink:0;
            display:flex;
            align-items:center;
            justify-content:center;
            border:1.5px solid var(--line);
            border-radius:16px;
            color:var(--pine);
            background:#fff;
            text-decoration:none;
          }

          .kmux-theme-v2 .kmux-stickybar .kmux-icon-btn {
            border-radius:999px;
          }

          .kmux-stickybar .kmux-visit {
            flex:1;
            min-height:48px;
            border:0;
            border-radius:16px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#15120d;
            background:var(--gold-light);
            text-decoration:none;
            font-size:14.5px;
            font-weight:900;
          }

          .kmux-theme-v2 .kmux-stickybar .kmux-visit {
            border-radius:999px;
          }

          .kmux-stickybar svg {
            width:21px;
            height:21px;
          }

          .kmux-lightbox {
            position:fixed;
            z-index:100;
            inset:0;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:18px;
            background:rgba(12,24,18,.92);
          }

          .kmux-lightbox button {
            position:absolute;
            top:18px;
            right:18px;
            width:42px;
            height:42px;
            border:1px solid rgba(255,255,255,.25);
            border-radius:999px;
            color:#fff;
            background:rgba(255,255,255,.10);
            font-size:24px;
            cursor:pointer;
          }

          .kmux-lightbox img {
            max-width:100%;
            max-height:82vh;
            border-radius:18px;
            object-fit:contain;
            box-shadow:0 26px 80px rgba(0,0,0,.42);
          }

          .kmux-lightbox-caption {
            position:absolute;
            left:18px;
            right:76px;
            top:18px;
            min-height:42px;
            display:flex;
            flex-direction:column;
            justify-content:center;
            color:#fff8df;
            text-align:left;
          }

          .kmux-lightbox-caption small {
            color:var(--gold-light);
            font-size:10px;
            font-weight:900;
            letter-spacing:.18em;
            text-transform:uppercase;
          }

          .kmux-lightbox-caption strong {
            margin-top:2px;
            font-family:'Fraunces', serif;
            font-size:1.15rem;
            line-height:1.05;
          }
        `}
      </style>

      <main className="kmux-page">
        <div className="kmux-topmark">
          <div className="kmux-brand">
            <SmallTreeIcon />
            <div className="kmux-wordmark">
              <strong>Kalpavruksha</strong>
              <span>Easy Homes</span>
            </div>
          </div>
        </div>

        <section id="kmux-overview" className="kmux-hero">
          <div className="kmux-hero-content kmux-reveal kmux-visible">
            <p className="kmux-eyebrow">CRDA & RERA Approved - Amaravati Growth Corridor</p>
            <a
              className="kmux-reviews-badge"
              href={reviewSummary.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackReviewClick}
            >
              <StarRow rating={reviewSummary.rating} />
              <b>{reviewSummary.rating}</b>
              <span>{reviewSummary.reviewCount} Google Reviews</span>
              <span className="kmux-read">read them</span>
            </a>
            <h1>Residential Plots near Vijayawada, close to Amaravati</h1>
            <p className="kmux-sub">
              A real housing neighbourhood with clubhouse, 3 parks, CC roads,
              underground utilities and secure 11&apos; compound wall.
            </p>
            <button
              type="button"
              className="kmux-hero-gallery"
              aria-label={`Open ${activeHeroImage.title} photo`}
              onClick={() => setLightboxImage(activeHeroImage)}
            >
              <span className="kmux-live-marker">
                <span className="kmux-live-dot" />
                Live from the site
              </span>
              <img
                key={activeHeroImage.title}
                src={activeHeroImage.image}
                alt={activeHeroImage.alt}
                width="1200"
                height="675"
                loading={activeHeroIndex === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={activeHeroIndex === 0 ? 'high' : 'low'}
              />
              <span className="kmux-site-image-label">
                <span>
                  <small>Site image</small>
                  <strong>{activeHeroImage.title}</strong>
                </span>
                <span className="kmux-site-image-count">
                  {String(activeHeroIndex + 1).padStart(2, '0')} / {siteImages.length}
                </span>
              </span>
            </button>
            <div className="kmux-hero-dots" aria-label="Live site slideshow">
              {siteImages.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  className={index === activeHeroIndex ? 'is-active' : ''}
                  aria-label={`Show ${item.title}`}
                  onClick={() => setActiveHeroIndex(index)}
                />
              ))}
            </div>
            <div className="kmux-hero-actions">
              <a href="#book" className="kmux-cta-primary" onClick={() => trackFormOpen('mobile_hero_get_price')}>
                Get Price & Location
              </a>
              <a
                href={buildWhatsAppUrl('Hi Easy Homes, I would like details on Kalpavruksha.')}
                className="kmux-cta-secondary"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => openWhatsApp('mobile_hero_whatsapp')}
              >
                <WhatsAppIcon />
                or tap to WhatsApp us
              </a>
            </div>
          </div>
        </section>

        <section id="kmux-facts" className="kmux-section kmux-facts" aria-label="Kalpavruksha quick facts">
          {quickFacts.map(([label, value]) => (
            <div className="kmux-fact kmux-reveal" key={label}>
              <p className="kmux-label">{label}</p>
              <p className="kmux-value">{value}</p>
            </div>
          ))}
        </section>

        <section className="kmux-section kmux-availability">
          <div className="kmux-availability-card kmux-reveal">
            <h2 className="kmux-section-title">Plot availability - Phase 1</h2>
            <p className="kmux-section-note">87 plots in this phase. Here&apos;s exactly where things stand today.</p>
            <div className="kmux-bar" role="img" aria-label="17 sold, 6 reserved, 64 available out of 87 plots">
              <span className="sold" style={{ width: '19.5%' }} />
              <span className="reserved" style={{ width: '6.9%' }} />
              <span className="available" style={{ width: '73.6%' }} />
            </div>
            <div className="kmux-legend">
              <div className="kmux-legend-item"><span className="kmux-legend-dot" style={{ background: 'var(--pine)' }} />Sold - <b>17</b></div>
              <div className="kmux-legend-item"><span className="kmux-legend-dot" style={{ background: 'var(--gold)' }} />Reserved - <b>6</b></div>
              <div className="kmux-legend-item"><span className="kmux-legend-dot" style={{ background: 'var(--gold-light)' }} />Available - <b>64</b></div>
            </div>
            <div className="kmux-urgency-note">
              Price increases once <b>40</b> plots are sold. At <b>17</b> sold today, that&apos;s <b>23</b> plots away.
            </div>
          </div>
        </section>

        <section id="kmux-layout" className="kmux-section kmux-amenities">
          <div className="kmux-reveal">
            <h2 className="kmux-section-title">What&apos;s inside the layout</h2>
            <p className="kmux-section-note">Built around a working creek and the hills behind it, not around a brochure.</p>
          </div>
          {amenities.map((item) => (
            <article className="kmux-amenity-card kmux-reveal" key={item.title}>
              <div className="kmux-amenity-icon"><AmenityIcon type={item.icon} /></div>
              <div className="kmux-amenity-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="kmux-section kmux-personas">
          <div className="kmux-reveal">
            <h2 className="kmux-section-title">Built for two kinds of buyers</h2>
          </div>
          <article className="kmux-persona-card kmux-reveal">
            <h3>Building in Vijayawada or Guntur, in 2-3 years?</h3>
            <p>Lock in a CRDA-approved plot now, at Phase 1 pricing, while you plan and save toward construction.</p>
            <a href="#book" onClick={() => trackFormOpen('mobile_persona_available_plots')}>See available plots -&gt;</a>
          </article>
          <article className="kmux-persona-card kmux-reveal">
            <h3>Investing from Hyderabad?</h3>
            <p>An AP-origin capital-region asset you can track remotely, with site visits arranged around your travel dates.</p>
            <button type="button" onClick={() => openSiteVisitForm('mobile_persona_plan_visit')}>Plan a visit -&gt;</button>
          </article>
        </section>

        <section className="kmux-section kmux-cta-band">
          <div className="kmux-reveal">
            <h2 className="kmux-section-title">Limited site visit slots this week</h2>
            <p className="kmux-section-note">We keep visit groups small so you actually get time on the ground. Tap below to hold a slot.</p>
            <button type="button" className="kmux-cta-primary" onClick={() => openSiteVisitForm('mobile_limited_slots')}>
              Book a Free Site Visit
            </button>
          </div>
        </section>

        <section className="kmux-section kmux-form-wrap" id="book">
          <div className="kmux-reveal">
            <h2 className="kmux-section-title">Get the brochure & map</h2>
            <p className="kmux-section-note">Sent straight to your WhatsApp - location pin, master plan and next available visit slots.</p>
          </div>
          <form className="kmux-form kmux-reveal" onSubmit={handleLeadSubmit}>
            <div className="field">
              <label htmlFor={`kmux-name-${landingVersion}`}>Your name</label>
              <input
                id={`kmux-name-${landingVersion}`}
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor={`kmux-phone-${landingVersion}`}>Phone number</label>
              <input
                id={`kmux-phone-${landingVersion}`}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                inputMode="numeric"
              />
            </div>
            <label className="kmux-consent">
              <input
                name="consent"
                type="checkbox"
                checked={form.consent}
                onChange={handleChange}
              />
              <span>I agree to be contacted by Easy Homes about Kalpavruksha, on call and WhatsApp.</span>
            </label>
            <button type="submit" className="kmux-cta-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send Me the Brochure on WhatsApp'}
            </button>
            <p className="kmux-form-status" aria-live="polite">{status}</p>
          </form>
        </section>

        <footer className="kmux-footer">
          <div className="kmux-fwordmark">Easy Homes</div>
          <div>Kalpavruksha, Keelespuram, Amaravati Growth Corridor, Andhra Pradesh</div>
          <div>CRDA Approved Layout</div>
          <div>RERA ID: P06160035909</div>
          <div>Phone: +91 89888 96666</div>
        </footer>
      </main>

      <nav className="kmux-stickybar" aria-label="Kalpavruksha quick actions">
        <a href={CALL_URL} className="kmux-icon-btn" aria-label="Call Easy Homes" onClick={() => trackPhoneClick('mobile_sticky_bar')}>
          <PhoneIcon />
        </a>
        <a
          href={buildWhatsAppUrl('Hi Easy Homes, I would like details on Kalpavruksha.')}
          className="kmux-icon-btn"
          aria-label="WhatsApp Easy Homes"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => openWhatsApp('mobile_sticky_bar')}
        >
          <WhatsAppIcon />
        </a>
        <button type="button" className="kmux-visit" onClick={() => openSiteVisitForm('mobile_sticky_book_visit')}>
          Book Site Visit
        </button>
      </nav>

      {lightboxImage && (
        <div className="kmux-lightbox" role="dialog" aria-modal="true" aria-label={lightboxImage.title}>
          <button type="button" aria-label="Close image preview" onClick={() => setLightboxImage(null)}>x</button>
          <div className="kmux-lightbox-caption">
            <small>Site image</small>
            <strong>{lightboxImage.title}</strong>
          </div>
          <img src={lightboxImage.image} alt={lightboxImage.alt} />
        </div>
      )}
      </div>
    </>
  );
}
