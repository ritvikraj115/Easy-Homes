import React, { Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Download,
  FileText,
  MapPin,
  MessageCircle,
  Phone,
  Building,
  Car,
  CheckCircle,
  TreePine,
  X,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Star
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { MAP_LIBRARIES, MAPS_LOADER_ID } from '../config/googleMaps';
import { FaWhatsapp } from 'react-icons/fa';
import YouTubeLiteEmbed from '../components/YouTubeLiteEmbed';
import ZohoSalesIQWidgetLoader, { openZohoSalesIQChat } from '../components/ZohoSalesIQWidgetLoader';
import {
  trackEvent,
  trackWhatsAppClick,
} from '../utils/analytics';
import { getGoogleAdsAttributionPayload, captureGoogleAdsAttribution } from '../utils/googleAdsAttribution';
import { buildKalpavrukshaWhatsAppUrl } from '../utils/kalpavrukshaWhatsapp';
import {
  KALPAVRUKSHA_CALM_HERO_IMAGE,
  KALPAVRUKSHA_CALM_HERO_SRC_SET,
  KALPAVRUKSHA_CARE_HERO_IMAGE,
  KALPAVRUKSHA_CARE_HERO_SRC_SET,
  KALPAVRUKSHA_OVERVIEW_HERO_IMAGE,
  KALPAVRUKSHA_OVERVIEW_HERO_PRELOAD,
  KALPAVRUKSHA_OVERVIEW_HERO_SRC_SET,
  KALPAVRUKSHA_PEACE_HERO_IMAGE,
  KALPAVRUKSHA_PEACE_HERO_SRC_SET,
  KALPAVRUKSHA_TRUST_HERO_IMAGE,
  KALPAVRUKSHA_TRUST_HERO_SRC_SET,
  KALPAVRUKSHA_WALKTHROUGH_BROCHURE_COVER,
} from '../assets/kalpavrukshaHeroAssets';
import KalpavrukshaMobileUx from './KalpavrukshaMobileUx';
import useKalpavrukshaSiteImages from '../hooks/useKalpavrukshaSiteImages';
import {
  DEFAULT_SLOT_AVAILABILITY,
  getVisitSlotNetworkFallback,
  resolveVisitSlotAvailability,
} from '../utils/kalpavrukshaSiteVisit';

function normalizeVisitSlot(rawSlot) {
  const text = String(rawSlot || '').trim();
  const match = /^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i.exec(text);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const suffix = hours < 12 ? 'AM' : 'PM';
  const hours12 = (hours % 12) || 12;
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const label = meridiem ? text : `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  return { value, label };
}

function normalizeVisitSlots(rawSlots) {
  const seen = new Set();
  return (Array.isArray(rawSlots) ? rawSlots : [])
    .map(normalizeVisitSlot)
    .filter(Boolean)
    .filter((slot) => {
      if (seen.has(slot.value)) return false;
      seen.add(slot.value);
      return true;
    });
}

const PICKUP_MAP_DEFAULT_CENTER = { lat: 16.553755, lng: 80.570832 };
const PICKUP_MAP_CONTAINER_STYLE = { width: '100%', height: '220px' };
const DOWNLOAD_ASSET_CONFIG = {
  layout: {
    url: '/Kalpavruksha Master Layout.pdf',
    fileName: 'Kalpavruksha Master Layout.pdf',
    title: 'Download Master Layout PDF',
    description: 'Share your details to access the Kalpavruksha master layout.',
    source: 'Website',
    leadStatus: 'Downloaded Layout'
  },
  brochure: {
    url: '/mainBrouche.pdf',
    fileName: 'Kalpavruksha Project Brochure.pdf',
    title: 'Location & Project Details',
    description: 'Share your details to receive Kalpavruksha location and project details.',
    source: 'Website',
    leadStatus: 'Brochure and Map Requested on WhatsApp'
  }
};
const KALPAVRUKSHA_CALL_URL = 'tel:+918988896666';
const KALPAVRUKSHA_DIRECTIONS_URL = 'https://maps.app.goo.gl/dNA1KdiDNuLjTthG8';
const KALPAVRUKSHA_GOOGLE_RATING = {
  rating: '5.0',
  reviewCount: '22',
  reviewUrl: 'https://share.google/OHvpBdiGZ7sqZGHYR',
  source: 'fallback',
};
const normalizeGoogleReviewSummary = (reviewData, fallback = KALPAVRUKSHA_GOOGLE_RATING) => {
  const ratingValue = Number(reviewData?.rating);
  const reviewCountValue = Number(reviewData?.reviewCount);

  return {
    rating: Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : fallback.rating,
    reviewCount: Number.isFinite(reviewCountValue)
      ? String(Math.max(0, Math.round(reviewCountValue)))
      : fallback.reviewCount,
    reviewUrl: reviewData?.reviewUrl || fallback.reviewUrl,
    source: reviewData?.source || fallback.source,
  };
};
const KALPAVRUKSHA_ZOHO_CHAT_QUESTION =
  'Hi Easy Homes, I want details about Kalpavruksha open plots, pricing, and site visit availability.';
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

const preloadReviewsSection = () => import('../components/ReviewProject');
const ReviewsSection = React.lazy(preloadReviewsSection);
const PickupLocationMap = React.lazy(() => import('../components/PickupLocationMap'));
const DEFERRED_SECTION_STYLE = {
  contentVisibility: 'auto',
  containIntrinsicSize: '1px 960px',
};
const HERO_IMAGE_SIZES = '100vw';
const HERO_SUPPORT_LINE = 'CRDA approved | 11 acres | Vemavaram';
const LANDING_VARIANT = 'A';
const LANDING_VERSION = 'v1';
const KALPAVRUKSHA_TRUTH = {
  priceFrom: 'Rs. 31 Lakhs',
  priceRange: 'Rs. 31 Lakhs onwards',
  plotSizes: '174-525',
  plotSizeUnit: 'Sq.yd.',
  projectArea: '11',
  projectAreaUnit: 'Acres',
  totalPlots: '105',
  bookedPlots: '17',
  reraId: 'P06160035909',
  possession: 'September 2026',
  maintenance: 'Developer maintenance till Dec 2030',
  configuration: 'Residential plots',
  communityType: 'Gated residential layout',
  location: 'Vemavaram, 5 km from West Bypass & Rayanapadu',
  locationShort: 'Vemavaram',
};
const VISIT_INTEREST_OPTIONS = [
  'Book Visit',
  'Current Price',
  'Available Plots',
];
const DEFAULT_SITE_VISIT_FORM = {
  name: '',
  phone: '',
  email: '',
  interest: VISIT_INTEREST_OPTIONS[0],
  preferredDate: '',
  preferredTime: '',
  transportRequired: 'No',
  pickupAddress: '',
  pickupMode: 'manual',
  pickupLat: '',
  pickupLng: ''
};
const DEFAULT_LAYOUT_LEAD_FORM = {
  name: '',
  phone: '',
  email: ''
};
const HASH_ACTION_DELAY_MS = 120;
const SITE_VISIT_FORM_HASHES = new Set(['#site-visit', '#visit-site', '#book-visit', '#site-visit-form']);
const DETAILS_FORM_HASHES = new Set([
  '#book',
  '#brochure',
  '#download-brochure',
  '#brochure-map',
  '#details',
  '#project-details',
  '#location-details',
  '#price-location',
]);
const LAYOUT_DOWNLOAD_FORM_HASHES = new Set(['#download-layout', '#layout-download', '#layout-form', '#master-layout-form']);

const SITE_VISIT_ZOHO_NOTE = 'Site visit scheduled from website.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const isValidEmail = (value) => EMAIL_PATTERN.test(String(value || '').trim());
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const getLandingTrackingContext = () => {
  if (typeof window === 'undefined') {
    return {
      landing_variant: LANDING_VARIANT,
      landing_version: LANDING_VERSION,
      version: LANDING_VERSION,
      traffic_source: undefined,
      campaign: undefined,
    };
  }

  const params = new URLSearchParams(window.location.search || '');
  return {
    landing_variant: LANDING_VARIANT,
    landing_version: LANDING_VERSION,
    version: LANDING_VERSION,
    traffic_source: params.get('utm_source') || undefined,
    campaign: params.get('utm_campaign') || undefined,
  };
};

const withLandingVariant = (payload = {}) => ({
  ...getLandingTrackingContext(),
  ...payload,
});

const KALPAVRUKSHA_GALLERY_IMAGES = [
  { title: "Modern Clubhouse", image: require("../assets/kalpavruksha/club house.webp"), alt: "Kalpavruksha clubhouse exterior with landscaped lawns and premium lifestyle amenities", maskEmbeddedLabel: true },
  { title: "Contour Garden", image: require("../assets/kalpavruksha/contour garden.webp"), alt: "Kalpavruksha contour garden with landscaped pathways and open recreational greens", maskEmbeddedLabel: true },
  { title: "Lotus Pond Retreat", image: require("../assets/kalpavruksha/lotus pond 2.webp"), alt: "Kalpavruksha lotus pond water feature with curved walkways and reflective landscaping", maskEmbeddedLabel: true }
];
const DEFAULT_KALPAVRUKSHA_SITE_PHOTOS = [
  {
    id: 'main-gate',
    label: 'Main gate',
    title: 'Main gate',
    detail: 'Latest site photo showing the tree-themed main gate and internal road alignment.',
    image: require('../assets/kalpavruksha/live-main-gate-1200.webp'),
    alt: 'Kalpavruksha live site main gate with internal road view',
  },
  {
    id: 'compound-wall',
    label: 'Compound wall',
    title: 'Compound wall',
    detail: 'Latest site photo showing the compound wall, boundary finish and service-side progress.',
    image: require('../assets/kalpavruksha/live-compound-wall-1200.webp'),
    alt: 'Kalpavruksha live site compound wall and boundary progress',
  },
  {
    id: 'clubhouse-lawn',
    label: 'Site Office',
    title: 'Site Office',
    detail: 'Latest site photo showing the support area for project guidance, booking assistance, and site-visit coordination.',
    image: require('../assets/kalpavruksha/live-clubhouse-lawn-1200.webp'),
    alt: 'Kalpavruksha live site office and walking path',
  },
  {
    id: 'seating-pavilion',
    label: 'Seating pavilion',
    title: 'Seating pavilion',
    detail: 'Latest site photo showing the outdoor seating pavilion and open-space development.',
    image: require('../assets/kalpavruksha/live-seating-pavilion-1200.webp'),
    alt: 'Kalpavruksha live site outdoor seating pavilion',
  },
];
const CROPPED_GALLERY_IMAGE_STYLE = { height: '124%', objectPosition: 'center top' };
const getGalleryImageStyle = (item) => (item?.maskEmbeddedLabel ? CROPPED_GALLERY_IMAGE_STYLE : undefined);

const AnimatedNumber = ({ value, suffix = '', decimals, className = '', style }) => {
  const numericValue = Number(value);
  const canAnimate = Number.isFinite(numericValue);
  const initialValue = typeof window === 'undefined' || !canAnimate || !('IntersectionObserver' in window)
    ? numericValue
    : 0;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const numberRef = React.useRef(null);

  useEffect(() => {
    if (!canAnimate) {
      return undefined;
    }

    if (
      typeof window === 'undefined'
      || !numberRef.current
      || !('IntersectionObserver' in window)
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplayValue(numericValue);
      return undefined;
    }

    let frameId = null;
    let startTime = null;
    const duration = 1200;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;

      observer.disconnect();
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = clamp((timestamp - startTime) / duration, 0, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setDisplayValue(numericValue * easedProgress);

        if (progress < 1) {
          frameId = window.requestAnimationFrame(animate);
        } else {
          setDisplayValue(numericValue);
        }
      };

      frameId = window.requestAnimationFrame(animate);
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.3,
    });

    observer.observe(numberRef.current);

    return () => {
      observer.disconnect();
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [canAnimate, numericValue]);

  if (!canAnimate) {
    return <span className={className} style={style}>{value}{suffix}</span>;
  }

  const resolvedDecimals = decimals ?? (String(value).includes('.') ? 2 : 0);
  const formattedValue = displayValue.toLocaleString('en-IN', {
    minimumFractionDigits: resolvedDecimals,
    maximumFractionDigits: resolvedDecimals,
  });

  return (
    <span ref={numberRef} className={className} style={style}>
      {formattedValue}{suffix}
    </span>
  );
};

const KalpavrukshaPage = () => {
  // ...existing code...
  const navigate = useNavigate();
  const location = useLocation();
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [downloadAssetKey, setDownloadAssetKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloadSubmitting, setDownloadSubmitting] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [isProjectNavOpen, setIsProjectNavOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [form, setForm] = useState(DEFAULT_SITE_VISIT_FORM);
  const [visitFormStep, setVisitFormStep] = useState(1);
  const [layoutLeadForm, setLayoutLeadForm] = useState(DEFAULT_LAYOUT_LEAD_FORM);
  const [availableVisitSlots, setAvailableVisitSlots] = useState([]);
  const [visitSlotsLoading, setVisitSlotsLoading] = useState(false);
  const [visitSlotsError, setVisitSlotsError] = useState('');
  const [visitSlotAvailability, setVisitSlotAvailability] = useState(DEFAULT_SLOT_AVAILABILITY);
  const activeDownloadAsset = downloadAssetKey ? DOWNLOAD_ASSET_CONFIG[downloadAssetKey] : null;
  const isModalOpen = showVisitModal || Boolean(activeDownloadAsset);
  const shouldShowFloatingActions = showFloatingActions && !isModalOpen;
  const [toast, setToast] = useState(null);
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [useMobileClientUx, setUseMobileClientUx] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches
  );
  const [shouldRenderReviews, setShouldRenderReviews] = useState(false);
  const [googleReviewSummary, setGoogleReviewSummary] = useState(KALPAVRUKSHA_GOOGLE_RATING);
  const todayDate = new Date().toISOString().split('T')[0];
  const [pickupMapCenter, setPickupMapCenter] = useState(PICKUP_MAP_DEFAULT_CENTER);
  const [pickupMapLoadError, setPickupMapLoadError] = useState(false);
  const [projectNavScrollState, setProjectNavScrollState] = useState({
    heroBlend: 0,
    pageProgress: 0
  });
  const pickupMapApiKey = process.env.REACT_APP_MAP_KEY || '';
  const pickupGeocodeRequestRef = React.useRef(0);
  const lastHandledHashRef = React.useRef('');

  // Footer quick link refs and scroll handlers (like Home page)
  const aboutRef = React.useRef(null);
  const locationRef = React.useRef(null);
  const amenitiesRef = React.useRef(null);
  const galleryRef = React.useRef(null);
  const masterPlanRef = React.useRef(null);
  const heroSectionRef = React.useRef(null);
  const footerRef = React.useRef(null);
  const reviewsRef = React.useRef(null);
  const brochureMapRef = React.useRef(null);
  const brochureMapNameInputRef = React.useRef(null);
  const sitePhotoPlaceholders = useKalpavrukshaSiteImages(DEFAULT_KALPAVRUKSHA_SITE_PHOTOS);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToLocation = () => {
    locationRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToMasterPlan = () => {
    masterPlanRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToAmenities = () => {
    amenitiesRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const scrollToBrochureMapFields = React.useCallback(() => {
    const target = brochureMapNameInputRef.current || brochureMapRef.current;
    if (!target) return;

    if (typeof window === 'undefined' || typeof target.getBoundingClientRect !== 'function') {
      target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      return;
    }

    const headerOffset = window.innerWidth >= 1024 ? 104 : 84;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }, []);
  const scrollToBrochureMapForm = React.useCallback((source = 'brochure_map_cta') => {
    trackEvent('form_open', withLandingVariant({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
      project: 'Kalpavruksha',
      source,
      asset_type: 'brochure',
    }));
    setShowVisitModal(false);
    setDownloadAssetKey(null);
    scrollToBrochureMapFields();
  }, [scrollToBrochureMapFields]);
  const trackGoogleReviewsClick = (placement = 'hero_review_pill') => {
    trackEvent('google_reviews_click', withLandingVariant({
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      rating_source: googleReviewSummary.source,
      review_url: googleReviewSummary.reviewUrl,
    }));
  };
  // Expose scroll handlers globally for Navbar (after function declarations)
  if (typeof window !== 'undefined') {
    window.scrollToAmenities = scrollToAmenities;
    window.scrollToContact = scrollToContact;
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const syncMobileUx = (event = mediaQuery) => {
      setUseMobileClientUx(Boolean(event.matches));
    };

    syncMobileUx();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMobileUx);
    } else {
      mediaQuery.addListener(syncMobileUx);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncMobileUx);
      } else {
        mediaQuery.removeListener(syncMobileUx);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const loadReviewsEarly = () => {
      preloadReviewsSection();
      setShouldRenderReviews(true);
    };

    const reviewsNode = reviewsRef.current;
    if (!reviewsNode || !('IntersectionObserver' in window)) {
      loadReviewsEarly();
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      loadReviewsEarly();
      observer.disconnect();
    }, {
      rootMargin: '900px 0px 900px 0px',
      threshold: 0,
    });

    observer.observe(reviewsNode);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isActive = true;

    api.get('/api/google-reviews/kalpavruksha')
      .then((response) => {
        const reviewData = response.data?.data;
        if (!isActive || !response.data?.success || !reviewData) return;
        setGoogleReviewSummary(normalizeGoogleReviewSummary(reviewData));
      })
      .catch(() => {
        // Keep the verified Google link visible even when live Places data is not configured yet.
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const revealTargets = Array.from(document.querySelectorAll(
      '.kalpa-v1-reveal, .kalpa-v1-reveal-scale, .kalpa-v1-reveal-left, .kalpa-v1-number-pop'
    ));

    if (!revealTargets.length) {
      return undefined;
    }

    if (!('IntersectionObserver' in window) || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      revealTargets.forEach((element) => element.classList.add('kalpa-v1-in-view'));
      return undefined;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('kalpa-v1-in-view');
        revealObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12,
    });

    revealTargets.forEach((element) => revealObserver.observe(element));

    return () => revealObserver.disconnect();
  }, []);

  const projectNavItems = [
    { label: 'Lifestyle', onClick: scrollToAbout },
    { label: 'Master Plan', onClick: scrollToMasterPlan },
    { label: 'Location', onClick: scrollToLocation },
    { label: 'Amenities', onClick: scrollToAmenities },
    { label: 'Gallery', onClick: scrollToGallery },
    { label: 'Contact', onClick: scrollToContact },
  ];

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let frameId = null;

    const updateFloatingActions = () => {
      frameId = null;
      const heroTop = heroSectionRef.current?.getBoundingClientRect().top ?? 0;
      setShowFloatingActions(heroTop < -8);
    };

    const requestUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateFloatingActions);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let frameId = null;

    const updateProjectNavScrollState = () => {
      frameId = null;

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const heroHeight = heroSectionRef.current?.offsetHeight || window.innerHeight || 1;
      const heroBlend = clamp(scrollY / Math.max(heroHeight * 0.68, 1));
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pageProgress = scrollableHeight > 0 ? clamp(scrollY / scrollableHeight) : 0;

      setProjectNavScrollState((current) => {
        if (
          Math.abs(current.heroBlend - heroBlend) < 0.01 &&
          Math.abs(current.pageProgress - pageProgress) < 0.005
        ) {
          return current;
        }

        return { heroBlend, pageProgress };
      });
    };

    const requestUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateProjectNavScrollState);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  useEffect(() => {
    if (!showVisitModal || form.pickupMode !== 'map') {
      setPickupMapLoadError(false);
    }
  }, [form.pickupMode, showVisitModal]);

  useEffect(() => {
    if (!showVisitModal || !form.preferredDate) {
      setAvailableVisitSlots([]);
      setVisitSlotsError('');
      setVisitSlotsLoading(false);
      setVisitSlotAvailability(DEFAULT_SLOT_AVAILABILITY);
      return undefined;
    }

    let isActive = true;
    setVisitSlotsLoading(true);
    setVisitSlotsError('');
    setAvailableVisitSlots([]);
    setVisitSlotAvailability(DEFAULT_SLOT_AVAILABILITY);
    setForm((current) => (
      current.preferredTime ? { ...current, preferredTime: '' } : current
    ));

    api.get('/api/site-visits/available-slots', {
      params: { preferredDate: form.preferredDate },
    }).then((response) => {
      if (!isActive) return;
      const result = resolveVisitSlotAvailability(response.data, normalizeVisitSlots);
      setAvailableVisitSlots(result.slots);
      setVisitSlotAvailability(result.availability);
    }).catch((error) => {
      if (!isActive) return;
      console.error('Available slot fetch failed:', error);
      const result = getVisitSlotNetworkFallback(error, normalizeVisitSlots);
      setAvailableVisitSlots(result.slots);
      setVisitSlotAvailability(result.availability);
      setVisitSlotsError('');
    }).finally(() => {
      if (isActive) {
        setVisitSlotsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [form.preferredDate, showVisitModal]);

  useEffect(() => {
    if (isModalOpen) {
      setIsProjectNavOpen(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    // Silently scans the URL on load and updates localStorage if gclid/utm data exists
    captureGoogleAdsAttribution();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);
  /* ---------------- SEO STRUCTURED DATA ---------------- */

  const projectTitle =
    'Kalpavruksha Open Plots in Vijayawada | CRDA Approved Plots Near Amaravati | Easy Homes';
  const projectDescription =
    'Explore Kalpavruksha by Easy Homes, a CRDA-approved residential plotted community with 105 open plots across 11 acres in Vemavaram, 5 km from West Bypass and Rayanapadu, with plot sizes from 174 to 525 square yards, premium infrastructure, and clubhouse amenities.';
  const projectKeywords =
    'Kalpavruksha, Kalpavruksha plots, CRDA approved plots Vijayawada, open plots near Amaravati, Easy Homes projects, residential plots Andhra Pradesh';
  const projectCanonicalUrl = 'https://easyhomess.com/kalpavruksha/';
  const projectImageUrl = 'https://easyhomess.com/kalpPcImg.webp';
  const projectShareTitle = 'Kalpavruksha Open Plots in Vijayawada | Easy Homes';
  const projectShareDescription =
    'CRDA-approved plotted development in Vemavaram with 105 residential plots across 11 acres, plot sizes from 174 to 525 square yards, premium amenities, and strong connectivity to West Bypass and Rayanapadu.';
  const projectLocationTitle = 'Kalpavruksha, Vemavaram, 5 km from West Bypass and Rayanapadu';
  const projectLocationAddress = 'Kalpavruksha, Vemavaram, 5 km from West Bypass and Rayanapadu, Vijayawada, Andhra Pradesh';
  const projectDirectionsUrl = KALPAVRUKSHA_DIRECTIONS_URL;
  const shouldRenderStructuredData =
    typeof document === 'undefined' ||
    !document.head?.querySelector(
      'meta[name="easyhomes:prerendered-route"][content="kalpavruksha"]',
    );

  useEffect(() => {
    if (location.pathname.endsWith('/')) {
      return;
    }

    navigate(
      {
        pathname: `${location.pathname}/`,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: location.state },
    );
  }, [location.hash, location.pathname, location.search, location.state, navigate]);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${projectCanonicalUrl}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://easyhomess.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Kalpavruksha",
        "item": projectCanonicalUrl
      }
    ]
  };

  const realEstateAgentData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${projectCanonicalUrl}#agent`,
    "name": "Easy Homes",
    "image": "https://easyhomess.com/logo.png",
    "telephone": "+918988896666",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "4th Floor, adjacent to GIG International School, Gollapudi",
      "addressLocality": "Vijayawada",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "521225",
      "addressCountry": "IN"
    },
    "url": "https://easyhomess.com/",
    "areaServed": ["Vijayawada", "Amaravati"]
  };

  const webPageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${projectCanonicalUrl}#webpage`,
    "url": projectCanonicalUrl,
    "name": projectTitle,
    "description": projectDescription,
    "inLanguage": "en-IN",
    "breadcrumb": { "@id": `${projectCanonicalUrl}#breadcrumb` },
    "mainEntity": { "@id": `${projectCanonicalUrl}#listing` },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": projectImageUrl
    },
    "isPartOf": {
      "@type": "WebSite",
      "@id": "https://easyhomess.com/#website",
      "url": "https://easyhomess.com/",
      "name": "Easy Homes"
    }
  };

  const faqItems = [
    {
      question: 'Is Kalpavruksha a CRDA-approved project?',
      answer:
        'Yes. Kalpavruksha is presented as a CRDA-approved plotted development by Easy Homes. Buyers should still review the latest approvals, layout documents, and registration details during the booking process.',
    },
    {
      question: 'What is the total size of the project?',
      answer:
        'The project spans 11 acres and is planned as a gated residential plotted community.',
    },
    {
      question: 'How many plots are available in Kalpavruksha?',
      answer:
        'Kalpavruksha has 105 residential plot units in the current project overview.',
    },
    {
      question: 'What plot sizes are available?',
      answer:
        'The current plot size range is 174 to 525 square yards, covering both compact and larger residential plot requirements.',
    },
    {
      question: 'What is the configuration in Kalpavruksha?',
      answer:
        'Kalpavruksha is planned as a residential plots project, suitable for buyers looking at open plot investment or future home construction.',
    },
    {
      question: 'What is the average price in Kalpavruksha?',
      answer:
        'The current starting price is Rs. 31 lakhs onwards. Final pricing can vary by plot size, facing, and location within the layout.',
    },
    {
      question: 'When does possession start?',
      answer:
        'The project possession will start from September 2026.',
    },
    {
      question: 'What is the RERA ID of Kalpavruksha?',
      answer:
        'The RERA ID shown for Kalpavruksha is P06160035909. Buyers should verify the latest status from the official RERA portal before booking.',
    },
    {
      question: 'Is Kalpavruksha a gated community?',
      answer:
        'Yes. The project is positioned as a gated residential layout with internal roads, utility planning, security features, and community amenities.',
    },
    {
      question: 'Where is Kalpavruksha located?',
      answer:
        'The project is in Vemavaram, around 5 km from West Bypass and Rayanapadu, with connectivity to Vijayawada, Hyderabad Highway (NH 65), and Amaravati-side destinations.',
    },
    {
      question: 'How can I get the brochure or schedule a visit?',
      answer:
        'You can download the brochure directly from this page or submit a site visit request to connect with the Easy Homes team for the next steps.',
    },
  ];

  const faqDisplayItems = faqItems;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };


  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${projectCanonicalUrl}#listing`,
    "name": "Kalpavruksha Open Plots",
    "description": projectDescription,
    "url": projectCanonicalUrl,
    "mainEntityOfPage": { "@id": `${projectCanonicalUrl}#webpage` },
    "image": [projectImageUrl],
    "identifier": "P06160035909",
    "category": "Residential Plots",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vijayawada",
      "addressRegion": "Andhra Pradesh",
      "addressCountry": "IN"
    },
    "provider": { "@id": `${projectCanonicalUrl}#agent` }
  };

  const buyerGuideSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${projectCanonicalUrl}#buyer-guide`,
    "headline": "Kalpavruksha Open Plots In Vijayawada: Location, Layout, And Buyer Essentials",
    "description": "Buyer-focused guidance for evaluating Kalpavruksha open plots near Vijayawada and Amaravati, including approvals, layout checks, infrastructure readiness, and connectivity context.",
    "inLanguage": "en-IN",
    "isPartOf": { "@id": `${projectCanonicalUrl}#webpage` },
    "mainEntityOfPage": projectCanonicalUrl,
    "author": { "@id": `${projectCanonicalUrl}#agent` },
    "publisher": { "@id": `${projectCanonicalUrl}#agent` },
    "about": [
      "CRDA-approved plotted development",
      "Open plots near Vijayawada",
      "Open plots near Amaravati",
      "Residential plot due diligence"
    ],
    "articleSection": [
      "Project Overview",
      "Location and Connectivity",
      "Layout and Infrastructure",
      "Buyer Verification Checklist"
    ],
    "articleBody": "Kalpavruksha is presented as a CRDA-approved plotted development by Easy Homes in Vemavaram, planned across approximately 11 acres with 105 residential plots. Buyers looking for open plots near Amaravati often evaluate three factors first: approval clarity, location practicality, and ground-level infrastructure readiness. The project is structured around those priorities with a planned layout, internal circulation, and community-focused zoning. Plot dimensions in Kalpavruksha are positioned for multiple buyer goals, from long-term land holding to future home construction. Along with plot planning, the project narrative highlights amenities such as landscaped zones, clubhouse-oriented lifestyle components, utility-ready roads, and access-led design. From a connectivity standpoint, Kalpavruksha is positioned about 5 km from West Bypass and Rayanapadu, with practical travel links toward Vijayawada city, railway access points, airport routes, and Amaravati-side expansion areas. Buyers usually verify CRDA and statutory approval status, plot dimensions and road-width access, infrastructure progress, travel-time feasibility, and final documentation and registration process before booking."
  };

  const kalpavrukshaDifferenceItems = [
    {
      title: 'Sunrise framed by the hills',
      detail: 'A distinctive natural elevation setting that protects the peaceful, scenic character of the community.',
    },
    {
      title: 'Creek-side walking track',
      detail: 'An engineered rivulet garden inside the layout boundary - daily lifestyle value, not just landscaping.',
    },
    {
      title: 'Rooftop clubhouse',
      detail: 'Infinity pool, private theatre, AC gym, BBQ zone, banquet hall and indoor sports.',
    },
    {
      title: "40 & 30 ft CC roads",
      detail: 'Grand avenue entries with underground concrete drainage, ICT ducting and avenue tree plantation.',
    },
  ];

  const projectSnapshotStats = [
    {
      label: "Price From",
      value: KALPAVRUKSHA_TRUTH.priceFrom,
      unit: "",
      detail: `Starting price: ${KALPAVRUKSHA_TRUTH.priceRange}.`
    },
    {
      label: "Project Area",
      value: KALPAVRUKSHA_TRUTH.projectArea,
      unit: KALPAVRUKSHA_TRUTH.projectAreaUnit,
      detail: "Overall layout spread across the project site."
    },
    {
      label: "Sizes",
      value: KALPAVRUKSHA_TRUTH.plotSizes,
      unit: KALPAVRUKSHA_TRUTH.plotSizeUnit,
      detail: "Available plot-size range."
    },
    {
      label: "Location",
      value: KALPAVRUKSHA_TRUTH.locationShort,
      unit: "",
      detail: KALPAVRUKSHA_TRUTH.location
    },
    {
      label: "Price Range",
      value: KALPAVRUKSHA_TRUTH.priceRange,
      unit: "",
      detail: "Current starting price shared in the project update."
    }
  ];
  const visibleProjectSnapshotStats = projectSnapshotStats.filter((item) => item.value || item.detail);
  const primaryProjectSnapshotStat = visibleProjectSnapshotStats.find((item) => item.label === 'Price From');
  const supportingProjectSnapshotStats = visibleProjectSnapshotStats.filter((item) => item.label !== 'Price From');

  const locationHighlights = [
    {
      icon: <MapPin className="h-4 w-4" />,
      title: "Vemavaram location"
    },
    {
      icon: <Car className="h-4 w-4" />,
      title: "5 km from West Bypass & Rayanapadu"
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      title: "7.5 km from Vijayawada"
    },
    {
      icon: <Car className="h-4 w-4" />,
      title: "9 km from Hyderabad Highway (NH 65), Milk factory, Gollapudi"
    },
    {
      icon: <Building className="h-4 w-4" />,
      title: "13.5 km from Amaravati Start-up Village & BITS Amaravati"
    },
    {
      icon: <Building className="h-4 w-4" />,
      title: "14 km from Vijayawada Railway Station"
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      title: "15 km from Vijayawada Bus Stand"
    }
  ];

  const CTAButton = ({
    icon,
    text,
    primary = false,
    onClick,
    href,
    target,
    className = '',
  }) => {
    const classes = `
    kalpa-v1-cta-sheen inline-flex min-h-[3.35rem] items-center justify-center gap-2.5 rounded-full border px-6 py-3.5 text-sm font-semibold tracking-[0.01em]
    shadow-[0_16px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
    focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#cba159]/18
    ${primary
        ? 'border-[#d3ab67] bg-gradient-to-r from-[#cba159] to-[#d7b16f] text-[#1d1609] hover:from-[#d2a764] hover:to-[#deb979] hover:shadow-[0_20px_40px_rgba(203,161,89,0.24)]'
        : 'border-[#e0cfaf] bg-white/[0.96] text-[#221c14] hover:border-[#cba159] hover:bg-[#fffaf1] hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]'
      }
    ${className}
  `;

    // If link exists, render <a>
    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          onClick={onClick}
          className={classes}
        >
          {icon}
          <span>{text}</span>
        </a>
      );
    }

    // Default: button
    return (
      <button onClick={onClick} className={classes}>
        {icon}
        <span>{text}</span>
      </button>
    );
  };

  const heroSlides = [
    {
      id: 'overview',
      navLabel: 'Overview',
      eyebrow: 'CRDA & RERA APPROVED - AMARAVATI GROWTH CORRIDOR',
      title: 'Residential Plots near Vijayawada, close to Amaravati',
      description:
        "A real housing neighbourhood with clubhouse, 3 parks, CC roads, underground utilities and secure 11' compound wall.",
      image: KALPAVRUKSHA_OVERVIEW_HERO_IMAGE,
      imageSrcSet: KALPAVRUKSHA_OVERVIEW_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Kalpavruksha plotted community overview',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'CRDA Approved',
        '12 mins from Amaravati',
        '105 Open Plots',
      ],
      summaryLabel: 'Project snapshot',
      summaryTitle: 'Verified overview',
      summaryText:
        'CRDA-approved plotted community in Vemavaram with 105 residential plots, clubhouse amenities, and planned internal infrastructure.',
    },
    {
      id: 'security',
      navLabel: 'Trust',
      eyebrow: 'Trust',
      title: 'Trust begins with clarity',
      description:
        'CRDA approval, gated entry, CCTV, and developer maintenance till Dec 2030 make the project easier to choose with confidence.',
      image: KALPAVRUKSHA_TRUST_HERO_IMAGE,
      imageSrcSet: KALPAVRUKSHA_TRUST_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Interlocking wooden beams representing trust, stability, and structure',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'CRDA approved',
        '24x7 gated entry',
        'Maintenance till Dec 2030',
      ],
      summaryLabel: 'Why it feels reliable',
      summaryTitle: 'Trust built on clarity',
      summaryText:
        'Dependability comes from visible approvals, site security, and a maintenance commitment that continues after purchase.',
    },
    {
      id: 'clubhouse',
      navLabel: 'Calm',
      eyebrow: 'Calm',
      title: 'Calm starts with space',
      description:
        '40 and 30 ft CC roads, walkways, avenue planting, and underground utilities help the layout feel open and ordered.',
      image: KALPAVRUKSHA_CALM_HERO_IMAGE,
      imageSrcSet: KALPAVRUKSHA_CALM_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Soft misty hills and layered gradients expressing calm and ease',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        "40' / 30' CC roads",
        'Underground utilities',
        'Walkways and avenue trees',
      ],
      summaryLabel: 'Calm by design',
      summaryTitle: 'Space feels intentional',
      summaryText:
        'Road widths, walkways, planting, and concealed services help the layout feel more open and organized.',
    },
    {
      id: 'landscape',
      navLabel: 'Peace',
      eyebrow: 'Peace',
      title: 'Peace comes from green edges',
      description:
        'Rivulet gardens, lotus pond zones, and green pockets make the site feel softer and less crowded.',
      image: KALPAVRUKSHA_PEACE_HERO_IMAGE,
      imageSrcSet: KALPAVRUKSHA_PEACE_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Concentric sand circles and stones representing peace and stillness',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'Rivulet garden',
        'Lotus pond zones',
        'Drip irrigation',
      ],
      summaryLabel: 'Peace in the layout',
      summaryTitle: 'Landscape changes the mood',
      summaryText:
        'Landscape and water planning are used to make the site feel greener, softer, and less congested.',
    },
    {
      id: 'water',
      navLabel: 'Care',
      eyebrow: 'Care',
      title: 'Care shows in what lasts',
      description:
        'Power, water, fiber, drainage, and solar lighting are planned for dependable long-term use.',
      image: KALPAVRUKSHA_CARE_HERO_IMAGE,
      imageSrcSet: KALPAVRUKSHA_CARE_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Soft luminous flowing forms representing care, continuity, and attention',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'Power, water, and fiber',
        'Stormwater drains',
        'Solar lighting',
      ],
      summaryLabel: 'Care in the details',
      summaryTitle: 'The groundwork matters',
      summaryText:
        'Infrastructure planning helps the project feel more durable, cleaner, and better prepared for long-term use.',
    },
  ];
  const activeHeroSlide = heroSlides[activeHeroSlideIndex] || heroSlides[0];
  const heroTouchStartXRef = React.useRef(null);
  const heroSlideTransitionTimeoutRef = React.useRef(null);
  const [isHeroSlideVisible, setIsHeroSlideVisible] = useState(true);
  const changeHeroSlide = (nextIndex) => {
    const normalizedIndex = ((nextIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;

    if (typeof window === 'undefined') {
      setActiveHeroSlideIndex(normalizedIndex);
      setIsHeroSlideVisible(true);
      return;
    }

    if (heroSlideTransitionTimeoutRef.current) {
      window.clearTimeout(heroSlideTransitionTimeoutRef.current);
    }

    setIsHeroSlideVisible(false);
    heroSlideTransitionTimeoutRef.current = window.setTimeout(() => {
      setActiveHeroSlideIndex(normalizedIndex);
      setIsHeroSlideVisible(true);
      heroSlideTransitionTimeoutRef.current = null;
    }, 180);
  };
  const goToNextHeroSlide = () => {
    changeHeroSlide(activeHeroSlideIndex + 1);
  };
  const goToPreviousHeroSlide = () => {
    changeHeroSlide(activeHeroSlideIndex - 1);
  };
  const handleHeroTouchStart = (event) => {
    heroTouchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };
  const handleHeroTouchEnd = (event) => {
    if (heroTouchStartXRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? heroTouchStartXRef.current;
    const deltaX = touchEndX - heroTouchStartXRef.current;
    heroTouchStartXRef.current = null;

    if (Math.abs(deltaX) < 48) {
      return;
    }

    if (deltaX < 0) {
      goToNextHeroSlide();
      return;
    }

    goToPreviousHeroSlide();
  };
  useEffect(() => {
    if (typeof window === 'undefined' || heroSlides.length <= 1 || !window.matchMedia) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIsHeroSlideVisible(false);

      if (heroSlideTransitionTimeoutRef.current) {
        window.clearTimeout(heroSlideTransitionTimeoutRef.current);
      }

      heroSlideTransitionTimeoutRef.current = window.setTimeout(() => {
        setActiveHeroSlideIndex((current) => (current + 1) % heroSlides.length);
        setIsHeroSlideVisible(true);
        heroSlideTransitionTimeoutRef.current = null;
      }, 180);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);
  useEffect(() => () => {
    if (typeof window !== 'undefined' && heroSlideTransitionTimeoutRef.current) {
      window.clearTimeout(heroSlideTransitionTimeoutRef.current);
    }
  }, []);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mobileGalleryIndex, setMobileGalleryIndex] = useState(0);
  const [sitePhotoIndex, setSitePhotoIndex] = useState(0);
  const activeMobileGalleryImage = KALPAVRUKSHA_GALLERY_IMAGES[mobileGalleryIndex] || KALPAVRUKSHA_GALLERY_IMAGES[0];
  const activeSitePhoto = sitePhotoPlaceholders[sitePhotoIndex] || sitePhotoPlaceholders[0];
  const openModal = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const getSelectedImageIndex = () => (
    KALPAVRUKSHA_GALLERY_IMAGES.findIndex((item) => item.image === selectedImage?.image)
  );

  const showPreviousGalleryImage = () => {
    setSelectedImage((current) => {
      const currentIndex = KALPAVRUKSHA_GALLERY_IMAGES.findIndex((item) => item.image === current?.image);
      const nextIndex = currentIndex <= 0 ? KALPAVRUKSHA_GALLERY_IMAGES.length - 1 : currentIndex - 1;
      return KALPAVRUKSHA_GALLERY_IMAGES[nextIndex] || current;
    });
  };

  const showNextGalleryImage = () => {
    setSelectedImage((current) => {
      const currentIndex = KALPAVRUKSHA_GALLERY_IMAGES.findIndex((item) => item.image === current?.image);
      const nextIndex = currentIndex < 0 || currentIndex >= KALPAVRUKSHA_GALLERY_IMAGES.length - 1 ? 0 : currentIndex + 1;
      return KALPAVRUKSHA_GALLERY_IMAGES[nextIndex] || current;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (selectedImage || isModalOpen) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const isGalleryVisible = () => {
      const section = galleryRef.current;
      if (!section) return false;
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.78 && rect.bottom > window.innerHeight * 0.22;
    };

    const intervalId = window.setInterval(() => {
      if (reducedMotionQuery.matches || !isGalleryVisible()) {
        return;
      }

      setMobileGalleryIndex((current) => (
        current >= KALPAVRUKSHA_GALLERY_IMAGES.length - 1 ? 0 : current + 1
      ));
    }, 3800);

    return () => window.clearInterval(intervalId);
  }, [isModalOpen, selectedImage]);

  useEffect(() => {
    if (typeof window === 'undefined' || selectedImage || isModalOpen) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const intervalId = window.setInterval(() => {
      if (reducedMotionQuery.matches) return;
      setSitePhotoIndex((current) => (
        current >= sitePhotoPlaceholders.length - 1 ? 0 : current + 1
      ));
    }, 3600);

    return () => window.clearInterval(intervalId);
  }, [isModalOpen, selectedImage, sitePhotoPlaceholders.length]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const openVisitModal = (source = 'kalpavruksha_site_visit_modal') => {
    trackEvent('form_open', withLandingVariant({
      form_name: 'kalpavruksha_site_visit_form',
      lead_type: 'site_visit',
      project: 'Kalpavruksha',
      source,
    }));
    setVisitFormStep(1);
    setShowVisitModal(true);
  };

  useEffect(() => {
    if (!selectedImage || typeof window === 'undefined') {
      return undefined;
    }

    const moveGalleryImage = (direction) => {
      setSelectedImage((current) => {
        const currentIndex = KALPAVRUKSHA_GALLERY_IMAGES.findIndex((item) => item.image === current?.image);
        if (currentIndex < 0) return current;

        const nextIndex = direction === 'previous'
          ? (currentIndex <= 0 ? KALPAVRUKSHA_GALLERY_IMAGES.length - 1 : currentIndex - 1)
          : (currentIndex >= KALPAVRUKSHA_GALLERY_IMAGES.length - 1 ? 0 : currentIndex + 1);

        return KALPAVRUKSHA_GALLERY_IMAGES[nextIndex] || current;
      });
    };

    const handleGalleryKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        moveGalleryImage('previous');
      }
      if (event.key === 'ArrowRight') {
        moveGalleryImage('next');
      }
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleGalleryKeyDown);
    return () => window.removeEventListener('keydown', handleGalleryKeyDown);
  }, [selectedImage]);
  const closeVisitModal = () => {
    setShowVisitModal(false);
    setVisitFormStep(1);
  };
  const openDownloadLeadModal = React.useCallback((assetKey, source = 'kalpavruksha_download_modal') => {
    const assetType = assetKey === 'layout' ? 'master_layout' : 'brochure';
    trackEvent('form_open', withLandingVariant({
      form_name: 'kalpavruksha_download_form',
      lead_type: `${assetType}_download`,
      project: 'Kalpavruksha',
      source,
      asset_type: assetType,
    }));
    setLayoutLeadForm(DEFAULT_LAYOUT_LEAD_FORM);
    setDownloadAssetKey(assetKey);
  }, []);
  const closeDownloadLeadModal = () => setDownloadAssetKey(null);
  const handleLayoutLeadInput = (event) => {
    const { name, value } = event.target;
    setLayoutLeadForm((previous) => ({
      ...previous,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const normalizedHash = String(location.hash || '').trim().toLowerCase();

    if (!normalizedHash) {
      lastHandledHashRef.current = '';
      return undefined;
    }

    if (lastHandledHashRef.current === normalizedHash) {
      return undefined;
    }

    lastHandledHashRef.current = normalizedHash;

    const timeoutId = window.setTimeout(() => {
      if (SITE_VISIT_FORM_HASHES.has(normalizedHash)) {
        trackEvent('form_open', withLandingVariant({
          form_name: 'kalpavruksha_site_visit_form',
          lead_type: 'site_visit',
          project: 'Kalpavruksha',
          source: 'hash_site_visit',
        }));
        setDownloadAssetKey(null);
        setVisitFormStep(1);
        setShowVisitModal(true);
        return;
      }

      if (DETAILS_FORM_HASHES.has(normalizedHash)) {
        if (!useMobileClientUx) {
          scrollToBrochureMapForm(normalizedHash === '#book' ? 'hash_book' : 'hash_brochure');
        }
        return;
      }

      if (LAYOUT_DOWNLOAD_FORM_HASHES.has(normalizedHash)) {
        setShowVisitModal(false);
        openDownloadLeadModal('layout', 'hash_layout_download');
        return;
      }

      if (normalizedHash === '#why-invest') {
        if (!useMobileClientUx) {
          aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (
        normalizedHash === '#layout' ||
        normalizedHash === '#master-plan' ||
        normalizedHash === '#master-layout'
      ) {
        if (!useMobileClientUx) {
          masterPlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (normalizedHash === '#location') {
        locationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (normalizedHash === '#amenities') {
        amenitiesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (normalizedHash === '#gallery') {
        if (!useMobileClientUx) {
          galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (normalizedHash === '#about') {
        aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, HASH_ACTION_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.hash, openDownloadLeadModal, scrollToBrochureMapForm, useMobileClientUx]);

  const onLayoutLeadChange = (e) => {
    const { name, value } = e.target;
    setLayoutLeadForm((prev) => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
  };

  const triggerAssetDownload = (assetConfig) => {
    if (!assetConfig?.url) return;
    const link = document.createElement('a');
    link.href = assetConfig.url;
    link.download = assetConfig.fileName || 'download.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const trackKalpavrukshaWhatsAppClick = (placement, attribution = null) => {
    trackWhatsAppClick(withLandingVariant({
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      lead_type: 'whatsapp_price',
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
    }));
  };

  const trackKalpavrukshaDirectionsClick = (placement) => {
    trackEvent('directions_click', withLandingVariant({
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      destination: 'kalpavruksha',
    }));
  };

  const trackKalpavrukshaCallClick = (placement) => {
    trackEvent('phone_click', withLandingVariant({
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      contact_method: 'phone',
    }));
  };

  const openKalpavrukshaWhatsApp = (placement) => {
    const { url, attribution } = buildKalpavrukshaWhatsAppUrl({
      projectName: 'Kalpavruksha',
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    trackKalpavrukshaWhatsAppClick(placement, attribution);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const launchKalpavrukshaLiveChat = async (placement) => {
    trackEvent('live_chat_open', withLandingVariant({
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      provider: 'zoho_salesiq',
    }));

    const opened = await openZohoSalesIQChat({
      question: KALPAVRUKSHA_ZOHO_CHAT_QUESTION,
      timeoutMs: 12000,
    });

    if (opened) {
      return;
    }

    trackEvent('live_chat_unavailable', withLandingVariant({
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      provider: 'zoho_salesiq',
    }));
    setToast({ type: 'error', message: 'Live chat is temporarily unavailable. Please try again.' });
  };

  const reverseGeocodePickup = (lat, lng) => {
    const requestId = Date.now();
    pickupGeocodeRequestRef.current = requestId;
    const fallbackText = `Selected location near ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    setForm(prev => ({
      ...prev,
      pickupAddress: 'Fetching address from map...',
      pickupLat: String(lat),
      pickupLng: String(lng)
    }));

    if (!window.google?.maps) {
      setForm(prev => ({
        ...prev,
        pickupAddress: fallbackText,
        pickupLat: String(lat),
        pickupLng: String(lng)
      }));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (pickupGeocodeRequestRef.current !== requestId) return;

      if (status === 'OK' && results && results[0]) {
        setForm(prev => ({
          ...prev,
          pickupAddress: results[0].formatted_address || fallbackText,
          pickupLat: String(lat),
          pickupLng: String(lng)
        }));
        return;
      }

      setForm(prev => ({
        ...prev,
        pickupAddress: fallbackText,
        pickupLat: String(lat),
        pickupLng: String(lng)
      }));
    });
  };

  const onPickupMapClick = (event) => {
    const lat = event?.latLng?.lat?.();
    const lng = event?.latLng?.lng?.();
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setPickupMapCenter({ lat, lng });
    reverseGeocodePickup(lat, lng);
  };

  const onPickupMarkerDragEnd = (event) => {
    const lat = event?.latLng?.lat?.();
    const lng = event?.latLng?.lng?.();
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setPickupMapCenter({ lat, lng });
    reverseGeocodePickup(lat, lng);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'transportRequired') {
      setForm(prev => (
        value === 'No'
          ? {
              ...prev,
              transportRequired: value,
              pickupAddress: '',
              pickupMode: 'manual',
              pickupLat: '',
              pickupLng: ''
            }
          : { ...prev, transportRequired: value }
      ));
      return;
    }
    if (name === 'pickupMode') {
      setForm(prev => ({
        ...prev,
        pickupMode: value,
        pickupLat: value === 'manual' ? '' : prev.pickupLat,
        pickupLng: value === 'manual' ? '' : prev.pickupLng
      }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitSiteVisit = async (e) => {
    e?.preventDefault?.();
    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedEmail = form.email.trim();
    const selectedInterest = form.interest || VISIT_INTEREST_OPTIONS[0];

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      setToast({ type: 'error', msg: 'Please enter your name, phone number, and email address.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setToast({ type: 'error', msg: 'Please enter a valid 10-digit phone number.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setToast({ type: 'error', msg: 'Please enter a valid email address.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (visitFormStep === 1) {
      trackEvent('visit_step_1_submit', withLandingVariant({
        form_name: 'kalpavruksha_site_visit_form',
        project: 'Kalpavruksha',
        source: 'kalpavruksha_site_visit_modal',
        interest: selectedInterest,
      }));
      setVisitFormStep(2);
      return;
    }

    const pickupRequired = form.transportRequired === 'Yes';
    if (!form.preferredDate || !form.preferredTime || (pickupRequired && !form.pickupAddress.trim())) {
      setToast({
        type: 'error',
        msg: pickupRequired
          ? 'Please select date, time slot, and pickup address.'
          : 'Please select date and time slot.'
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    try {
      setSubmitting(true);
      const preferredDateTime = `${form.preferredDate}T${form.preferredTime}`;
      const googleAdsAttribution = getGoogleAdsAttributionPayload();
      const visitNotes = [
        SITE_VISIT_ZOHO_NOTE,
        `Landing Variant: ${LANDING_VARIANT}`,
        `Website Version: ${LANDING_VERSION}`,
        selectedInterest ? `Interest: ${selectedInterest}` : null,
      ].filter(Boolean).join('\n');
      await api.post('/api/site-visits', {
        project: 'Kalpavruksha',
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        interest: selectedInterest,
        preferredDate: preferredDateTime,
        transportRequired: form.transportRequired,
        notes: visitNotes,
        platformSource: 'Website',
        platform_source: 'website',
        landingVariant: LANDING_VARIANT,
        landing_variant: LANDING_VARIANT,
        landingVersion: LANDING_VERSION,
        landing_version: LANDING_VERSION,
        version: LANDING_VERSION,
        pickupAddress: pickupRequired ? form.pickupAddress.trim() : undefined,
        pickupMode: pickupRequired ? form.pickupMode : undefined,
        pickupLat: pickupRequired ? (form.pickupLat || undefined) : undefined,
        pickupLng: pickupRequired ? (form.pickupLng || undefined) : undefined,
        slotAvailabilityIssue: visitSlotAvailability.issue,
        slotAvailabilityIssueReason: visitSlotAvailability.reason || undefined,
        slotAvailabilitySource: visitSlotAvailability.source,
        googleAdsAttribution: googleAdsAttribution || undefined,
      });
      trackEvent('book_site_visit_submitted', withLandingVariant({
        event_category: 'conversion',
        conversion_type: 'book_site_visit',
        form_name: 'kalpavruksha_site_visit_form',
        lead_type: 'site_visit',
        lead_status: 'Visit Scheduled',
        project: 'Kalpavruksha',
        source: 'kalpavruksha_site_visit_modal',
        interest: selectedInterest,
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime,
        transport_required: form.transportRequired,
        pickup_mode: pickupRequired ? form.pickupMode : undefined,
        slot_availability_issue: visitSlotAvailability.issue || undefined,
        slot_availability_source: visitSlotAvailability.source,
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
      }));
      setShowVisitModal(false);
      setForm(DEFAULT_SITE_VISIT_FORM);
      setVisitFormStep(1);
      navigate('/thank-you?type=site-visit');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      setToast({ type: 'error', msg });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLayoutLead = async (e, assetKeyOverride = null) => {
    e?.preventDefault?.();
    const trimmedName = layoutLeadForm.name.trim();
    const trimmedPhone = layoutLeadForm.phone.trim();
    const trimmedEmail = layoutLeadForm.email.trim();
    const selectedAssetKey = assetKeyOverride || downloadAssetKey;
    const selectedDownloadAsset = selectedAssetKey ? DOWNLOAD_ASSET_CONFIG[selectedAssetKey] : null;
    const isBrochureRequest = selectedAssetKey === 'brochure';

    if (!trimmedName || !trimmedPhone || (!isBrochureRequest && !trimmedEmail)) {
      setToast({
        type: 'error',
        msg: isBrochureRequest
          ? 'Please enter your name and 10-digit phone number to continue.'
          : 'Please enter your name, phone number, and email address to continue.'
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (!selectedDownloadAsset) {
      setToast({ type: 'error', msg: 'Please select a valid download option.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setToast({ type: 'error', msg: 'Please enter a valid 10-digit phone number.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setToast({ type: 'error', msg: 'Please enter a valid email address.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    try {
      setDownloadSubmitting(true);
      const googleAdsAttribution = getGoogleAdsAttributionPayload();
      await api.post('/api/leads/layout-download', {
        project: 'Kalpavruksha',
        source: selectedDownloadAsset.source,
        platformSource: 'Website',
        platform_source: 'website',
        landingVariant: LANDING_VARIANT,
        landing_variant: LANDING_VARIANT,
        landingVersion: LANDING_VERSION,
        landing_version: LANDING_VERSION,
        version: LANDING_VERSION,
        leadStatus: selectedDownloadAsset.leadStatus,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || undefined,
        googleAdsAttribution: googleAdsAttribution || undefined,
      });

      const assetType = selectedAssetKey === 'layout' ? 'master_layout' : 'brochure';
      trackEvent(`${assetType}_downloaded`, withLandingVariant({
        event_category: 'conversion',
        conversion_type: isBrochureRequest ? 'brochure_map_requested' : `${assetType}_download`,
        form_name: 'kalpavruksha_download_form',
        lead_type: isBrochureRequest ? 'brochure_map_request' : `${assetType}_download`,
        project: 'Kalpavruksha',
        source: 'kalpavruksha_download_form',
        asset_type: assetType,
        lead_status: selectedDownloadAsset.leadStatus,
        file_name: selectedDownloadAsset.fileName,
        file_extension: 'pdf',
        link_url: selectedDownloadAsset.url,
        delivery_channel: isBrochureRequest ? 'whatsapp_follow_up' : 'direct_download',
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
      }));

      closeDownloadLeadModal();
      setLayoutLeadForm({ name: '', phone: '', email: '' });
      if (!isBrochureRequest) {
        triggerAssetDownload(selectedDownloadAsset);
      }
      navigate(isBrochureRequest ? '/thank-you?type=brochure-map' : '/thank-you', isBrochureRequest ? {
        state: {
          thankYouType: 'brochure-map',
          project: 'Kalpavruksha',
          leadType: 'brochure_map_request',
          returnTo: '/kalpavruksha/',
        },
      } : undefined);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      setToast({ type: 'error', msg });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setDownloadSubmitting(false);
    }
  };

  const formSectionClass = "rounded-[26px] border border-[#eadfcb] bg-[linear-gradient(180deg,rgba(255,254,251,0.94)_0%,rgba(249,241,229,0.9)_100%)] p-4 shadow-[0_18px_42px_rgba(83,64,31,0.07)] backdrop-blur-sm md:p-5";
  const formSectionEyebrowClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6328]";
  const formSectionTitleClass = "mt-1 text-lg font-semibold tracking-[-0.01em] text-[#221c14]";
  const formLabelClass = "mb-2 block text-sm font-semibold text-[#53594f]";
  const formInputClass = "min-h-[3.2rem] w-full rounded-2xl border border-[#e0cfaf] bg-white/[0.96] px-4 py-3 text-[15px] text-[#221c14] placeholder:text-[#9a927f] shadow-[inset_0_1px_0_rgba(255,255,255,0.48),0_10px_22px_rgba(83,64,31,0.035)] transition-all duration-200 focus:border-[#cba159] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#cba159]/15";
  const formTextareaClass = "w-full rounded-2xl border border-[#e0cfaf] bg-white/[0.96] px-4 py-3 text-[15px] text-[#221c14] placeholder:text-[#9a927f] shadow-[inset_0_1px_0_rgba(255,255,255,0.48),0_10px_22px_rgba(83,64,31,0.035)] transition-all duration-200 focus:border-[#cba159] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#cba159]/15";
  const formChipClass = (isActive) =>
    isActive
      ? 'rounded-2xl border border-[#cba159] bg-[linear-gradient(180deg,#d8b36e_0%,#cba159_100%)] px-3 py-3 text-sm font-semibold text-[#1d1609] shadow-[0_12px_24px_rgba(203,161,89,0.18)]'
      : 'rounded-2xl border border-[#e0cfaf] bg-white/[0.9] px-3 py-3 text-sm font-medium text-[#5f665d] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cba159] hover:bg-[#fffaf1] hover:text-[#8b6328]';
  const pickupModeCardClass = (isActive) =>
    isActive
      ? 'flex cursor-pointer flex-col rounded-[20px] border border-[#cba159] bg-[linear-gradient(180deg,#fff4dc_0%,#f7ebd0_100%)] px-4 py-3 shadow-[0_14px_28px_rgba(203,161,89,0.14)]'
      : 'flex cursor-pointer flex-col rounded-[20px] border border-[#e3d4b9] bg-white/[0.92] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cba159] hover:bg-[#fffaf1]';
  const projectNavHeroBlend = projectNavScrollState.heroBlend;
  const projectNavLightLayerOpacity = clamp((projectNavHeroBlend - 0.06) / 0.58);
  const projectNavDarkLayerOpacity = clamp(1 - (projectNavHeroBlend * 1.1), 0.12, 1);
  const isProjectNavOnLightSurface = projectNavHeroBlend > 0.54;
  const projectNavShellStyle = {
    borderColor: isProjectNavOnLightSurface
      ? `rgba(207, 178, 123, ${0.48 + (projectNavLightLayerOpacity * 0.14)})`
      : `rgba(255, 248, 230, ${0.18 + (projectNavDarkLayerOpacity * 0.12)})`,
    boxShadow: isProjectNavOnLightSurface
      ? `0 22px 54px rgba(92, 67, 36, ${0.12 + (projectNavLightLayerOpacity * 0.08)})`
      : `0 22px 52px rgba(0, 0, 0, ${0.14 + (projectNavDarkLayerOpacity * 0.13)})`,
    backdropFilter: `blur(${12 + (projectNavHeroBlend * 9)}px)`,
    WebkitBackdropFilter: `blur(${12 + (projectNavHeroBlend * 9)}px)`,
    transform: `translateY(${(1 - projectNavHeroBlend) * 2}px)`
  };
  const projectNavLinkClassName = isProjectNavOnLightSurface
    ? 'text-[#514839] hover:text-[#8b6328]'
    : 'text-white/[0.92] hover:text-[#f6e6bf]';
  const projectNavBackButtonClassName = isProjectNavOnLightSurface
    ? 'border-[#ddcaa7] bg-white/[0.82] text-[#8b6328] hover:border-[#d1b178] hover:bg-white'
    : 'border-[#d7bd86]/40 bg-white/[0.08] text-[#f0ddb3] hover:bg-white/[0.14]';
  const projectNavGhostButtonClassName = isProjectNavOnLightSurface
    ? 'border-[#ddcaa7] bg-white/[0.72] text-[#3f3528] hover:border-[#d1b178] hover:bg-white'
    : 'border-white/[0.2] bg-white/[0.08] text-white/[0.92] hover:bg-white/[0.14]';
  const projectNavMenuButtonClassName = isProjectNavOnLightSurface
    ? 'border-[#ddcaa7] bg-white/[0.76] text-[#6b4a24] hover:border-[#d1b178] hover:bg-white'
    : 'border-white/[0.16] bg-white/[0.08] text-white hover:bg-white/[0.14]';
  const projectNavPanelClassName = isProjectNavOnLightSurface
    ? 'border-[#e7d8bd] bg-[#fffaf1]/92'
    : 'border-white/10 bg-transparent';
  const projectNavMobileItemClassName = isProjectNavOnLightSurface
    ? 'border-[#eadfcb] bg-white/[0.82] text-[#3f3528] hover:border-[#d1b178] hover:bg-white'
    : 'border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]';
  const projectNavWordmarkClassName = isProjectNavOnLightSurface ? 'text-[#8b6328]' : 'text-[#dbc58f]';
  const projectNavTrackColor = isProjectNavOnLightSurface ? 'rgba(139, 99, 40, 0.12)' : 'rgba(255, 255, 255, 0.08)';
  const selectedImageIndex = getSelectedImageIndex();

  if (useMobileClientUx && !showVisitModal && !activeDownloadAsset) {
    return (
      <KalpavrukshaMobileUx
        landingVariant={LANDING_VARIANT}
        landingVersion={LANDING_VERSION}
        googleReviewSummary={googleReviewSummary}
        onBookSiteVisit={openVisitModal}
        siteImages={sitePhotoPlaceholders}
      />
    );
  }

  return (
    <>
      <ZohoSalesIQWidgetLoader
        hideFloatButton
        homeWidgets={KALPAVRUKSHA_ZOHO_HOME_WIDGETS}
        theme={KALPAVRUKSHA_ZOHO_THEME}
        autoLoad
      />
      <Helmet>
        <title>{projectTitle}</title>

        <meta
          name="description"
          content={projectDescription}
        />

        <meta
          name="keywords"
          content={projectKeywords}
        />

        <link
          rel="preload"
          as="image"
          href={KALPAVRUKSHA_OVERVIEW_HERO_PRELOAD}
          type="image/webp"
          imageSrcSet={KALPAVRUKSHA_OVERVIEW_HERO_SRC_SET}
          imageSizes={HERO_IMAGE_SIZES}
          fetchPriority="high"
        />
        <link rel="canonical" href={projectCanonicalUrl} />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Easy Homes" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={projectShareTitle} />
        <meta property="og:description" content={projectShareDescription} />
        <meta property="og:url" content={projectCanonicalUrl} />
        <meta property="og:image" content={projectImageUrl} />
        <meta property="og:image:alt" content="Kalpavruksha open plots by Easy Homes in Vijayawada" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={projectShareTitle} />
        <meta name="twitter:description" content={projectShareDescription} />
        <meta name="twitter:image" content={projectImageUrl} />
        <meta name="twitter:image:alt" content="Kalpavruksha open plots by Easy Homes in Vijayawada" />

        {shouldRenderStructuredData && (
          <>
            <script id="kalpavruksha-breadcrumb-schema" type="application/ld+json">
              {JSON.stringify(breadcrumbData)}
            </script>
            <script id="kalpavruksha-agent-schema" type="application/ld+json">
              {JSON.stringify(realEstateAgentData)}
            </script>
            <script id="kalpavruksha-webpage-schema" type="application/ld+json">
              {JSON.stringify(webPageData)}
            </script>
            <script id="kalpavruksha-listing-schema" type="application/ld+json">
              {JSON.stringify(projectSchema)}
            </script>
            <script id="kalpavruksha-faq-schema" type="application/ld+json">
              {JSON.stringify(faqSchema)}
            </script>
            <script id="kalpavruksha-buyer-guide-schema" type="application/ld+json">
              {JSON.stringify(buyerGuideSchema)}
            </script>
          </>
        )}
      </Helmet>
      <style>
        {`
          @keyframes kalpa-v1-fade-up {
            from {
              opacity: 0;
              transform: translate3d(0, 18px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes kalpa-v1-scale-in {
            from {
              opacity: 0;
              transform: translate3d(0, 14px, 0) scale(0.975);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes kalpa-v1-slide-left {
            from {
              opacity: 0;
              transform: translate3d(-22px, 0, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes kalpa-v1-number-pop {
            0% {
              opacity: 0;
              transform: translate3d(0, 8px, 0) scale(0.96);
            }
            55% {
              opacity: 1;
              transform: translate3d(0, -1px, 0) scale(1.025);
            }
            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes kalpa-v1-icon-breathe {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              box-shadow: 0 10px 24px rgba(203, 161, 89, 0.08);
            }
            50% {
              transform: translate3d(0, -2px, 0);
              box-shadow: 0 16px 30px rgba(203, 161, 89, 0.16);
            }
          }

          .kalpa-v1-reveal,
          .kalpa-v1-reveal-scale,
          .kalpa-v1-reveal-left,
          .kalpa-v1-number-pop {
            opacity: 0;
            will-change: opacity, transform;
          }

          .kalpa-v1-reveal.kalpa-v1-in-view {
            animation: kalpa-v1-fade-up 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
            animation-delay: var(--kalpa-reveal-delay, 0ms);
          }

          .kalpa-v1-reveal-scale.kalpa-v1-in-view {
            animation: kalpa-v1-scale-in 760ms cubic-bezier(0.22, 1, 0.36, 1) both;
            animation-delay: var(--kalpa-reveal-delay, 0ms);
          }

          .kalpa-v1-reveal-left.kalpa-v1-in-view {
            animation: kalpa-v1-slide-left 760ms cubic-bezier(0.22, 1, 0.36, 1) both;
            animation-delay: var(--kalpa-reveal-delay, 0ms);
          }

          .kalpa-v1-number-pop {
            display: inline-block;
          }

          .kalpa-v1-number-pop.kalpa-v1-in-view {
            animation: kalpa-v1-number-pop 820ms cubic-bezier(0.22, 1, 0.36, 1) both;
            animation-delay: var(--kalpa-reveal-delay, 0ms);
          }

          .kalpa-v1-icon-breathe {
            animation: kalpa-v1-icon-breathe 3.8s ease-in-out infinite;
          }

          .kalpa-v1-image-lift {
            transform-origin: center;
            transition: transform 780ms cubic-bezier(0.22, 1, 0.36, 1), filter 780ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .group:hover .kalpa-v1-image-lift,
          .kalpa-v1-image-lift:hover {
            filter: saturate(1.05) contrast(1.025);
            transform: scale(1.045) translate3d(0, -2px, 0);
          }

          .kalpa-v1-cta-sheen {
            isolation: isolate;
            overflow: hidden;
            position: relative;
          }

          .kalpa-v1-cta-sheen::after {
            background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.36) 45%, transparent 78%);
            content: '';
            height: 160%;
            left: -70%;
            opacity: 0;
            pointer-events: none;
            position: absolute;
            top: -30%;
            transform: translateX(0) rotate(12deg);
            transition: opacity 280ms ease, transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
            width: 46%;
            z-index: 0;
          }

          .kalpa-v1-cta-sheen > * {
            position: relative;
            z-index: 1;
          }

          .kalpa-v1-cta-sheen:hover::after {
            opacity: 1;
            transform: translateX(360%) rotate(12deg);
          }

          .kalpa-v1-luxe-card {
            isolation: isolate;
            overflow: hidden;
            position: relative;
            transform: translateZ(0);
          }

          .kalpa-v1-luxe-card::before {
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.62), transparent);
            content: '';
            height: 1px;
            left: 18px;
            opacity: 0.72;
            position: absolute;
            right: 18px;
            top: 0;
            z-index: 1;
          }

          .kalpa-v1-luxe-card::after {
            background: radial-gradient(circle at 18% 0%, rgba(215, 177, 111, 0.12), transparent 28%);
            content: '';
            inset: 0;
            opacity: 0;
            pointer-events: none;
            position: absolute;
            transition: opacity 320ms ease;
            z-index: 0;
          }

          .kalpa-v1-luxe-card > * {
            position: relative;
            z-index: 1;
          }

          .kalpa-v1-luxe-card:hover::after {
            opacity: 1;
          }

          .kalpa-v1-section-rule {
            background: linear-gradient(90deg, transparent 0%, rgba(203, 161, 89, 0.42) 22%, rgba(203, 161, 89, 0.42) 78%, transparent 100%);
            height: 1px;
          }

          @keyframes kalpa-v1-gallery-progress {
            from {
              transform: scaleX(0);
            }

            to {
              transform: scaleX(1);
            }
          }

          .kalpa-v1-gallery-progress {
            animation: kalpa-v1-gallery-progress 4200ms linear infinite;
            transform-origin: left center;
          }

          @media (prefers-reduced-motion: reduce) {
            .kalpa-v1-reveal,
            .kalpa-v1-reveal-scale,
            .kalpa-v1-reveal-left,
            .kalpa-v1-number-pop,
            .kalpa-v1-icon-breathe {
              animation: none;
              opacity: 1;
              transform: none;
            }

            .kalpa-v1-gallery-progress {
              animation: none;
              transform: scaleX(1);
            }

            .kalpa-v1-image-lift,
            .group:hover .kalpa-v1-image-lift,
            .kalpa-v1-image-lift:hover {
              filter: none;
              transform: none;
            }

            .kalpa-v1-cta-sheen::after {
              display: none;
            }
          }
        `}
      </style>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 z-[150] -translate-x-1/2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'border-[#d3b57c] bg-[#162118] text-[#f5ebd2]' : 'border-[#8f4a4a] bg-[#5d2626] text-[#fff1ee]'}`}>
          {toast.msg}
        </div>
      )}

      {/* Site Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/55 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[3px] sm:p-4 md:items-center" onClick={(e) => { if (e.target === e.currentTarget) closeVisitModal(); }}>
          <div className="relative my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-[#e2d4ba] bg-[linear-gradient(180deg,#fcfaf5_0%,#f6efe0_100%)] shadow-[0_34px_90px_rgba(0,0,0,0.24)] md:my-6 md:max-h-[calc(100vh-3rem)]">
            <div className="border-b border-[#ebe2d1] bg-[linear-gradient(180deg,#f7f0e2_0%,#f0e1c4_100%)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6328]">Visit Planning</p>
                  <h3 className="mt-2 text-[1.65rem] font-bold tracking-[-0.02em] text-[#221c14]">Book a Site Visit</h3>
                </div>
                <button onClick={closeVisitModal} type="button" className="rounded-full border border-[#dfd2b5] bg-white p-2 text-[#6f6a5f] transition-colors duration-200 hover:bg-[#fbf7ef] hover:text-[#221c14]"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <form id="site-visit-form" onSubmit={submitSiteVisit} className="flex flex-1 min-h-0 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {visitFormStep === 1 ? (
                  <>
                    <div className={formSectionClass}>
                      <p className={formSectionEyebrowClass}>Step 1 of 2</p>
                      <h4 className={formSectionTitleClass}>Quick details</h4>
                      <p className="mt-2 text-sm leading-6 text-[#627067]">
                        Share only the essentials first. Visit timing and pickup details come next.
                      </p>
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={formLabelClass}>Full Name</label>
                          <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            className={formInputClass}
                            placeholder="Your name"
                            autoFocus
                            required
                          />
                        </div>
                        <div>
                          <label className={formLabelClass}>Mobile Number</label>
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            className={formInputClass}
                            placeholder="e.g., 9898899666"
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            required
                          />
                        </div>
                        <div>
                          <label className={formLabelClass}>Email Address</label>
                          <input
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            className={formInputClass}
                            placeholder="you@example.com"
                            type="email"
                            autoComplete="email"
                            required
                          />
                        </div>
                      </div>
                    </div>

                  </>
                ) : (
                  <>
                    <div className="rounded-[24px] border border-[#eadfcb] bg-[#fffaf1] px-4 py-3 text-sm text-[#5f6a62]">
                      <span className="font-semibold text-[#18231d]">{form.name || 'Buyer'}</span>
                      <span>, choose an available visit slot to continue.</span>
                    </div>

                    <div className={formSectionClass}>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-6">
                        <div>
                          <p className={formSectionEyebrowClass}>Step 2 of 2</p>
                          <h4 className={formSectionTitleClass}>Pick a suitable slot</h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className={formLabelClass}>Preferred Date</label>
                            <input type="date" name="preferredDate" min={todayDate} value={form.preferredDate} onChange={onChange} className={formInputClass} required />
                          </div>
                          <div>
                            <label className={formLabelClass}>Preferred Time Slot</label>
                            <div className="max-h-40 overflow-y-auto rounded-[22px] border border-[#e6dac2] bg-[#fbf6ec] p-2.5" aria-live="polite">
                              {!form.preferredDate ? (
                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#6f6a5f]">
                                  Select a date to see available slots.
                                </div>
                              ) : visitSlotsLoading ? (
                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#6f6a5f]">
                                  Loading available slots...
                                </div>
                              ) : visitSlotsError ? (
                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#7a3434]">
                                  {visitSlotsError}
                                </div>
                              ) : availableVisitSlots.length ? (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                  {availableVisitSlots.map((slot) => (
                                    <button
                                      key={slot.value}
                                      type="button"
                                      onClick={() => setForm(prev => ({ ...prev, preferredTime: slot.value }))}
                                      className={formChipClass(form.preferredTime === slot.value)}
                                    >
                                      {slot.label}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#6f6a5f]">
                                  No slots are available for this date. Please choose another date.
                                </div>
                              )}
                            </div>
                            <input type="hidden" name="preferredTime" value={form.preferredTime} required />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={formSectionClass}>
                      <p className={formSectionEyebrowClass}>Travel Assistance</p>
                      <h4 className={formSectionTitleClass}>Need pickup support?</h4>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {['Yes', 'No'].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => onChange({ target: { name: 'transportRequired', value } })}
                            className={formChipClass(form.transportRequired === value)}
                          >
                            {value}
                          </button>
                        ))}
                      </div>

                      {form.transportRequired === 'Yes' ? (
                        <div className="mt-5 space-y-4">
                          <div>
                            <label className={formLabelClass}>Pickup Address Input</label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <label className={pickupModeCardClass(form.pickupMode === 'manual')}>
                                <input
                                  type="radio"
                                  name="pickupMode"
                                  value="manual"
                                  checked={form.pickupMode === 'manual'}
                                  onChange={onChange}
                                  className="sr-only"
                                />
                                <span className="text-sm font-semibold text-[#221c14]">Manual Address</span>
                              </label>
                              <label className={pickupModeCardClass(form.pickupMode === 'map')}>
                                <input
                                  type="radio"
                                  name="pickupMode"
                                  value="map"
                                  checked={form.pickupMode === 'map'}
                                  onChange={onChange}
                                  className="sr-only"
                                />
                                <span className="text-sm font-semibold text-[#221c14]">Select on Map</span>
                              </label>
                            </div>
                          </div>

                          {form.pickupMode === 'map' && (
                            <div className="overflow-hidden rounded-[22px] border border-[#e5dcc8] bg-white">
                              {!pickupMapApiKey ? (
                                <div className="p-3 text-xs text-[#5f665d]">
                                  Map is unavailable right now. Enter the pickup address manually below.
                                </div>
                              ) : pickupMapLoadError ? (
                                <div className="p-3 text-xs text-[#7a3434]">
                                  Map failed to load. Enter the pickup address manually below.
                                </div>
                              ) : (
                                <Suspense fallback={<div className="p-3 text-xs text-[#5f665d]">Loading map...</div>}>
                                  <PickupLocationMap
                                    apiKey={pickupMapApiKey}
                                    center={pickupMapCenter}
                                    containerStyle={PICKUP_MAP_CONTAINER_STYLE}
                                    libraries={MAP_LIBRARIES}
                                    mapLoaderId={MAPS_LOADER_ID}
                                    onLoadError={() => setPickupMapLoadError(true)}
                                    onMapClick={onPickupMapClick}
                                    onMarkerDragEnd={onPickupMarkerDragEnd}
                                    selectedPosition={
                                      form.pickupLat && form.pickupLng
                                        ? { lat: Number(form.pickupLat), lng: Number(form.pickupLng) }
                                        : null
                                    }
                                  />
                                </Suspense>
                              )}
                            </div>
                          )}

                          <div>
                            <textarea
                              name="pickupAddress"
                              value={form.pickupAddress}
                              onChange={onChange}
                              rows={3}
                              className={formTextareaClass}
                              placeholder={form.pickupMode === 'map' ? 'Click map/drag marker to fill textual address, or type manually' : 'Enter pickup address'}
                              required
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
              <div className="shrink-0 border-t border-[#ebe2d1] bg-white/[0.72] px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm md:pb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  {visitFormStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setVisitFormStep(1)}
                      className="inline-flex min-h-[3.35rem] w-full items-center justify-center rounded-2xl border border-[#e0cfaf] bg-white px-5 py-3 font-semibold text-[#221c14] sm:w-auto sm:min-w-[8rem]"
                    >
                      Back
                    </button>
                  )}
                  <button type="submit" disabled={submitting} className={`inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-[0_18px_34px_rgba(203,161,89,0.18)] sm:w-auto sm:min-w-[13rem] ${submitting ? 'bg-[#dcc7a0] text-[#6f654e]' : 'bg-[#cba159] text-[#1d1609] hover:bg-[#d4ab68]'}`}>
                    <CheckCircle className="h-4 w-4" />
                    {submitting ? 'Submitting...' : visitFormStep === 1 ? 'Continue' : 'Book Free Site Visit'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Layout Download Lead Modal */}
      {downloadAssetKey && activeDownloadAsset && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/55 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-[3px] sm:p-4 md:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeDownloadLeadModal(); }}
        >
          <div className="relative my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-[32px] border border-[#e2d4ba] bg-[linear-gradient(180deg,#fcfaf5_0%,#f6efe0_100%)] shadow-[0_34px_90px_rgba(0,0,0,0.24)] md:my-6 md:max-h-[calc(100vh-3rem)]">
            <div className="border-b border-[#ebe2d1] bg-[linear-gradient(180deg,#f7f0e2_0%,#f0e1c4_100%)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6328]">Document Access</p>
                  <h3 className="mt-2 text-[1.55rem] font-bold tracking-[-0.02em] text-[#221c14]">{activeDownloadAsset.title}</h3>
                </div>
                <button onClick={closeDownloadLeadModal} className="rounded-full border border-[#dfd2b5] bg-white p-2 text-[#6f6a5f] transition-colors duration-200 hover:bg-[#fbf7ef] hover:text-[#221c14]" type="button">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form id="layout-download" onSubmit={submitLayoutLead} className="flex flex-1 min-h-0 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div className={formSectionClass}>
                  <p className={formSectionEyebrowClass}>Quick Details</p>
                  <h4 className={formSectionTitleClass}>Contact Details</h4>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={formLabelClass}>Full Name</label>
                      <input
                        name="name"
                        value={layoutLeadForm.name}
                        onChange={onLayoutLeadChange}
                        className={formInputClass}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Phone Number</label>
                      <input
                        name="phone"
                        value={layoutLeadForm.phone}
                        onChange={onLayoutLeadChange}
                        className={formInputClass}
                        placeholder="e.g., 9898899666"
                        required
                      />
                    </div>
                    <div>
                      <label className={formLabelClass}>Email Address</label>
                      <input
                        name="email"
                        value={layoutLeadForm.email}
                        onChange={onLayoutLeadChange}
                        className={formInputClass}
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                </div>

              </div>
              <div className="shrink-0 border-t border-[#ebe2d1] bg-white/[0.72] px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm md:pb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="submit"
                    disabled={downloadSubmitting}
                    className="inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl bg-[#cba159] px-5 py-3 font-semibold text-[#1d1609] shadow-[0_18px_34px_rgba(203,161,89,0.18)] hover:bg-[#d4ab68] disabled:bg-[#dcc7a0] disabled:text-[#6f654e] sm:w-auto sm:min-w-[13rem]"
                  >
                    <Download className="h-4 w-4" />
                    {downloadSubmitting ? 'Submitting...' : 'Submit & Download'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <h1 className="sr-only">
        Kalpavruksha open plots in Vijayawada by Easy Homes
      </h1>

      <div className="fixed inset-x-0 top-0 z-[90] px-3 pt-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded-[26px] border transition-[border-color,box-shadow,transform] duration-500"
            style={projectNavShellStyle}
          >
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,9,0.4)_0%,rgba(10,14,12,0.14)_100%)] transition-opacity duration-500"
                style={{ opacity: projectNavDarkLayerOpacity }}
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,242,0.94)_0%,rgba(246,236,221,0.9)_100%)] transition-opacity duration-500"
                style={{ opacity: projectNavLightLayerOpacity }}
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(223,195,137,0.18),transparent_30%),radial-gradient(circle_at_right_bottom,rgba(118,86,46,0.12),transparent_30%)] transition-opacity duration-500"
                style={{ opacity: 0.18 + (projectNavLightLayerOpacity * 0.54) }}
              />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-6 lg:py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <Link
                    to="/"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${projectNavBackButtonClassName}`}
                    aria-label="Back to Easy Homes home"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium uppercase tracking-[0.3em] transition-colors duration-300 sm:text-[0.95rem] ${projectNavWordmarkClassName}`}>
                      Kalpavruksha
                    </p>
                  </div>
                </div>

                <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
                  {projectNavItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition-colors duration-300 hover:bg-white/[0.08] ${projectNavLinkClassName}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                  <a
                    href="tel:+918988896666"
                    onClick={() => trackKalpavrukshaCallClick('header_cta')}
                    className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 md:inline-flex ${projectNavGhostButtonClassName}`}
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Now</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => openVisitModal()}
                    className="hidden rounded-full bg-[#cba159] px-4 py-2.5 text-sm font-semibold text-[#1d1609] shadow-[0_16px_34px_rgba(203,161,89,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d4ab68] lg:inline-flex"
                  >
                    Schedule a Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProjectNavOpen((current) => !current)}
                    aria-expanded={isProjectNavOpen}
                    aria-controls="kalpavruksha-project-nav"
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 lg:hidden ${projectNavMenuButtonClassName}`}
                  >
                    {isProjectNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isProjectNavOpen && (
                <div
                  id="kalpavruksha-project-nav"
                  className={`border-t px-4 pb-4 pt-3 transition-colors duration-300 lg:hidden ${projectNavPanelClassName}`}
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {projectNavItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setIsProjectNavOpen(false);
                          item.onClick();
                        }}
                        className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-300 ${projectNavMobileItemClassName}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <a
                      href="tel:+918988896666"
                      onClick={() => {
                        setIsProjectNavOpen(false);
                        trackKalpavrukshaCallClick('header_mobile_cta');
                      }}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${projectNavMobileItemClassName}`}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Now</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProjectNavOpen(false);
                        openVisitModal();
                      }}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#cba159] px-4 py-3 text-sm font-semibold text-[#1d1609] transition-all duration-300 hover:bg-[#d4ab68]"
                    >
                      Schedule a Visit
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden"
            >
              <div className="absolute inset-0" style={{ backgroundColor: projectNavTrackColor }} />
              <div
                className="h-full origin-left rounded-r-full bg-[linear-gradient(90deg,#9f4d3f_0%,#c88663_48%,#dfc78b_100%)] shadow-[0_0_18px_rgba(200,134,99,0.34)] transition-transform duration-200 ease-out"
                style={{ transform: `scaleX(${projectNavScrollState.pageProgress})` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen overflow-hidden bg-[#f8f4ec]">
        {/* Section 1: Hero Section */}
        <section ref={heroSectionRef} className="relative isolate min-h-[100svh] overflow-hidden bg-[#111712] text-white">
          <div className="absolute inset-0">
            <div
              className={`h-full w-full transition-all duration-500 ease-in-out ${
                isHeroSlideVisible ? 'scale-100 opacity-100' : 'scale-[1.02] opacity-0'
              }`}
            >
              <img
                key={activeHeroSlide.id}
                src={activeHeroSlide.image}
                srcSet={activeHeroSlide.imageSrcSet}
                sizes={activeHeroSlide.imageSizes || '100vw'}
                alt={activeHeroSlide.alt}
                className="h-full w-full object-cover brightness-[0.94] saturate-[1.02] transition-transform duration-700 ease-out"
                style={{
                  objectPosition: activeHeroSlide.imagePosition || 'center center',
                  transformOrigin: 'center center',
                  transform: `scale(${activeHeroSlide.imageScale || 1.03})`,
                }}
                fetchPriority={activeHeroSlideIndex === 0 ? 'high' : 'auto'}
                decoding="async"
                loading={activeHeroSlideIndex === 0 ? 'eager' : 'lazy'}
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(6,10,8,0.5)_0%,rgba(7,11,9,0.3)_28%,rgba(7,11,9,0.12)_56%,rgba(7,11,9,0.04)_100%)] sm:bg-[linear-gradient(95deg,rgba(6,10,8,0.42)_0%,rgba(7,11,9,0.24)_28%,rgba(7,11,9,0.08)_56%,rgba(7,11,9,0.03)_100%)]"></div>
            <div className="absolute inset-0 sm:hidden bg-[linear-gradient(90deg,rgba(7,10,8,0.56)_0%,rgba(7,10,8,0.42)_38%,rgba(7,10,8,0.22)_68%,rgba(7,10,8,0.08)_100%)]"></div>
            <div className="hidden sm:block absolute inset-y-0 left-0 w-[74%] lg:w-[58%] bg-[linear-gradient(90deg,rgba(7,10,8,0.2)_0%,rgba(7,10,8,0.15)_44%,rgba(7,10,8,0.08)_68%,rgba(7,10,8,0.03)_84%,rgba(7,10,8,0)_100%)] backdrop-blur-[3px]"></div>
            <div className="hidden sm:block absolute inset-y-0 left-0 w-[58%] lg:w-[40%] bg-[linear-gradient(90deg,rgba(7,10,8,0.16)_0%,rgba(7,10,8,0.1)_54%,rgba(7,10,8,0.03)_84%,rgba(7,10,8,0)_100%)] backdrop-blur-[7px]"></div>
            <div className="hidden sm:block absolute inset-y-0 left-0 w-[40%] lg:w-[26%] bg-[linear-gradient(90deg,rgba(7,10,8,0.12)_0%,rgba(7,10,8,0.05)_68%,rgba(7,10,8,0)_100%)] backdrop-blur-[12px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,8,0.28)_0%,rgba(6,10,8,0.06)_28%,rgba(6,10,8,0.12)_72%,rgba(6,10,8,0.34)_100%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(231,201,140,0.12),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(39,94,62,0.1),_transparent_32%)]"></div>
          </div>

          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/[0.24] to-transparent"></div>

          <div
            className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 pb-8 pt-[8.8rem] sm:px-6 sm:pb-10 sm:pt-32 lg:px-8 lg:pb-12 lg:pt-28"
            onTouchStart={handleHeroTouchStart}
            onTouchEnd={handleHeroTouchEnd}
            style={{ touchAction: 'pan-y' }}
          >
            <div className="relative grid min-h-0 flex-1 items-end gap-8 lg:grid-cols-[minmax(0,58rem)_1fr] lg:gap-14 xl:gap-[4.5rem]">
              <div aria-live="polite" className="w-full min-w-0 self-end">
                <div className="w-full max-w-[58rem]">
                  <article
                    key={activeHeroSlide.id}
                    className={`w-full transition-all duration-500 ease-in-out ${
                      isHeroSlideVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                    }`}
                  >
                    <div className="relative w-full max-w-none px-0 sm:max-w-[46rem] lg:max-w-[50rem]">
                      <div className="pointer-events-none absolute -left-6 -top-7 hidden h-[17rem] w-[17rem] rounded-full bg-[radial-gradient(circle,_rgba(6,10,8,0.22)_0%,_rgba(6,10,8,0.08)_54%,_rgba(6,10,8,0)_82%)] blur-2xl sm:block sm:h-[21rem] sm:w-[21rem]"></div>
                      <div className="relative flex flex-col justify-end">
                        <div>
                        <p className="flex w-fit items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#f1ddb1] backdrop-blur-none sm:px-3.5 sm:py-2 sm:text-[11px] sm:backdrop-blur-sm">
                          <span className="h-2 w-2 rounded-full bg-[#dcb66a] shadow-[0_0_0_4px_rgba(220,182,106,0.12)]"></span>
                          <span>{activeHeroSlide.eyebrow}</span>
                        </p>
                        <div className="mt-4 h-px w-28 bg-gradient-to-r from-[#e1cb97] via-white/[0.45] to-transparent sm:mt-5"></div>

                        <div className="mt-4 min-h-[4.4rem] sm:mt-5 sm:min-h-[5.4rem] lg:min-h-[6.1rem]">
                          <h1
                            className="w-full max-w-none leading-[0.94] tracking-[-0.065em] text-[#fbf6ea] [text-shadow:0_12px_30px_rgba(0,0,0,0.24)] sm:max-w-[14.5ch] lg:max-w-[16ch]"
                            style={{ fontWeight: 800, fontSize: 'clamp(2.15rem, 4.5vw, 4.85rem)', textWrap: 'balance' }}
                          >
                            {activeHeroSlide.title}
                          </h1>
                        </div>

                        <div className="mt-3 min-h-[3.2rem] w-full max-w-none sm:mt-4 sm:max-w-[35rem] sm:min-h-[3.8rem] lg:max-w-[38rem]">
                          <p
                            className="text-[14px] leading-6 text-white/[0.88] [text-shadow:0_8px_20px_rgba(0,0,0,0.18)] sm:text-[0.98rem] sm:leading-7"
                            style={{ textWrap: 'balance' }}
                          >
                            {activeHeroSlide.description}
                          </p>
                        </div>
                      </div>

                        <div className="mt-4 flex w-full max-w-none flex-wrap gap-2 sm:mt-5 sm:max-w-[38rem] sm:gap-2.5">
                          {activeHeroSlide.facts.map((fact, index) => (
                            <span
                              key={fact}
                              className={`kalpa-v1-reveal-scale inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-white/[0.92] backdrop-blur-none sm:px-3.5 sm:text-[13px] sm:backdrop-blur-sm ${
                                index === 2 ? 'hidden sm:inline-flex' : ''
                              }`}
                              style={{ '--kalpa-reveal-delay': `${index * 60}ms` }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-[#dcb66a]"></span>
                              <span>{fact}</span>
                            </span>
                          ))}
                        </div>

                        <p className="mt-5 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead6aa]/90 sm:block">
                          {HERO_SUPPORT_LINE}
                        </p>

                        <a
                          href={googleReviewSummary.reviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackGoogleReviewsClick('hero_review_pill')}
                          className="mt-4 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[#e8cc8f]/30 bg-black/[0.18] px-3 py-1.5 text-[11px] font-semibold text-white/[0.9] shadow-[0_10px_22px_rgba(0,0,0,0.14)] transition hover:border-[#e8cc8f]/55 hover:bg-black/[0.26] sm:mt-5 sm:text-xs"
                          aria-label="Open Kalpavruksha Google reviews in a new tab"
                        >
                          <span className="rounded-full bg-[#e5c27f] px-2 py-0.5 text-[#1d1609]">{googleReviewSummary.rating}</span>
                          <span className="flex items-center gap-0.5 text-[#e5c27f]" aria-label={`${googleReviewSummary.rating} out of 5 stars`}>
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star key={index} className="h-3.5 w-3.5 fill-current" strokeWidth={1.8} />
                            ))}
                          </span>
                          <span>{googleReviewSummary.reviewCount} Google Reviews</span>
                        </a>

                        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:gap-3.5">
                          <button
                            type="button"
                            aria-label="Location & Project Details"
                            onClick={() => scrollToBrochureMapForm('hero_price_location_cta')}
                            className="kalpa-v1-cta-sheen inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#cba159] px-6 py-3.5 text-[15px] font-semibold text-[#1d1609] shadow-[0_18px_38px_rgba(203,161,89,0.28)] transition-all duration-300 hover:bg-[#d4ab68] hover:shadow-[0_22px_42px_rgba(203,161,89,0.34)] sm:min-h-14 sm:w-auto sm:min-w-[13.5rem] sm:px-8 sm:text-base"
                          >
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Location & Project Details</span>
                          </button>

                          <button
                            type="button"
                            aria-label="Book Site Visit"
                            onClick={() => openVisitModal('hero_book_site_visit_cta')}
                            className="kalpa-v1-cta-sheen inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#e1c482]/55 bg-[linear-gradient(180deg,rgba(255,250,241,0.14)_0%,rgba(215,177,111,0.18)_100%)] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-[#e7cd95] hover:bg-[linear-gradient(180deg,rgba(255,250,241,0.18)_0%,rgba(215,177,111,0.24)_100%)] sm:min-h-14 sm:w-auto sm:min-w-[13rem] sm:px-6 sm:text-base"
                          >
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Book Site Visit</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <div className="hidden items-end justify-end lg:flex">
                <div className="translate-y-3 rounded-[22px] border border-white/[0.1] bg-black/[0.14] px-4 py-3.5 shadow-[0_18px_34px_rgba(0,0,0,0.16)] backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] uppercase tracking-[0.24em] text-white/[0.62]">
                    <span>{String(activeHeroSlideIndex + 1).padStart(2, '0')}</span>
                    <span className="h-1 w-1 rounded-full bg-[#d4ab67]/65"></span>
                    <span>{activeHeroSlide.navLabel}</span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={goToPreviousHeroSlide}
                      aria-label="Show previous slide"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-white/[0.74] backdrop-blur-sm transition-all duration-300 hover:border-[#d8b46c]/60 hover:bg-white/[0.1] hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {heroSlides.map((slide, index) => {
                        const isActive = index === activeHeroSlideIndex;
                        return (
                          <button
                            key={slide.id}
                            type="button"
                            aria-label={`Show ${slide.navLabel} slide`}
                            onClick={() => changeHeroSlide(index)}
                            className={`rounded-full transition-all duration-300 ${
                              isActive ? 'h-1.5 w-6 bg-[#d4ab67]' : 'h-1.5 w-1.5 bg-white/[0.26] hover:bg-white/[0.4]'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={goToNextHeroSlide}
                      aria-label="Show next slide"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-white/[0.74] backdrop-blur-sm transition-all duration-300 hover:border-[#d8b46c]/60 hover:bg-white/[0.1] hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={scrollToAbout}
                    className="mt-3 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/[0.72] transition-colors duration-300 hover:text-white"
                  >
                    <span>Discover More</span>
                    <ChevronDown className="h-4 w-4 text-[#e1cb97]" />
                  </button>
                </div>
              </div>

              <div className="w-full rounded-[20px] border border-white/[0.08] bg-black/[0.24] px-4 py-3.5 shadow-[0_16px_28px_rgba(0,0,0,0.16)] lg:hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goToPreviousHeroSlide}
                      aria-label="Show previous slide"
                      className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-white/[0.74] transition-all duration-300 hover:border-[#d8b46c]/60 hover:bg-white/[0.08] hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={goToNextHeroSlide}
                      aria-label="Show next slide"
                      className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-white/[0.74] transition-all duration-300 hover:border-[#d8b46c]/60 hover:bg-white/[0.08] hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {heroSlides.map((slide, index) => {
                      const isActive = index === activeHeroSlideIndex;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          aria-label={`Show ${slide.navLabel} slide`}
                          onClick={() => changeHeroSlide(index)}
                          className={`rounded-full transition-all duration-300 ${
                            isActive ? 'h-1.5 w-5 bg-[#d4ab67]' : 'h-1.5 w-1.5 bg-white/[0.24] hover:bg-white/[0.38]'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/[0.62]">
                    <span>{String(activeHeroSlideIndex + 1).padStart(2, '0')}</span>
                    <span className="h-1 w-1 rounded-full bg-[#d4ab67]/65"></span>
                    <span>{activeHeroSlide.navLabel}</span>
                  </div>

                  <button
                    type="button"
                    onClick={scrollToAbout}
                    className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/[0.72] transition-colors duration-300 hover:text-white"
                  >
                    <span>Discover More</span>
                    <ChevronDown className="h-4 w-4 text-[#e1cb97]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buyer shortlist and live site proof */}
        <div ref={amenitiesRef} />
        <section
          ref={aboutRef}
          className="relative z-10 overflow-hidden border-t border-[#e6d8bd] bg-[radial-gradient(circle_at_12%_0%,rgba(203,161,89,0.16),transparent_30%),linear-gradient(180deg,#fffdf8_0%,#f3e5cf_100%)] py-12 md:py-16"
          style={DEFERRED_SECTION_STYLE}
        >
          <div className="pointer-events-none absolute -right-20 top-12 h-72 w-72 rounded-full bg-white/55 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="kalpa-v1-reveal-left">
                <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm">
                  Why Choose Us
                </div>
                <h2 className="mx-auto mt-5 max-w-3xl text-[2rem] font-bold leading-[1.04] tracking-[-0.04em] text-[#18231d] md:text-[2.85rem]">
                  What makes Kalpavruksha different
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#627067]">
                  Built for buyers who value transparency, lifestyle, and long-term appreciation.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr,0.92fr] lg:items-stretch">
                <div className="order-2 grid gap-3 sm:grid-cols-2 lg:order-2">
                  {kalpavrukshaDifferenceItems.map((item, index) => (
                    <div
                      key={item.title}
                      className="kalpa-v1-luxe-card kalpa-v1-reveal rounded-[22px] border border-[#eadfcb] bg-white/[0.86] p-4 shadow-[0_14px_32px_rgba(83,64,31,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d8b46c]/65 hover:bg-white"
                      style={{ '--kalpa-reveal-delay': `${index * 65}ms` }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a7a3d]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-2 text-base font-bold tracking-[-0.02em] text-[#18231d]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#627067]">{item.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="kalpa-v1-luxe-card kalpa-v1-reveal order-1 flex flex-col overflow-hidden rounded-[28px] border border-[#d6c296] bg-[#fffaf0] shadow-[0_26px_64px_rgba(83,64,31,0.15)] lg:order-1">
                  <div className="order-2 bg-[linear-gradient(145deg,#173226_0%,#102319_100%)] px-5 py-5 text-[#fff7e5] sm:px-6 lg:order-1 lg:min-h-[12rem] lg:py-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e5c27f]">
                      Live Site Images
                    </p>
                    <h3 className="mt-3 text-[1.65rem] font-bold leading-tight md:text-[1.75rem]">{activeSitePhoto.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-white/72 md:text-base md:leading-7">{activeSitePhoto.detail}</p>
                  </div>
                  <div className="order-1 relative bg-[radial-gradient(circle_at_24%_18%,rgba(215,177,111,0.24),transparent_28%),linear-gradient(145deg,#fff8e9_0%,#efe0c6_100%)] p-3 sm:p-4 lg:order-2 lg:min-h-[17rem] lg:flex-1 lg:p-5">
                    <div className="relative min-h-[13.5rem] overflow-hidden rounded-[22px] bg-white/[0.64] shadow-[0_18px_42px_rgba(83,64,31,0.14)] ring-1 ring-[#cfa968]/32 lg:h-full lg:min-h-[13rem]">
                      <img
                        key={activeSitePhoto.title}
                        src={activeSitePhoto.image}
                        alt={activeSitePhoto.alt || activeSitePhoto.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full min-h-[13.5rem] w-full object-cover transition-transform duration-700 hover:scale-[1.025] lg:min-h-[13rem]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(16,35,25,0)_42%,rgba(16,35,25,0.26)_100%)]" />
                      <div className="absolute left-3 top-3 rounded-full border border-white/40 bg-[#102319]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fff7e5] backdrop-blur-sm">
                        {String(sitePhotoIndex + 1).padStart(2, '0')} / {sitePhotoPlaceholders.length}
                      </div>
                    </div>
                  </div>
                  <div className="order-3 flex items-center justify-center gap-3 border-t border-[#eadfcb] px-5 py-3">
                    <div className="flex gap-1.5">
                      {sitePhotoPlaceholders.map((item, index) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setSitePhotoIndex(index)}
                          aria-label={`Show ${item.label} live site photo`}
                          className={`h-1.5 rounded-full transition-all ${sitePhotoIndex === index ? 'w-7 bg-[#cba159]' : 'w-1.5 bg-[#cdbb98]'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Conversion-first project snapshot */}
        <section className="relative overflow-hidden border-t border-[#ecdfc7] bg-[radial-gradient(circle_at_10%_10%,rgba(214,177,108,0.16),transparent_24%),linear-gradient(180deg,#fbf6ec_0%,#f1e4cf_100%)] py-12 md:py-16">
          <div className="pointer-events-none absolute -right-24 top-12 h-64 w-64 rounded-full bg-[#d7b16f]/16 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-white/36 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr] lg:items-end">
              <div>
                <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm">
                  Buyer Essentials
                </div>
                <h2 className="mt-4 max-w-2xl text-[2rem] font-bold leading-[1.04] tracking-[-0.035em] text-[#18231d] md:text-[2.8rem]">
                  Project facts, clearly laid out
                </h2>
              </div>
              <p className="max-w-2xl text-[0.98rem] leading-7 text-[#5f6a62] lg:justify-self-end">
                Pricing, approval, sizing, and location are grouped into one calm decision panel before a buyer books a visit.
              </p>
            </div>

            <div className="kalpa-v1-luxe-card mt-8 overflow-hidden rounded-[34px] border border-[#e3d4b8] bg-white/[0.78] p-3 shadow-[0_24px_58px_rgba(83,64,31,0.11)] backdrop-blur-xl md:p-4 lg:p-5">
              <div className="grid gap-3 lg:grid-cols-[0.78fr,1.22fr] lg:gap-4">
                <div className="kalpa-v1-reveal-left flex min-h-[19rem] flex-col justify-between rounded-[28px] bg-[radial-gradient(circle_at_top_right,rgba(215,177,111,0.3),transparent_34%),linear-gradient(145deg,#17251c_0%,#0c1711_100%)] p-5 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)] md:p-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e5c98d]">
                      {primaryProjectSnapshotStat?.label || 'Price From'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                      <span className="kalpa-v1-number-pop text-[2.25rem] font-bold leading-none tracking-[-0.045em] text-white md:text-[2.85rem]">
                        {primaryProjectSnapshotStat?.value}
                      </span>
                    </div>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-white/[0.72]">
                      {primaryProjectSnapshotStat?.detail}
                    </p>
                  </div>

                  <div className="mt-7">
                    <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-sm text-white/[0.74]">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/[0.42]">Plots</p>
                        <p className="mt-1 font-semibold text-white">
                          <AnimatedNumber value={KALPAVRUKSHA_TRUTH.totalPlots} className="kalpa-v1-number-pop" />
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/[0.42]">Possession</p>
                        <p className="mt-1 font-semibold text-white">{KALPAVRUKSHA_TRUTH.possession}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      <CTAButton
                        icon={<MapPin className="w-5 h-5" />}
                        text="Book Site Visit"
                        primary
                        onClick={() => openVisitModal('snapshot_section')}
                        className="w-full !min-h-[3.05rem] !px-4 !py-2.5"
                      />
                      <CTAButton
                        icon={<FileText className="w-5 h-5" />}
                        text="Location & Project Details"
                        onClick={() => scrollToBrochureMapForm('snapshot_price_location_cta')}
                        className="w-full !min-h-[3.05rem] !border-white/[0.16] !bg-white/[0.10] !px-4 !py-2.5 !text-white hover:!bg-white/[0.16] hover:!text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {supportingProjectSnapshotStats.map((item, index) => (
                    <div
                      key={item.label}
                      className="kalpa-v1-luxe-card kalpa-v1-reveal-scale min-h-[10.25rem] rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#fbf5eb_100%)] p-4 shadow-[0_14px_30px_rgba(83,64,31,0.065)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8b46c]/65 hover:shadow-[0_22px_46px_rgba(83,64,31,0.1)] md:p-5"
                      style={{ '--kalpa-reveal-delay': `${index * 70}ms` }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8d71]">
                        {item.label}
                      </p>
                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                        {Number.isFinite(Number(item.value)) && !String(item.value).includes('-') ? (
                          <AnimatedNumber
                            value={item.value}
                            decimals={String(item.value).includes('.') ? 2 : 0}
                            className="kalpa-v1-number-pop break-words text-[1.45rem] font-bold leading-tight tracking-[-0.03em] text-[#18231d] md:text-[1.72rem]"
                            style={{ '--kalpa-reveal-delay': `${120 + index * 70}ms` }}
                          />
                        ) : (
                          <span className="kalpa-v1-number-pop break-words text-[1.45rem] font-bold leading-tight tracking-[-0.03em] text-[#18231d] md:text-[1.72rem]" style={{ '--kalpa-reveal-delay': `${120 + index * 70}ms` }}>
                            {item.value}
                          </span>
                        )}
                        {item.unit && <span className="text-sm font-semibold text-[#8b6328]">{item.unit}</span>}
                      </div>
                      {item.detail && (
                        <p className="mt-3 max-w-sm text-sm leading-6 text-[#627067]">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="kalpa-v1-luxe-card kalpa-v1-reveal-scale mt-3 rounded-[28px] border border-[#eadfcb] bg-[linear-gradient(135deg,#fffdf8_0%,#f4ead7_100%)] p-4 shadow-[0_16px_38px_rgba(83,64,31,0.075)] md:p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b6328]">
                      Decision Shortcut
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[#18231d] md:text-2xl">
                      See the layout, then visit the exact site.
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#627067]">
                      The cleanest buyer flow is simple: check the layout document, then book a slot only if the essentials match.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[24rem]">
                    <CTAButton
                      icon={<Download className="w-4 h-4" />}
                      text="Download Layout"
                      onClick={() => openDownloadLeadModal('layout', 'snapshot_decision_layout')}
                      className="w-full !min-h-[3rem] !px-4 !py-2.5"
                    />
                    <CTAButton
                      icon={<MapPin className="w-4 h-4" />}
                      text="Book Visit"
                      primary
                      onClick={() => openVisitModal('snapshot_decision_visit')}
                      className="w-full !min-h-[3rem] !px-4 !py-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Video Walkthrough */}
        <section
          className="relative overflow-hidden border-t border-[#e7dbc2] bg-[radial-gradient(circle_at_top_left,rgba(214,189,130,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(214,189,130,0.08),transparent_28%),linear-gradient(180deg,#fdf8ef_0%,#f2e7d7_100%)] py-14 md:py-20"
          style={DEFERRED_SECTION_STYLE}
        >
          <div className="pointer-events-none absolute -left-16 top-12 h-72 w-72 rounded-full bg-[#ead8b1]/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#f0e2c6]/24 blur-3xl" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm backdrop-blur">
                Walkthrough
              </div>
              <h2 className="mt-5 text-[1.9rem] font-bold leading-[1.08] tracking-[-0.03em] text-[#18231d] md:text-[2.85rem]">
                A Glimpse of What <span className="text-[#8b6328]">Belonging</span> Looks Like
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#637067] md:text-[1.05rem]">
                Let Kalpavruksha reveal itself in motion, in flow, and in feeling before you ever visit the site.
              </p>
            </div>

            <div className="kalpa-v1-luxe-card mt-9 overflow-hidden rounded-[30px] border border-[#e3d6bd] bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(248,240,226,0.96)_100%)] p-3 shadow-[0_22px_54px_rgba(83,64,31,0.09)] backdrop-blur-xl md:p-4">
              <div className="relative aspect-video overflow-hidden rounded-[24px] bg-[#f5ecdd] ring-1 ring-[#eadcc1]">
                <YouTubeLiteEmbed
                  videoId="mt-G29uakpQ"
                  title="Project Walkthrough Video"
                  description="Experience Kalpavruksha before you visit"
                  posterSrc={KALPAVRUKSHA_WALKTHROUGH_BROCHURE_COVER}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Project Renderings Gallery */}
        <section
          ref={galleryRef}
          id="gallery"
          className="relative overflow-hidden border-t border-[#ece1cb] bg-[radial-gradient(circle_at_12%_0%,rgba(214,177,111,0.14),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(255,255,255,0.72),transparent_24%),linear-gradient(180deg,#fffcf5_0%,#f0e3cf_100%)] py-14 md:py-20"
          style={DEFERRED_SECTION_STYLE}
        >
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#e7d2a7]/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-white/50 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm">
                Project Gallery
              </div>
              <h2 className="mt-5 text-[1.9rem] font-bold tracking-[-0.03em] text-[#18231d] md:text-[2.7rem]">
                Picture the Life That <span className="text-[#8b6328]">Awaits</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#637067] md:text-[1.05rem]">
                Every space is rendered with care, so visitors understand the atmosphere before the first walkthrough.
              </p>
            </div>

            <div className="mt-9 md:hidden">
              <button
                type="button"
                onClick={() => openModal(activeMobileGalleryImage)}
                className="kalpa-v1-luxe-card group w-full overflow-hidden rounded-[30px] border border-[#eadfcb] bg-white/[0.86] text-left shadow-[0_24px_58px_rgba(83,64,31,0.13)] backdrop-blur-sm transition-transform duration-300 active:scale-[0.992]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(180deg,#fbf7ef_0%,#f2e6ce_100%)]">
                  <img
                    key={activeMobileGalleryImage.title}
                    src={activeMobileGalleryImage.image}
                    alt={`${activeMobileGalleryImage.alt || activeMobileGalleryImage.title} mobile slideshow`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.035]"
                    style={getGalleryImageStyle(activeMobileGalleryImage)}
                  />
                  <div className="absolute left-5 right-5 top-5 h-1 overflow-hidden rounded-full bg-white/24">
                    <div
                      key={activeMobileGalleryImage.title}
                      className="kalpa-v1-gallery-progress h-full rounded-full bg-[#e5c27f]"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,16,12,0.02)_0%,rgba(10,16,12,0.05)_48%,rgba(10,16,12,0.52)_100%)]" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e8cc8f]">
                      Gallery {String(mobileGalleryIndex + 1).padStart(2, '0')} / {KALPAVRUKSHA_GALLERY_IMAGES.length}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.03em]">
                      {activeMobileGalleryImage.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/[0.82]">
                      Tap to view larger and slide through all render views.
                    </p>
                  </div>
                </div>
              </button>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5" aria-label="Project gallery slides">
                  {KALPAVRUKSHA_GALLERY_IMAGES.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      aria-label={`Show ${item.title}`}
                      onClick={() => setMobileGalleryIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        mobileGalleryIndex === index ? 'w-7 bg-[#cba159]' : 'w-1.5 bg-[#cdbb98]'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Show previous gallery slide"
                    onClick={() => setMobileGalleryIndex((current) => (
                      current <= 0 ? KALPAVRUKSHA_GALLERY_IMAGES.length - 1 : current - 1
                    ))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7ba82] bg-white text-[#8b6328] shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Show next gallery slide"
                    onClick={() => setMobileGalleryIndex((current) => (
                      current >= KALPAVRUKSHA_GALLERY_IMAGES.length - 1 ? 0 : current + 1
                    ))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7ba82] bg-white text-[#8b6328] shadow-sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-9 hidden md:block">
              <div className="mx-auto max-w-5xl">
                <button
                  type="button"
                  onClick={() => openModal(activeMobileGalleryImage)}
                  className="kalpa-v1-luxe-card kalpa-v1-reveal group w-full overflow-hidden rounded-[30px] border border-[#eadfcb] bg-white/[0.9] text-left shadow-[0_22px_54px_rgba(83,64,31,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d6b171] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7b16f]/22"
                >
                  <div className="grid lg:grid-cols-[1.18fr,0.82fr]">
                    <div className="relative h-[28rem] overflow-hidden bg-[linear-gradient(180deg,#fbf7ef_0%,#f2e6ce_100%)]">
                      <img
                        key={activeMobileGalleryImage.title}
                        src={activeMobileGalleryImage.image}
                        alt={activeMobileGalleryImage.alt || activeMobileGalleryImage.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                        style={getGalleryImageStyle(activeMobileGalleryImage)}
                      />
                      <div className="absolute left-6 right-6 top-6 h-1 overflow-hidden rounded-full bg-white/28">
                        <div key={activeMobileGalleryImage.title} className="kalpa-v1-gallery-progress h-full rounded-full bg-[#e5c27f]" />
                      </div>
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,16,12,0.05)_0%,rgba(10,16,12,0)_45%,rgba(10,16,12,0.28)_100%)]" />
                    </div>
                    <div className="flex flex-col justify-between p-6 lg:p-8">
                      <div>
                        <div className="inline-flex items-center rounded-full bg-[#fff7e8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] ring-1 ring-[#d7ba82]">
                          Render {String(mobileGalleryIndex + 1).padStart(2, '0')} / {KALPAVRUKSHA_GALLERY_IMAGES.length}
                        </div>
                        <h3 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#18231d]">
                          {activeMobileGalleryImage.title}
                        </h3>
                        <p className="mt-4 text-base leading-7 text-[#637067]">
                          A simple slideshow of planned lifestyle render views. Click to view the image larger.
                        </p>
                      </div>
                      <div className="mt-8 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          {KALPAVRUKSHA_GALLERY_IMAGES.map((item, index) => (
                            <span
                              key={item.title}
                              className={`h-2 rounded-full transition-all ${mobileGalleryIndex === index ? 'w-8 bg-[#cba159]' : 'w-2 bg-[#cdbb98]'}`}
                            />
                          ))}
                        </div>
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d7ba82] bg-white text-[#8b6328] shadow-sm transition-transform duration-300 group-hover:translate-x-0.5">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    aria-label="Show previous gallery slide"
                    onClick={() => setMobileGalleryIndex((current) => (
                      current <= 0 ? KALPAVRUKSHA_GALLERY_IMAGES.length - 1 : current - 1
                    ))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7ba82] bg-white text-[#8b6328] shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Show next gallery slide"
                    onClick={() => setMobileGalleryIndex((current) => (
                      current >= KALPAVRUKSHA_GALLERY_IMAGES.length - 1 ? 0 : current + 1
                    ))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7ba82] bg-white text-[#8b6328] shadow-sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mx-auto mt-5 grid max-w-3xl grid-cols-3 gap-3">
                  {KALPAVRUKSHA_GALLERY_IMAGES.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setMobileGalleryIndex(index)}
                      className={`overflow-hidden rounded-[18px] border bg-white shadow-sm transition-all duration-200 ${
                        mobileGalleryIndex === index ? 'border-[#cba159] ring-2 ring-[#cba159]/20' : 'border-[#eadfcb] opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`Show ${item.title}`}
                    >
                      <img
                        src={item.image}
                        alt={item.alt || item.title}
                        loading="lazy"
                        decoding="async"
                        className="h-20 w-full object-cover"
                        style={getGalleryImageStyle(item)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#080c09]/82 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
          >
            <div className="relative max-h-full w-full max-w-5xl">
              {/* Close button */}
              <button
                onClick={closeModal}
                aria-label="Close gallery image"
                className="absolute right-3 top-3 z-10 rounded-full border border-white/15 bg-black/45 p-2 text-white shadow-[0_12px_26px_rgba(0,0,0,0.28)] transition-all duration-200 hover:bg-black/65 sm:right-4 sm:top-4"
              >
                <X size={24} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousGalleryImage();
                }}
                aria-label="Show previous gallery image"
                className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-all duration-200 hover:bg-black/70 sm:left-4 sm:h-12 sm:w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextGalleryImage();
                }}
                aria-label="Show next gallery image"
                className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-all duration-200 hover:bg-black/70 sm:right-4 sm:h-12 sm:w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Large image */}
              <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[#111712] shadow-[0_34px_90px_rgba(0,0,0,0.38)]">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.alt || selectedImage.title}
                  className="max-h-[88vh] w-full object-contain"
                  onClick={(event) => event.stopPropagation()}
                />
                {selectedImage.maskEmbeddedLabel && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(247,239,224,0)_0%,rgba(247,239,224,0.58)_58%,rgba(247,239,224,0.74)_100%)] backdrop-blur-[2px] sm:h-24"
                  />
                )}
              </div>

              {/* Title */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="mx-auto inline-flex max-w-full items-center justify-center rounded-2xl border border-white/12 bg-black/55 px-4 py-2 text-base font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:text-xl">
                  {selectedImage.title}
                  {selectedImageIndex >= 0 && (
                    <span className="ml-3 text-sm font-medium text-white/75">
                      {selectedImageIndex + 1} / {KALPAVRUKSHA_GALLERY_IMAGES.length}
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </div>)}

        {/* Section 6: Community Details */}
        <div ref={masterPlanRef} />
        <section id="master-plan" className="border-t border-[#e3d2b4] bg-[linear-gradient(180deg,#fcf4e6_0%,#efdfc5_100%)] py-14 md:py-20" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm">
                Master Plan
              </div>
              <h2 className="mb-4 mt-5 text-[1.9rem] font-bold tracking-[-0.03em] text-[#18231d] md:text-[2.7rem]">
                A Community Drawn with <span className="text-[#8b6328]">Intention</span>
              </h2>
              <p className="text-base leading-7 text-[#647067] md:text-[1.05rem]">
                From plot sizes to pathways, everything at Kalpavruksha has been shaped
                to bring balance, beauty, and belonging.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.92fr,1.08fr] lg:gap-10">
              <div>
                <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                  Layout Overview
                </div>
                <h3 className="mt-4 text-[1.75rem] font-bold tracking-[-0.03em] text-[#18231d] md:text-[2.15rem]">
                  Project Snapshot
                </h3>
                <div className="mt-4 h-px w-24 bg-gradient-to-r from-[#d7b16f] via-[#c59a55]/45 to-transparent" />
                <p className="mt-5 max-w-xl text-[1rem] leading-7 text-[#647067]">
                  The layout is planned to feel practical on paper and comfortable on site, with balanced plot sizing, circulation, and day-to-day usability.
                </p>

                <div className="kalpa-v1-luxe-card mt-6 overflow-hidden rounded-[28px] border border-[#eadfcb] bg-white/[0.88] p-2 shadow-[0_16px_40px_rgba(83,64,31,0.075)] backdrop-blur-sm">
                  {visibleProjectSnapshotStats.map((item, index) => (
                    <div
                      key={item.label}
                      className={`kalpa-v1-reveal grid gap-3 rounded-[22px] px-4 py-4 transition-colors duration-300 hover:bg-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:px-5 ${
                        index > 0 ? 'border-t border-[#efe4d0]' : ''
                      }`}
                      style={{ '--kalpa-reveal-delay': `${index * 65}ms` }}
                    >
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8d71]">
                          {item.label}
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#627067]">
                          {item.detail}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-1.5 sm:justify-end sm:text-right">
                        {Number.isFinite(Number(item.value)) && !String(item.value).includes('-') ? (
                          <AnimatedNumber
                            value={item.value}
                            decimals={String(item.value).includes('.') ? 2 : 0}
                            className="kalpa-v1-number-pop text-[1.55rem] font-bold leading-tight tracking-[-0.035em] text-[#18231d] md:text-[1.8rem]"
                          />
                        ) : (
                          <span className="kalpa-v1-number-pop text-[1.55rem] font-bold leading-tight tracking-[-0.035em] text-[#18231d] md:text-[1.8rem]" style={{ '--kalpa-reveal-delay': `${100 + index * 65}ms` }}>
                            {item.value}
                          </span>
                        )}
                        {item.unit && <span className="text-sm font-semibold text-[#8b6328]">{item.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 max-w-xl space-y-3">
                  <CTAButton
                    icon={<Download className="w-5 h-5" />}
                    text="Download Layout PDF"
                    primary
                    onClick={() => openDownloadLeadModal('layout', 'master_plan_section')}
                  />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <CTAButton
                      icon={<MapPin className="w-5 h-5" />}
                      text="Book a Site Visit"
                      onClick={() => openVisitModal('master_plan_section')}
                    />
                    <CTAButton
                      icon={<MessageCircle className="w-5 h-5" />}
                      text="Start Live Chat"
                      onClick={() => launchKalpavrukshaLiveChat('master_plan_section')}
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="kalpa-v1-luxe-card rounded-[30px] border border-[#eadfcb] bg-white/[0.96] p-5 shadow-[0_20px_48px_rgba(83,64,31,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_58px_rgba(83,64,31,0.11)] md:p-6">
                  <h4 className="mb-3 flex items-center text-lg font-bold text-[#18231d]">
                    <MapPin className="mr-2 h-5 w-5 text-[#8b6328]" />
                    Master Plan Layout
                  </h4>
                  <p className="mb-5 text-sm leading-7 text-[#627067] md:text-base">
                    Every plot and pathway - drawn with care, not just to optimize space,
                    but to cultivate a lifestyle.
                  </p>

                  {/* Landscape aspect ratio for layout image */}
                  <div className="flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fbf7ef_0%,#f1e6d0_100%)] shadow-inner" onClick={() => setSelectedImage({ image: require('../assets/kalpavruksha/layout.webp'), title: 'Kalpavruksha Project Master Layout', alt: 'Kalpavruksha Project Master Layout - CRDA Approved Plots Map' })}>
                    <img
                      src={require('../assets/kalpavruksha/layout.webp')}
                      alt="Kalpavruksha Project Master Layout - CRDA Approved Plots Map"
                      className="kalpa-v1-image-lift h-full w-full rounded-[24px] object-contain transition-transform duration-500 hover:scale-[1.025]"
                      loading="lazy"
                      decoding="async"
                      style={{ maxHeight: '320px' }}
                    />
                  </div>
                  <p className="text-xs text-[#8f8a7c] mt-3">Click image to enlarge</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Location */}
        <div ref={locationRef} />
        <section id="location" className="border-t border-[#ebdfc6] bg-[linear-gradient(180deg,#fffbf4_0%,#f4ead9_100%)] py-14 md:py-20" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                Property Location
              </div>
              <h2 className="mt-5 text-[1.9rem] font-bold tracking-[-0.03em] text-[#18231d] md:text-[2.7rem]">
                Connected to Vijayawada. <br />
                <span className="text-[#8b6328]">Positioned for everyday convenience.</span>
              </h2>
              <p className="mt-4 text-base leading-7 text-[#647067] md:text-[1.05rem]">
                A project location that keeps daily access practical while preserving a quieter plotted community setting.
              </p>
            </div>

            <div className="kalpa-v1-luxe-card mt-9 overflow-hidden rounded-[30px] border border-[#eadfcb] bg-white/[0.96] shadow-[0_20px_52px_rgba(83,64,31,0.08)]">
              <div className="p-6 md:p-8 lg:p-10">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff8ee] text-[#8b6328] ring-1 ring-[#d7ba82]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#8d8778]">Property Location</p>
                    <h3 className="mt-1 text-2xl font-bold leading-tight text-[#18231d]">
                      {projectLocationTitle}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#627067]">
                      The project sits on a well-connected corridor near Vijayawada, with practical access to highway links, city infrastructure, and Amaravati-side growth zones.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b6328]">Address Summary</p>
                  <p className="mt-2 text-base font-semibold text-[#18231d]">
                    {projectLocationAddress}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={projectDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackKalpavrukshaDirectionsClick('location_section')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#cba159] to-[#d7b16f] px-5 py-3 text-sm font-semibold text-[#1d1609] shadow-sm transition-all duration-300 hover:from-[#d2a764] hover:to-[#ddb574] hover:shadow-md"
                  >
                    Get Directions
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => openVisitModal('location_section')}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9cfb9] bg-white px-5 py-3 text-sm font-semibold text-[#221c14] transition-all duration-300 hover:border-[#c5ab72] hover:bg-[#fffdf7] hover:shadow-sm"
                  >
                    <MapPin className="h-4 w-4" />
                    Book Site Visit
                  </button>
                </div>
              </div>
            </div>

            <div className="kalpa-v1-luxe-card mt-6 rounded-[28px] border border-[#eadfcb] bg-white/[0.96] p-5 shadow-[0_18px_42px_rgba(83,64,31,0.07)] md:p-6">
              <div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6328]">
                    Location Highlights
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-[#18231d]">
                    Key distance markers from the project
                  </h3>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {locationHighlights.map((item, index) => (
                  <div
                    key={item.title}
                    className="kalpa-v1-luxe-card kalpa-v1-reveal flex h-full items-start gap-4 rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d6b171] hover:bg-white hover:shadow-md"
                    style={{ '--kalpa-reveal-delay': `${index * 55}ms` }}
                  >
                    <div className="kalpa-v1-icon-breathe flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold leading-snug text-[#18231d]">{item.title}</h3>
                      {item.detail && (
                        <p className="mt-1 text-sm leading-relaxed text-[#627067]">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: FAQ */}
        <section className="relative overflow-hidden border-t border-[#e5d6b7] bg-[linear-gradient(180deg,#faf3e8_0%,#eee0c9_100%)] py-14 md:py-20" style={DEFERRED_SECTION_STYLE}>
          <div className="pointer-events-none absolute -right-16 top-16 h-72 w-72 rounded-full bg-[#ead8b1]/28 blur-3xl" />
          <div className="pointer-events-none absolute left-0 bottom-0 h-72 w-72 rounded-full bg-[#f0e2c6]/30 blur-3xl" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                Frequently Asked Questions
              </div>
              <h2 className="mt-5 text-[1.9rem] font-bold tracking-[-0.03em] text-[#18231d] md:text-[2.7rem]">
                Questions buyers usually ask before the first visit
              </h2>
              <p className="mt-4 text-base leading-7 text-[#647067]">
                Tap a question to view the answer. The section stays clean until someone wants the detail.
              </p>
            </div>

            <div className="mt-9 space-y-3">
              {faqDisplayItems.map((item, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={item.question}
                    className="kalpa-v1-luxe-card kalpa-v1-reveal overflow-hidden rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] shadow-[0_12px_26px_rgba(83,64,31,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d8b46c]/65 hover:shadow-[0_18px_36px_rgba(83,64,31,0.08)]"
                    style={{ '--kalpa-reveal-delay': `${index * 55}ms` }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-base md:text-lg font-semibold leading-snug text-[#18231d]">
                        {item.question}
                      </span>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfcb] bg-[#fffaf1] text-[#7d7a70] transition-transform duration-300 ${isOpen ? 'rotate-180 border-[#d6b171] bg-[#fbf5e8] text-[#8b6328]' : ''}`}>
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="border-t border-[#efe4cf] px-5 py-4 md:px-6">
                          <p className="max-w-3xl text-sm md:text-base leading-relaxed text-[#627067]">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 9: Site Visit & Brochure */}
        <section id="book" ref={brochureMapRef} className="relative overflow-hidden border-t border-[#e0cfa8] bg-[linear-gradient(180deg,#fff9ed_0%,#efe0c5_100%)] py-12 md:py-18" style={DEFERRED_SECTION_STYLE}>
          <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#d7b16f]/18 blur-3xl" />
          <div className="mx-auto max-w-[36rem] px-4 sm:px-6">
            <div className="kalpa-v1-luxe-card kalpa-v1-reveal overflow-hidden rounded-[30px] border border-[#d6c296] bg-[#fffaf0] shadow-[0_24px_62px_rgba(83,64,31,0.14)]">
              <div className="bg-[radial-gradient(circle_at_top_right,rgba(215,177,111,0.22),transparent_34%),linear-gradient(145deg,#173226_0%,#102319_100%)] px-5 py-8 text-center text-[#fff7e5] md:px-8">
                <h2 className="font-serif text-[1.65rem] font-bold leading-tight md:text-[2.15rem]">
                  Limited site visit slots this week
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/78 md:text-base">
                  We keep visit groups small so you get time to inspect the layout, roads and surroundings properly.
                </p>
                <button
                  type="button"
                  onClick={() => openVisitModal('limited_slots')}
                  className="mt-6 inline-flex min-h-[3.35rem] w-full items-center justify-center rounded-2xl bg-[#d9ad4f] px-5 text-base font-bold text-[#102319] shadow-[0_16px_34px_rgba(217,173,79,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e2bb69] active:translate-y-0"
                >
                  Book a Free Site Visit
                </button>
              </div>

              <div className="px-5 py-7 md:px-8 md:py-8">
                <h3 className="font-serif text-[1.45rem] font-bold leading-tight text-[#18231d] md:text-[1.8rem]">
                  Location & Project Details
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#647067] md:text-base">
                  Receive the location pin, project details, master plan and the latest site-visit assistance details.
                </p>
                <form id="location-details-form" onSubmit={(event) => submitLayoutLead(event, 'brochure')} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#18231d]">Your name</span>
                    <input
                      name="name"
                      ref={brochureMapNameInputRef}
                      value={layoutLeadForm.name}
                      onChange={handleLayoutLeadInput}
                      className="mt-2 min-h-[3.35rem] w-full rounded-2xl border border-[#d9c8a4] bg-white px-4 text-base font-medium text-[#18231d] outline-none transition focus:border-[#d7b16f] focus:ring-4 focus:ring-[#d7b16f]/18"
                      placeholder="Full name"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-[#18231d]">Phone number</span>
                    <input
                      name="phone"
                      value={layoutLeadForm.phone}
                      onChange={handleLayoutLeadInput}
                      className="mt-2 min-h-[3.35rem] w-full rounded-2xl border border-[#d9c8a4] bg-white px-4 text-base font-medium text-[#18231d] outline-none transition focus:border-[#d7b16f] focus:ring-4 focus:ring-[#d7b16f]/18"
                      inputMode="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </label>
                  <p className="rounded-2xl border border-[#d9c8a4] bg-white/72 px-4 py-3 text-sm leading-6 text-[#647067]">
                    We will send Kalpavruksha project details, price, location, and site visit updates on WhatsApp.
                  </p>
                  <button
                    type="submit"
                    disabled={downloadSubmitting}
                    className="inline-flex min-h-[3.4rem] w-full items-center justify-center rounded-2xl bg-[#d9ad4f] px-5 text-base font-bold text-[#102319] shadow-[0_16px_34px_rgba(217,173,79,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e2bb69] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {downloadSubmitting ? 'Submitting...' : 'Send Location & Project Details on WhatsApp'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Testimonials */}
        <section ref={reviewsRef} className="border-t border-[#e8dbc0] bg-[linear-gradient(180deg,#f9f2e7_0%,#efe0c9_100%)] py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-9 max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                Reviews & Trust
              </div>
              <h2 className="mb-4 mt-5 text-[1.9rem] font-bold tracking-[-0.03em] text-[#18231d] md:text-[2.7rem]">
                Voices That Speak for <span className="text-[#8b6328]">Kalpavruksha</span>
              </h2>
            </div>
            <div className="rounded-2xl text-center">
              <p className="mx-auto max-w-2xl text-base leading-7 text-[#627067] md:text-[1.05rem]">
                See what our customers are saying on <span className='font-semibold text-[#8b6328]'>Google</span> Reviews
              </p>
              <div className="kalpa-v1-reveal mt-7 min-h-[11rem] rounded-[28px] border border-[#e5dcc8] bg-white/[0.92] p-4 shadow-[0_20px_48px_rgba(83,64,31,0.08)] md:p-6">
                {shouldRenderReviews ? (
                  <Suspense fallback={<div className="h-24 rounded-2xl bg-[#f4efe4]" />}>
                    <ReviewsSection />
                  </Suspense>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-2xl bg-[#f4efe4] px-4 text-center text-sm text-[#627067]">
                    Google reviews are preparing as you approach this section.
                  </div>
                )}
              </div>
              <div className="mx-auto mt-8 max-w-6xl text-left">
                  <div className="kalpa-v1-luxe-card kalpa-v1-reveal rounded-[32px] border border-[#eadfcb] bg-[radial-gradient(circle_at_top_left,rgba(215,177,111,0.14),transparent_26%),linear-gradient(135deg,#fffdfa_0%,#f5eee2_58%,#efe0c7_100%)] p-5 shadow-[0_22px_54px_rgba(83,64,31,0.1)] md:p-7">
                    <div className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr] lg:items-center">
                      <div>
                        <div className="mb-4 inline-flex items-center rounded-full border border-[#d7ba82] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b6328]">
                          Buyer Decision Guide
                        </div>
                        <div className="mb-5 h-px w-24 bg-gradient-to-r from-[#d7b16f] via-[#c59a55]/35 to-transparent" />
                        <h3 className="mb-4 text-[1.7rem] font-bold leading-tight tracking-[-0.03em] text-[#18231d] md:text-[2.25rem]">
                          Why Kalpavruksha Is a Preferred Choice for Plot Buyers
                        </h3>
                        <p className="max-w-xl text-sm leading-7 text-[#5f6a62] md:text-base">
                          Plot buyers usually evaluate three things first: legal clarity, daily convenience, and on-ground readiness.
                          Kalpavruksha performs strongly on all three.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <CTAButton
                            icon={<FileText className="w-4 h-4" />}
                            text="Location & Project Details"
                            onClick={() => scrollToBrochureMapForm('buyer_guide_brochure')}
                            className="!min-h-[3rem] !px-4 !py-2.5"
                          />
                          <CTAButton
                            icon={<MapPin className="w-4 h-4" />}
                            text="Plan Site Visit"
                            primary
                            onClick={() => openVisitModal('buyer_guide_visit')}
                            className="!min-h-[3rem] !px-4 !py-2.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {[
                          ['01', 'Clear Approvals', 'CRDA approvals, boundaries, and registration details are easier to verify.'],
                          ['02', 'Practical Location', 'The site connects well to Vijayawada, Amaravati corridors, and major roads.'],
                          ['03', 'Visible Infrastructure', 'Roads, utilities, and drainage planning are visible during site inspection.'],
                        ].map(([step, title, detail], index) => (
                          <div
                            key={title}
                            className="kalpa-v1-luxe-card kalpa-v1-reveal grid gap-3 rounded-[24px] border border-[#eadfcb] bg-white/[0.88] p-4 shadow-[0_14px_30px_rgba(83,64,31,0.065)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d8b46c]/65 hover:bg-white md:grid-cols-[auto_1fr]"
                            style={{ '--kalpa-reveal-delay': `${index * 80}ms` }}
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff5df] text-xs font-bold text-[#8b6328] ring-1 ring-[#dcc18a]">
                              {step}
                            </span>
                            <div>
                              <h4 className="font-semibold text-[#18231d]">{title}</h4>
                              <p className="mt-1 text-sm leading-relaxed text-[#627067]">{detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {!isModalOpen && !selectedImage && (
          <div className="fixed bottom-0 left-1/2 z-[85] w-full max-w-[560px] -translate-x-1/2 rounded-t-[16px] border border-[#d7ba82]/45 bg-[#fff7e8] px-3 pb-[calc(env(safe-area-inset-bottom)+0.38rem)] pt-2 shadow-[0_-14px_34px_rgba(83,64,31,0.16)] md:hidden">
            <div className="grid grid-cols-[2.75rem_2.75rem_minmax(0,1fr)] items-center gap-2">
              <a
                href={KALPAVRUKSHA_CALL_URL}
                onClick={() => trackKalpavrukshaCallClick('mobile_sticky_call')}
                aria-label="Call Easy Homes"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] border border-[#d7ba82] bg-white text-[#173226] shadow-[0_8px_18px_rgba(83,64,31,0.09)] transition-all duration-200 active:scale-95"
              >
                <Phone className="h-5 w-5" />
              </a>

              <button
                type="button"
                onClick={() => openKalpavrukshaWhatsApp('mobile_sticky_whatsapp')}
                aria-label="Open WhatsApp chat from sticky footer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] border border-[#d7ba82] bg-white text-[#173226] shadow-[0_8px_18px_rgba(83,64,31,0.09)] transition-all duration-200 active:scale-95"
              >
                <FaWhatsapp className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => openVisitModal('mobile_sticky_book_visit')}
                className="inline-flex h-11 items-center justify-center rounded-[15px] bg-[#cba159] px-4 text-sm font-bold text-[#102319] shadow-[0_10px_24px_rgba(203,161,89,0.24)] transition-all duration-200 active:scale-95"
              >
                Book Site Visit
              </button>
            </div>
          </div>
        )}

        {shouldShowFloatingActions && (
          <div
            className="pointer-events-none fixed bottom-5 right-4 z-40 hidden transition-all duration-300 md:block"
            aria-hidden={!shouldShowFloatingActions}
          >
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToBrochureMapForm('floating_brochure_icon')}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d7ba82] bg-[linear-gradient(180deg,#fffefb_0%,#f4ead8_100%)] text-[#8b6328] shadow-[0_20px_42px_rgba(83,64,31,0.16)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b16f]/24"
                aria-label="Go to location and project details form"
                title="Go to location and project details form"
              >
                <FileText className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => openKalpavrukshaWhatsApp('floating_whatsapp_icon')}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d7ba82] bg-[linear-gradient(180deg,#fffefb_0%,#f4ead8_100%)] text-[#8b6328] shadow-[0_20px_42px_rgba(83,64,31,0.16)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b16f]/24"
                aria-label="Open WhatsApp chat"
                title="Open WhatsApp chat"
              >
                <FaWhatsapp className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => launchKalpavrukshaLiveChat('floating_chat_icon')}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d7ba82] bg-[linear-gradient(180deg,#fffefb_0%,#f4ead8_100%)] text-[#8b6328] shadow-[0_20px_42px_rgba(83,64,31,0.16)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b16f]/24"
                aria-label="Open live chat"
                title="Open live chat"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          ref={footerRef}
          className="bg-[radial-gradient(circle_at_top_left,rgba(213,177,110,0.16),transparent_24%),linear-gradient(180deg,#132018_0%,#0c1410_100%)] pb-24 pt-16 text-white lg:pb-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.05fr,0.72fr,0.9fr,1fr]">
              <div>
                <div className="mb-5 flex items-center">
                  <TreePine className="w-8 h-8 text-[#e3cb98]" />
                  <span className="ml-2 text-xl font-bold">Kalpavruksha</span>
                </div>
                <p className="max-w-sm leading-7 text-white/[0.74]">
                  by Easy Homes - Creating communities where hearts belong
                </p>
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/[0.62]">
                  4th Floor, adjacent to GIG International School,<br />
                  Gollapudi, Vijayawada, Andhra Pradesh 521225
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-[#e9d6ad]">Quick Links</h4>
                <ul className="space-y-3 text-white/[0.78]">
                  <li><button onClick={scrollToAbout} className="footer-slide-link bg-transparent border-none outline-none p-0 transition-colors duration-200 hover:text-white">About Project</button></li>
                  <li><button onClick={scrollToLocation} className="footer-slide-link bg-transparent border-none outline-none p-0 transition-colors duration-200 hover:text-white">Location</button></li>
                  <li><button onClick={scrollToAmenities} className="footer-slide-link bg-transparent border-none outline-none p-0 transition-colors duration-200 hover:text-white">Amenities</button></li>
                  <li><button onClick={scrollToGallery} className="footer-slide-link bg-transparent border-none outline-none p-0 transition-colors duration-200 hover:text-white">Gallery</button></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-semibold text-[#e9d6ad]">Contact</h4>
                <p className="mb-5 max-w-xs text-sm leading-6 text-white/[0.66]">
                  Speak with the Easy Homes team for pricing, plot availability, and directions.
                </p>
                <div className="flex flex-col gap-3">
                  <CTAButton
                    href={KALPAVRUKSHA_CALL_URL}
                    onClick={() => trackKalpavrukshaCallClick('footer_contact_call')}
                    icon={<Phone className="w-4 h-4" />}
                    text="Call Now"
                    className="w-full !border-white/[0.14] !bg-white/[0.10] !text-white hover:!bg-white/[0.14] hover:!text-white"
                  />
                  <CTAButton
                    onClick={() => openKalpavrukshaWhatsApp('footer_contact_whatsapp')}
                    icon={<FaWhatsapp className="w-4 h-4" />}
                    text="WhatsApp"
                    className="w-full !border-white/[0.14] !bg-white/[0.10] !text-white hover:!bg-white/[0.14] hover:!text-white"
                  />
                  <CTAButton
                    icon={<MessageCircle className="w-4 h-4" />}
                    text="Live Chat"
                    onClick={() => launchKalpavrukshaLiveChat('footer_contact_chat')}
                    className="w-full !border-white/[0.14] !bg-white/[0.10] !text-white hover:!bg-white/[0.14] hover:!text-white"
                  />
                </div>
              </div>

              <div className="rounded-[30px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.05)_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-[#e9d6ad]">Book Site Visit</h4>
                <p className="mt-3 text-sm leading-6 text-white/[0.68]">
                  Choose an available visit slot and share pickup details only if transport is needed.
                </p>
                <CTAButton
                  icon={<MapPin className="w-4 h-4" />}
                  text="Book Site Visit"
                  onClick={() => openVisitModal('footer_book_site_visit')}
                  primary
                  className="mt-5 w-full"
                />
                <button
                  type="button"
                  onClick={() => scrollToBrochureMapForm('footer_current_price_cta')}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] px-5 py-3 text-sm font-semibold text-white/[0.82] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  <span>Location & Project Details</span>
                </button>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-8 text-center text-white/[0.62]">
              <p>&copy; 2025 Kalpavruksha by Easy Homes. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default KalpavrukshaPage;
