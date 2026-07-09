import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { trackEvent, trackWhatsAppClick } from '../utils/analytics';
import { captureGoogleAdsAttribution, getGoogleAdsAttributionPayload } from '../utils/googleAdsAttribution';
import { KALPAVRUKSHA_WHATSAPP_NUMBER } from '../utils/kalpavrukshaWhatsapp';
import ZohoSalesIQWidgetLoader, { openZohoSalesIQChat } from '../components/ZohoSalesIQWidgetLoader';
import siteCompoundWall from '../assets/kalpavruksha/live-compound-wall-1200.webp';
import siteClubhouseLawn from '../assets/kalpavruksha/live-clubhouse-lawn-1200.webp';
import siteSeatingPavilion from '../assets/kalpavruksha/live-seating-pavilion-1200.webp';
import siteMainGate from '../assets/kalpavruksha/live-main-gate-1200.webp';
import galleryClubhouse from '../assets/kalpavruksha/club house.webp';
import galleryContourGarden from '../assets/kalpavruksha/contour garden.webp';
import galleryArrivalCourt from '../assets/kalpavruksha/arrival court.webp';
import galleryLotusPond from '../assets/kalpavruksha/lotus pond 2.webp';

const CALL_URL = 'tel:+918988896666';
const EASY_HOMES_OFFICE_ADDRESS = [
  '4th Floor, adjacent to GIG International School,',
  'Gollapudi, Vijayawada, Andhra Pradesh 521225',
];
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
const KALPAVRUKSHA_ZOHO_CHAT_QUESTION =
  'Hi Easy Homes, I want details about Kalpavruksha open plots, pricing, and site visit availability.';

const siteImages = [
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

const galleryImages = [
  {
    title: 'Modern Clubhouse',
    category: 'Project gallery',
    image: galleryClubhouse,
    alt: 'Kalpavruksha clubhouse exterior with landscaped lawns and lifestyle amenities',
  },
  {
    title: 'Contour Garden',
    category: 'Project gallery',
    image: galleryContourGarden,
    alt: 'Kalpavruksha contour garden with landscaped pathways and open recreational greens',
  },
  {
    title: 'Arrival Court',
    category: 'Project gallery',
    image: galleryArrivalCourt,
    alt: 'Kalpavruksha arrival court with landscaped entry features inside the gated layout',
  },
  {
    title: 'Lotus Pond Retreat',
    category: 'Project gallery',
    image: galleryLotusPond,
    alt: 'Kalpavruksha lotus pond water feature with curved walkways and reflective landscaping',
  },
];

const quickFacts = [
  { label: 'Price From', value: 'Rs. 31 Lakhs', detail: 'onwards' },
  { label: 'Location', value: 'Vemavaram' },
  { label: 'Access', value: '5 KM', detail: 'from West Bypass & Rayanapadu', wide: true },
  { label: 'Project Area', value: '11 Acres' },
  { label: 'Plot Sizes', value: '174-525', detail: 'Sq.yd.' },
  { label: 'Developer Maintenance', value: 'Till Dec 2030', wide: true },
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
    title: 'Site Office',
    text: 'On-site support desk for project details, layout guidance, booking assistance, and site-visit coordination.',
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

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none" aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.7 8.7 0 0 1-7.8 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.5A8.4 8.4 0 0 1 4 11.7 8.7 8.7 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.6 8.6 0 0 1 8 8v.4z" />
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
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
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const isV2 = landingVariant === 'B' || landingVersion === 'v2';

  const reviewSummary = {
    ...GOOGLE_REVIEW_FALLBACK,
    ...googleReviewSummary,
  };

  const activeHeroImage = siteImages[activeHeroIndex] || siteImages[0];
  const activeGalleryImage = galleryImages[activeGalleryIndex] || galleryImages[0];
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
    if (typeof document === 'undefined') {
      return undefined;
    }

    document.body.classList.add('kalpa-mobile-ux-active');
    return () => {
      document.body.classList.remove('kalpa-mobile-ux-active');
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % siteImages.length);
    }, 4200);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveGalleryIndex((current) => (current + 1) % galleryImages.length);
    }, 4600);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let ticking = false;
    const updateVisibility = () => {
      const hero = rootRef.current?.querySelector('.kmux-hero');
      const heroHeight = hero?.offsetHeight || window.innerHeight || 1;
      setShowFloatingChat((window.scrollY || window.pageYOffset || 0) > heroHeight * 0.5);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('orientationchange', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      window.removeEventListener('orientationchange', requestUpdate);
    };
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

  const launchLiveChat = async (placement) => {
    trackEvent('live_chat_open', {
      ...trackingContext,
      ...buildGoogleAdsEventParams(),
      event_category: 'lead',
      placement,
      provider: 'zoho_salesiq',
    });

    const opened = await openZohoSalesIQChat({
      question: KALPAVRUKSHA_ZOHO_CHAT_QUESTION,
      timeoutMs: 12000,
    });

    if (opened) return;

    trackEvent('live_chat_unavailable', {
      ...trackingContext,
      ...buildGoogleAdsEventParams(),
      event_category: 'lead',
      placement,
      provider: 'zoho_salesiq',
    });
    setStatus('Live chat is temporarily unavailable. Please call or WhatsApp us.');
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
    if (!name || phone.length !== 10) {
      setStatus('Please enter your name and a valid 10-digit mobile number.');
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

      setForm({ name: '', phone: '' });
      setStatus('Thank you. Our team will send the brochure and location map on WhatsApp shortly.');
      navigate('/thank-you?type=brochure-map');
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
        autoLoad
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
        <link rel="preload" as="image" href={siteMainGate} type="image/webp" fetchPriority="high" />
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
            gap:12px;
            background:
              radial-gradient(circle at 92% 4%, rgba(215,169,79,.18), transparent 34%),
              linear-gradient(180deg, var(--cream), var(--cream-2));
          }

          .kmux-theme-v2 .kmux-facts {
            background:
              radial-gradient(circle at 8% 0%, rgba(181,111,55,.16), transparent 36%),
              linear-gradient(180deg, #fff5e7, #f1ddc0);
          }

          .kmux-fact {
            position:relative;
            min-width:0;
            min-height:118px;
            display:flex;
            flex-direction:column;
            justify-content:flex-start;
            gap:9px;
            padding:18px;
            border:1px solid var(--line);
            border-radius:24px;
            overflow:hidden;
            background:linear-gradient(145deg, rgba(255,255,255,.90), rgba(255,250,241,.72));
            box-shadow:0 14px 32px rgba(67,45,20,.075);
          }

          .kmux-fact::after {
            content:'';
            position:absolute;
            right:-24px;
            bottom:-30px;
            width:76px;
            height:76px;
            border-radius:50%;
            background:rgba(215,169,79,.10);
            pointer-events:none;
          }

          .kmux-fact.is-wide {
            grid-column:1 / -1;
            min-height:104px;
          }

          .kmux-fact.is-wide .kmux-value {
            font-size:24px;
          }

          .kmux-theme-v2 .kmux-fact {
            border-radius:28px 28px 14px 28px;
            background:linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,246,231,.76));
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
            position:relative;
            z-index:1;
            margin:auto 0 0;
            color:var(--ink);
            font-size:clamp(18px, 5vw, 22px);
            line-height:1.08;
            font-weight:900;
            letter-spacing:-.025em;
            overflow-wrap:anywhere;
          }

          .kmux-fact-detail {
            position:relative;
            z-index:1;
            margin:-3px 0 0;
            color:var(--muted);
            font-size:12px;
            line-height:1.35;
            font-weight:700;
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

          .kmux-amenity-copy h3 {
            margin:0 0 6px;
            color:var(--pine-dark);
            font-size:17px;
            line-height:1.22;
            font-weight:900;
          }

          .kmux-amenity-copy p {
            margin:0;
            color:var(--muted);
            font-size:14px;
            line-height:1.5;
          }

          .kmux-gallery {
            background:
              radial-gradient(circle at 88% 6%, rgba(215,169,79,.16), transparent 30%),
              linear-gradient(180deg, var(--paper), var(--cream));
          }

          .kmux-gallery-frame {
            width:100%;
            padding:0;
            border:1px solid var(--line);
            border-radius:28px;
            overflow:hidden;
            color:#fffaf0;
            background:var(--pine-dark);
            box-shadow:var(--shadow);
            text-align:left;
            cursor:pointer;
          }

          .kmux-theme-v2 .kmux-gallery-frame {
            border-radius:32px 32px 16px 32px;
          }

          .kmux-gallery-image {
            position:relative;
            height:288px;
            overflow:hidden;
            background:#d9ceb9;
          }

          .kmux-gallery-image::after {
            content:'';
            position:absolute;
            inset:48% 0 0;
            background:linear-gradient(180deg, transparent, rgba(12,29,23,.82));
            pointer-events:none;
          }

          .kmux-gallery-image img {
            width:100%;
            height:112%;
            display:block;
            object-fit:cover;
            object-position:center top;
            transform:translateY(-2%);
            animation:kmux-gallery-image-in 720ms ease both;
          }

          .kmux-gallery-caption {
            position:absolute;
            z-index:2;
            left:18px;
            right:18px;
            bottom:16px;
            display:flex;
            align-items:flex-end;
            justify-content:space-between;
            gap:14px;
          }

          .kmux-gallery-caption small {
            display:block;
            margin-bottom:5px;
            color:var(--gold-light);
            font-size:10px;
            font-weight:900;
            letter-spacing:.18em;
            text-transform:uppercase;
          }

          .kmux-gallery-caption strong {
            display:block;
            color:#fffaf0;
            font-family:'Fraunces', serif;
            font-size:1.45rem;
            line-height:1.05;
          }

          .kmux-gallery-count {
            flex:0 0 auto;
            padding:7px 10px;
            border:1px solid rgba(255,255,255,.28);
            border-radius:999px;
            background:rgba(15,36,28,.68);
            color:#fff8df;
            font-size:10px;
            font-weight:900;
            letter-spacing:.14em;
          }

          .kmux-gallery-controls {
            display:flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            margin-top:15px;
          }

          .kmux-gallery-controls button {
            width:8px;
            height:8px;
            padding:0;
            border:0;
            border-radius:999px;
            background:rgba(23,54,41,.22);
            transition:width 260ms ease, background 260ms ease;
          }

          .kmux-gallery-controls button.is-active {
            width:34px;
            background:var(--gold);
          }

          @keyframes kmux-gallery-image-in {
            from { opacity:.55; transform:translateY(-2%) scale(1.035); }
            to { opacity:1; transform:translateY(-2%) scale(1); }
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

          body.kalpa-mobile-ux-active #zsiq_float,
          body.kalpa-mobile-ux-active #zsiq_floatmain,
          body.kalpa-mobile-ux-active .zsiq_floatmain {
            display:none !important;
          }

          .kmux-chat-float {
            position:fixed;
            z-index:82;
            right:14px;
            bottom:calc(env(safe-area-inset-bottom) + 88px);
            width:46px;
            height:46px;
            display:flex;
            align-items:center;
            justify-content:center;
            border:1px solid #d7ba82;
            border-radius:999px;
            background:linear-gradient(180deg,#fffefb 0%,#f4ead8 100%);
            color:#8b6328;
            box-shadow:0 18px 36px rgba(83,64,31,.15);
            opacity:0;
            pointer-events:none;
            transform:translateY(10px) scale(.96);
            transition:opacity 220ms ease, transform 220ms ease, box-shadow 220ms ease;
          }

          .kmux-theme-v2 .kmux-chat-float {
            border-color:rgba(181,111,55,.28);
            background:#fff7e8;
            color:#8b5526;
            box-shadow:0 18px 36px rgba(82,104,74,.15);
          }

          .kmux-chat-float.is-visible {
            opacity:.9;
            pointer-events:auto;
            transform:translateY(0) scale(1);
          }

          .kmux-chat-float:hover {
            opacity:1;
            transform:translateY(-2px) scale(1.03);
            box-shadow:0 22px 42px rgba(83,64,31,.18);
          }

          .kmux-chat-float svg {
            width:20px;
            height:20px;
          }

          @media (min-width:700px) {
            .kalpa-mobile-ux-shell {
              padding:20px 20px 118px;
            }

            .kmux-page {
              max-width:920px;
              border:1px solid var(--line);
              border-radius:36px;
              overflow:hidden;
            }

            .kmux-topmark {
              left:28px;
              right:28px;
              top:24px;
              min-height:72px;
              padding:14px 18px;
              border-radius:30px;
            }

            .kmux-wordmark strong {
              font-size:22px;
              letter-spacing:.16em;
            }

            .kmux-hero {
              padding:122px 30px 118px;
            }

            .kmux-hero-content {
              display:block;
              max-width:720px;
              margin:0 auto;
              padding:30px;
              border-radius:36px;
            }

            .kmux-theme-v2 .kmux-hero-content {
              padding:28px;
              border-radius:38px 38px 20px 38px;
            }

            .kmux-reviews-badge,
            .kmux-eyebrow,
            .kmux-hero h1,
            .kmux-sub,
            .kmux-hero-actions {
              grid-column:auto;
            }

            .kmux-hero h1 {
              max-width:600px;
              font-size:clamp(2.32rem, 6.2vw, 3.45rem);
            }

            .kmux-theme-v2 .kmux-hero h1 {
              font-size:clamp(2.22rem, 5.8vw, 3.25rem);
            }

            .kmux-sub {
              max-width:620px;
              font-size:16px;
            }

            .kmux-hero-gallery {
              grid-column:auto;
              grid-row:auto;
              height:min(46vw, 340px);
              min-height:280px;
              margin:22px 0 12px;
            }

            .kmux-hero-dots {
              grid-column:auto;
              margin:0 0 4px;
              justify-content:center;
            }

            .kmux-hero-actions {
              max-width:520px;
            }

            .kmux-section {
              padding:46px 44px;
            }

            .kmux-section-title {
              font-size:36px;
            }

            .kmux-section-note {
              max-width:680px;
              font-size:16px;
            }

            .kmux-facts {
              grid-template-columns:repeat(3, minmax(0, 1fr));
              gap:14px;
              padding:36px 44px;
            }

            .kmux-fact {
              min-height:138px;
            }

            .kmux-fact.is-wide {
              grid-column:auto;
              min-height:138px;
            }

            .kmux-fact.is-wide .kmux-value {
              font-size:clamp(20px, 2.4vw, 25px);
            }

            .kmux-amenities {
              display:grid;
              grid-template-columns:repeat(2, minmax(0, 1fr));
              gap:16px;
            }

            .kmux-amenities > .kmux-reveal:first-child {
              grid-column:1 / -1;
            }

            .kmux-amenity-card {
              height:100%;
            }

            .kmux-gallery-frame {
              max-width:760px;
              margin:0 auto;
            }

            .kmux-gallery-image {
              height:420px;
            }

            .kmux-form {
              max-width:640px;
              margin:0 auto;
              padding:24px;
            }

            .kmux-footer {
              padding:34px 42px 42px;
            }

            .kmux-stickybar {
              bottom:18px;
              max-width:580px;
              width:auto;
              min-width:min(560px, calc(100vw - 40px));
              justify-content:center;
              align-items:center;
              border:1px solid var(--line);
              border-radius:28px;
              padding:10px;
              background:rgba(255,248,238,.94);
              box-shadow:0 18px 48px rgba(40,28,12,.18);
            }

            .kmux-stickybar .kmux-icon-btn {
              width:50px;
              height:50px;
              border-radius:18px;
            }

            .kmux-theme-v2 .kmux-stickybar .kmux-icon-btn {
              border-radius:999px;
            }

            .kmux-stickybar .kmux-visit {
              flex:0 0 250px;
              min-height:50px;
              padding:0 30px;
              font-size:15px;
            }

            .kmux-chat-float {
              right:calc((100vw - min(920px, calc(100vw - 40px))) / 2 + 16px);
              bottom:calc(env(safe-area-inset-bottom) + 118px);
              width:50px;
              height:50px;
            }
          }

          @media (min-width:860px) {
            .kmux-hero-content {
              display:grid;
              grid-template-columns:minmax(260px, .92fr) minmax(310px, 1.08fr);
              column-gap:24px;
              row-gap:14px;
              align-items:center;
              max-width:none;
              margin:0;
            }

            .kmux-reviews-badge,
            .kmux-eyebrow,
            .kmux-hero h1,
            .kmux-sub,
            .kmux-hero-actions {
              grid-column:1;
            }

            .kmux-hero h1 {
              max-width:410px;
              font-size:clamp(2.45rem, 5.2vw, 4rem);
            }

            .kmux-theme-v2 .kmux-hero h1 {
              font-size:clamp(2.35rem, 4.9vw, 3.65rem);
            }

            .kmux-sub {
              max-width:420px;
            }

            .kmux-hero-gallery {
              grid-column:2;
              grid-row:1 / span 5;
              height:340px;
              min-height:0;
              margin:0;
            }

            .kmux-hero-dots {
              grid-column:2;
              margin:0;
            }

            .kmux-hero-actions {
              max-width:420px;
            }
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
              {/* <span className="kmux-live-marker">
                <span className="kmux-live-dot" />
                Live from the site
              </span> */}
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
          {quickFacts.map((fact) => (
            <div className={`kmux-fact kmux-reveal ${fact.wide ? 'is-wide' : ''}`} key={fact.label}>
              <p className="kmux-label">{fact.label}</p>
              <p className="kmux-value">{fact.value}</p>
              {fact.detail && <p className="kmux-fact-detail">{fact.detail}</p>}
            </div>
          ))}
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

        <section id="kmux-gallery" className="kmux-section kmux-gallery">
          <div className="kmux-reveal">
            <h2 className="kmux-section-title">Picture the life that awaits</h2>
            <p className="kmux-section-note">
              Explore the clubhouse, landscaped gardens, arrival court and lotus pond planned for the community.
            </p>
          </div>
          <button
            type="button"
            className="kmux-gallery-frame kmux-reveal"
            aria-label={`Open ${activeGalleryImage.title} gallery image`}
            onClick={() => setLightboxImage(activeGalleryImage)}
          >
            <div className="kmux-gallery-image">
              <img
                key={activeGalleryImage.title}
                src={activeGalleryImage.image}
                alt={activeGalleryImage.alt}
                loading="lazy"
                decoding="async"
              />
              <span className="kmux-gallery-caption">
                <span>
                  <small>Project gallery</small>
                  <strong>{activeGalleryImage.title}</strong>
                </span>
                <span className="kmux-gallery-count">
                  {String(activeGalleryIndex + 1).padStart(2, '0')} / {galleryImages.length}
                </span>
              </span>
            </div>
          </button>
          <div className="kmux-gallery-controls" aria-label="Project gallery slides">
            {galleryImages.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={index === activeGalleryIndex ? 'is-active' : ''}
                aria-label={`Show ${item.title}`}
                onClick={() => setActiveGalleryIndex(index)}
              />
            ))}
          </div>
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
            <p className="kmux-whatsapp-note">
              We will send Kalpavruksha project details, price, location, and site visit updates on WhatsApp.
            </p>
            <button type="submit" className="kmux-cta-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send Me the Brochure on WhatsApp'}
            </button>
            <p className="kmux-form-status" aria-live="polite">{status}</p>
          </form>
        </section>

        <footer className="kmux-footer">
          <div className="kmux-fwordmark">Easy Homes</div>
          {EASY_HOMES_OFFICE_ADDRESS.map((line) => (
            <div key={line}>{line}</div>
          ))}
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

      <button
        type="button"
        className={`kmux-chat-float ${showFloatingChat ? 'is-visible' : ''}`}
        aria-label="Open live chat"
        title="Open live chat"
        onClick={() => launchLiveChat('mobile_floating_chat')}
      >
        <ChatIcon />
      </button>

      {lightboxImage && (
        <div className="kmux-lightbox" role="dialog" aria-modal="true" aria-label={lightboxImage.title}>
          <button type="button" aria-label="Close image preview" onClick={() => setLightboxImage(null)}>x</button>
          <div className="kmux-lightbox-caption">
            <small>{lightboxImage.category || 'Site image'}</small>
            <strong>{lightboxImage.title}</strong>
          </div>
          <img src={lightboxImage.image} alt={lightboxImage.alt} />
        </div>
      )}
      </div>
    </>
  );
}
