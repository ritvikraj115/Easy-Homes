import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Download,
  Droplets,
  FileCheck,
  Landmark,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Route,
  Shield,
  Trees,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../api';
import ZohoSalesIQWidgetLoader, { openZohoSalesIQChat } from '../components/ZohoSalesIQWidgetLoader';
import {
  trackEvent,
  trackFileDownload,
  trackGenerateLead,
  trackPageView,
  trackScheduleVisit,
  trackWhatsAppClick,
} from '../utils/analytics';
import { captureGoogleAdsAttribution, getGoogleAdsAttributionPayload } from '../utils/googleAdsAttribution';
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
} from '../assets/kalpavrukshaHeroAssets';

const preloadReviewsSection = () => import('../components/ReviewProject');
const ReviewsSection = React.lazy(preloadReviewsSection);

const LANDING_VARIANT = 'B';
const LANDING_VERSION = 'v2';
const HERO_IMAGE_SIZES = '100vw';
const SITE_VISIT_ZOHO_NOTE = 'Site visit scheduled from website.';
const BROCHURE_ASSET = {
  url: '/mainBrouche.pdf',
  fileName: 'Kalpavruksha Project Brochure.pdf',
  leadStatus: 'Downloaded Brochure',
  source: 'Website',
};
const LAYOUT_ASSET = {
  url: '/Kalpavruksha Master Layout.pdf',
  fileName: 'Kalpavruksha Master Layout.pdf',
  source: 'Website',
};

const PROJECT = {
  name: 'Kalpavruksha',
  subtitle: 'Premium residential open plots near Vijayawada',
  location: 'Near Vijayawada-Nagpur Greenfield Highway, Vemavaram',
  locationShort: 'Near Vijayawada',
  priceFrom: 'Rs. 30 Lakhs',
  priceRange: 'Rs. 30-35 Lakhs',
  plotSizes: '174-525',
  plotSizeUnit: 'Sq.yd.',
  projectArea: '9.03 Acres',
  totalPlots: '105',
  bookedPlots: '17',
  reraId: 'P06160035909',
  possession: 'September 2026',
  configuration: 'Residential plots',
};
const FOUNDER_MESSAGE = '';

const CALL_URL = 'tel:+918988896666';
const WHATSAPP_NUMBER = '918019298488';
const DIRECTIONS_URL = 'https://maps.app.goo.gl/dNA1KdiDNuLjTthG8';
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

const VISIT_INTEREST_OPTIONS = ['Book Visit', 'Current Price', 'Available Plots'];
const DEFAULT_SITE_VISIT_FORM = {
  name: '',
  phone: '',
  email: '',
  interest: VISIT_INTEREST_OPTIONS[0],
  preferredDate: '',
  preferredTime: '',
  transportRequired: 'No',
  pickupAddress: '',
};
const DEFAULT_BROCHURE_FORM = {
  name: '',
  phone: '',
  email: '',
};

const galleryImages = [
  {
    title: 'Entrance',
    label: 'Entrance',
    image: require('../assets/kalpavruksha/Entry-000.webp'),
    alt: 'Kalpavruksha grand entrance for the CRDA approved plotted community in Vijayawada',
  },
  {
    title: 'Amenities',
    label: 'Amenities',
    image: require('../assets/kalpavruksha/club house.webp'),
    alt: 'Kalpavruksha clubhouse and lifestyle amenities',
  },
  {
    title: 'Landscape',
    label: 'Gardens',
    image: require('../assets/kalpavruksha/contour garden.webp'),
    alt: 'Kalpavruksha contour garden with landscaped pathways',
  },
  {
    title: 'Arrival Court',
    label: 'Arrival',
    image: require('../assets/kalpavruksha/arrival court.webp'),
    alt: 'Kalpavruksha arrival court inside the gated layout',
  },
  {
    title: 'Water Feature',
    label: 'Lifestyle',
    image: require('../assets/kalpavruksha/lotus pond 2.webp'),
    alt: 'Kalpavruksha lotus pond and landscaped water feature',
  },
  {
    title: 'Seating Area',
    label: 'Community',
    image: require('../assets/kalpavruksha/seating area.webp'),
    alt: 'Kalpavruksha community seating area near gardens',
  },
];

const heroSlides = [
  {
    id: 'overview',
    label: 'Overview',
    eyebrow: 'CRDA-approved open plots in Vijayawada',
    title: "Where You Don't Just Arrive - You Belong",
    image: KALPAVRUKSHA_OVERVIEW_HERO_IMAGE,
    imageSrcSet: KALPAVRUKSHA_OVERVIEW_HERO_SRC_SET,
    alt: 'Kalpavruksha plotted community overview',
  },
  {
    id: 'trust',
    label: 'Trust',
    eyebrow: 'Approval clarity',
    title: 'Trust begins with clarity',
    image: KALPAVRUKSHA_TRUST_HERO_IMAGE,
    imageSrcSet: KALPAVRUKSHA_TRUST_HERO_SRC_SET,
    alt: 'Interlocking wooden beams representing trust, stability, and structure',
  },
  {
    id: 'space',
    label: 'Calm',
    eyebrow: 'Roads and utilities',
    title: 'Calm starts with space',
    image: KALPAVRUKSHA_CALM_HERO_IMAGE,
    imageSrcSet: KALPAVRUKSHA_CALM_HERO_SRC_SET,
    alt: 'Soft misty hills and layered gradients expressing calm and ease',
  },
  {
    id: 'landscape',
    label: 'Peace',
    eyebrow: 'Landscape planning',
    title: 'Peace comes from green edges',
    image: KALPAVRUKSHA_PEACE_HERO_IMAGE,
    imageSrcSet: KALPAVRUKSHA_PEACE_HERO_SRC_SET,
    alt: 'Concentric sand circles and stones representing peace and stillness',
  },
  {
    id: 'care',
    label: 'Care',
    eyebrow: 'Long-term infrastructure',
    title: 'Care shows in what lasts',
    image: KALPAVRUKSHA_CARE_HERO_IMAGE,
    imageSrcSet: KALPAVRUKSHA_CARE_HERO_SRC_SET,
    alt: 'Soft luminous flowing forms representing care, continuity, and attention',
  },
];

const trustItems = [
  { icon: <Shield className="h-4 w-4" />, label: 'CRDA Approved' },
  { icon: <FileCheck className="h-4 w-4" />, label: 'RERA Approved' },
  { icon: <CheckCircle className="h-4 w-4" />, label: 'Clear Title' },
  { icon: <Trees className="h-4 w-4" />, label: PROJECT.projectArea },
  { icon: <Building className="h-4 w-4" />, label: `${PROJECT.totalPlots} Premium Plots` },
];

const snapshotCards = [
  {
    label: 'Price From',
    value: PROJECT.priceFrom,
    detail: `FAQ range: ${PROJECT.priceRange}`,
    icon: <Landmark className="h-5 w-5" />,
  },
  {
    label: 'Plot Sizes',
    value: PROJECT.plotSizes,
    unit: PROJECT.plotSizeUnit,
    detail: 'Residential plot-size range.',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    label: 'Location',
    value: PROJECT.locationShort,
    detail: PROJECT.location,
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    label: 'Project Area',
    value: PROJECT.projectArea,
    detail: `${PROJECT.totalPlots} residential plot units in the project plan.`,
    icon: <Trees className="h-5 w-5" />,
  },
];

const availabilityCards = [
  {
    label: 'Booked So Far',
    value: `${PROJECT.bookedPlots} plots`,
    detail: 'Booking progress is shown transparently from available project data.',
  },
  {
    label: 'Possession',
    value: PROJECT.possession,
    detail: 'Timeline shown in the project FAQ.',
  },
  {
    label: 'Price Clarity',
    value: PROJECT.priceRange,
    detail: 'Final pricing can vary by plot size, facing, and location in the layout.',
  },
];

const locationChips = [
  { label: '7.5 km', detail: 'Vijayawada' },
  { label: '5 km', detail: 'Western Bypass' },
  { label: 'NH 65', detail: 'Hyderabad Highway access' },
  { label: '13.5 km', detail: 'Amaravati Start-up Village & BITS' },
  { label: '14 km', detail: 'Vijayawada Railway Station' },
  { label: '15 km', detail: 'Vijayawada Bus Stand' },
];

const amenities = [
  { icon: <Route className="h-5 w-5" />, title: "60', 40' and 33' roads", detail: 'Internal CC roads with planned circulation.' },
  { icon: <Zap className="h-5 w-5" />, title: 'Underground utilities', detail: 'Power, water, fiber and sewage networks.' },
  { icon: <Droplets className="h-5 w-5" />, title: 'Water systems', detail: 'Overhead tank, underground supply and drainage planning.' },
  { icon: <Users className="h-5 w-5" />, title: 'Community amenities', detail: 'Clubhouse, gym, party lawn and play areas.' },
  { icon: <Trees className="h-5 w-5" />, title: 'Landscape zones', detail: 'Rivulet garden, edge gardens and arrival court.' },
  { icon: <Shield className="h-5 w-5" />, title: 'Gated security', detail: "Compound wall, CCTV, gated entry and solar lighting." },
];

const faqs = [
  {
    question: 'Is Kalpavruksha a CRDA-approved project?',
    answer: 'Yes. Kalpavruksha is presented as a CRDA-approved plotted development by Easy Homes. Buyers should still review the latest approvals, layout documents, and registration details during the booking process.',
  },
  {
    question: 'What is the project size?',
    answer: 'The project spans 9.03 acres and is planned as a gated residential plotted community.',
  },
  {
    question: 'How many plots are available in Kalpavruksha?',
    answer: 'Kalpavruksha has 105 residential plot units in the current project overview.',
  },
  {
    question: 'What plot sizes are available?',
    answer: 'The current plot size range is 174 to 525 square yards, covering compact and larger residential plot requirements.',
  },
  {
    question: 'What is the price range?',
    answer: 'The plots are priced between Rs. 30-35 lakhs. Final pricing can vary by plot size, facing, and location within the layout.',
  },
  {
    question: 'What is the RERA ID?',
    answer: `The RERA ID shown for Kalpavruksha is ${PROJECT.reraId}. Buyers should verify the latest status from the official RERA portal before booking.`,
  },
  {
    question: 'When does possession start?',
    answer: `The project possession will start from ${PROJECT.possession}.`,
  },
];

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
  return {
    value: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    label: meridiem ? text : `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`,
  };
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

function getTrackingContext() {
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
}

function withTrackingContext(payload = {}) {
  return {
    ...getTrackingContext(),
    ...payload,
  };
}

function downloadFile(url, fileName) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function CtaButton({
  children,
  icon,
  variant = 'light',
  className = '',
  type = 'button',
  href,
  target,
  onClick,
}) {
  const baseClass = 'inline-flex min-h-[3.25rem] items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b56f37]/35';
  const variantClass = {
    gold: 'border border-[#b56f37] bg-[#b56f37] text-[#fff7e8] shadow-[0_16px_34px_rgba(181,111,55,0.28)] hover:bg-[#9e5f2e]',
    dark: 'border border-[#52684a]/30 bg-[#52684a] text-[#fff7e8] shadow-[0_14px_30px_rgba(82,104,74,0.24)] hover:bg-[#43573d]',
    light: 'border border-[#d5bd8f] bg-[#fff7e8] text-[#2b3428] shadow-[0_12px_28px_rgba(83,64,31,0.08)] hover:border-[#b56f37] hover:bg-[#f4e6cc]',
    ghost: 'border border-[#b56f37]/45 bg-[#f4e6cc]/55 text-[#2b3428] hover:bg-[#fff7e8]',
  }[variant];

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={`${baseClass} ${variantClass} ${className}`}
      >
        {icon}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${baseClass} ${variantClass} ${className}`}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

function SectionHeader({ eyebrow, title, description, align = 'center', tone = 'light' }) {
  const isCenter = align === 'center';
  const isDark = tone === 'dark';
  return (
    <div className={`kv2-reveal-target ${isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-sm ${
        isDark
          ? 'border-[#fff4db]/45 bg-[#fff4db]/18 text-[#fff7e8]'
          : 'border-[#b56f37]/35 bg-[#fff7e8]/75 text-[#8b5526]'
      }`}>
        {eyebrow}
      </div>
      <h2
        className={`kv2-display mt-4 text-[1.72rem] font-semibold uppercase leading-[1.12] tracking-[-0.018em] md:text-[2.35rem] lg:text-[2.55rem] ${isDark ? 'text-[#fff7e8]' : 'text-[#27382c]'}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-sm leading-7 md:text-base md:leading-8 ${isDark ? 'text-[#fff4db]/78' : 'text-[#5f684f]'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

function CountUpValue({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  duration = 1200,
}) {
  const nodeRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setHasStarted(true);
      return undefined;
    }

    const node = nodeRef.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasStarted(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return undefined;

    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(end);
      return undefined;
    }

    let animationFrameId;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - ((1 - progress) ** 3);
      setDisplayValue(end * eased);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [duration, end, hasStarted]);

  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayValue);

  const finalValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(end);

  return (
    <span ref={nodeRef} className={className} aria-label={`${prefix}${finalValue}${suffix}`}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

function ProjectMetricValue({ label, value, unit, className = '' }) {
  if (label === 'Price From') {
    return <CountUpValue end={30} prefix="Rs. " suffix=" Lakhs" className={className} />;
  }

  if (label === 'Plot Sizes') {
    return (
      <span className={className} aria-label={`${PROJECT.plotSizes} ${PROJECT.plotSizeUnit}`}>
        <CountUpValue end={174} />
        <span>-</span>
        <CountUpValue end={525} />
        <span> {PROJECT.plotSizeUnit}</span>
      </span>
    );
  }

  if (label === 'Project Area') {
    return <CountUpValue end={9.03} decimals={2} suffix=" Acres" className={className} />;
  }

  if (label === 'Total plots') {
    return <CountUpValue end={105} className={className} />;
  }

  return <span className={className}>{value} {unit || ''}</span>;
}

function AvailabilityMetricValue({ item, className = '' }) {
  if (item.label === 'Booked So Far') {
    return <CountUpValue end={17} suffix=" plots" className={className} />;
  }

  if (item.label === 'Price Clarity') {
    return (
      <span className={className} aria-label={PROJECT.priceRange}>
        Rs. <CountUpValue end={30} />-<CountUpValue end={35} /> Lakhs
      </span>
    );
  }

  return <span className={className}>{item.value}</span>;
}

function LocationMetricValue({ label, className = '' }) {
  if (label === 'NH 65') {
    return (
      <span className={className} aria-label="NH 65">
        NH <CountUpValue end={65} />
      </span>
    );
  }

  const match = /^([\d.]+)\s*km$/i.exec(label);
  if (match) {
    const numericValue = Number(match[1]);
    return (
      <CountUpValue
        end={numericValue}
        decimals={String(match[1]).includes('.') ? 1 : 0}
        suffix=" km"
        className={className}
      />
    );
  }

  return <span className={className}>{label}</span>;
}

export default function KalpavrukshaV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitStep, setVisitStep] = useState(1);
  const [visitSource, setVisitSource] = useState('lp_b');
  const [visitForm, setVisitForm] = useState(DEFAULT_SITE_VISIT_FORM);
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [brochureForm, setBrochureForm] = useState(DEFAULT_BROCHURE_FORM);
  const [brochureSubmitting, setBrochureSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [mobileGalleryIndex, setMobileGalleryIndex] = useState(0);
  const [isMobileGalleryInView, setIsMobileGalleryInView] = useState(false);
  const [stickyCtaVisible, setStickyCtaVisible] = useState(false);
  const [layoutPreviewOpen, setLayoutPreviewOpen] = useState(false);
  const [shouldRenderReviews, setShouldRenderReviews] = useState(false);

  const heroRef = useRef(null);
  const snapshotRef = useRef(null);
  const galleryRef = useRef(null);
  const galleryTrackRef = useRef(null);
  const planRef = useRef(null);
  const locationRef = useRef(null);
  const amenitiesRef = useRef(null);
  const reviewsRef = useRef(null);
  const faqRef = useRef(null);
  const finalCtaRef = useRef(null);
  const todayDate = new Date().toISOString().split('T')[0];

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4200);
  };

  const scrollToRef = (ref) => {
    if (!ref.current || typeof window === 'undefined') return;

    const headerOffset = window.innerWidth >= 1024 ? 92 : 84;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  };

  useEffect(() => {
    captureGoogleAdsAttribution();
    trackEvent('landing_variant_view', withTrackingContext({
      project: PROJECT.name,
      page_name: 'kalpavruksha_lp_b',
    }));

    const normalizedPath = location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
    if (normalizedPath === '/kalpavruksha2') {
      const pagePayload = withTrackingContext({
        page_path: location.pathname,
        page_location: typeof window !== 'undefined' ? window.location.href : undefined,
        page_title: typeof document !== 'undefined' ? document.title : undefined,
        page_name: 'kalpavruksha_lp_b',
        project: PROJECT.name,
        ab_test_name: 'kalpavruksha_landing_page',
      });

      trackPageView(pagePayload);
      trackEvent('kalpavruksha_ab_page_view', pagePayload);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.kv2-reveal-target, .kv2-card-lift, .kv2-image-card').forEach((node) => {
        node.classList.add('kv2-visible');
      });
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('kv2-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.16,
    });

    const revealNodes = document.querySelectorAll('.kv2-reveal-target, .kv2-card-lift, .kv2-image-card');
    revealNodes.forEach((node, index) => {
      node.style.setProperty('--kv2-delay', `${Math.min(index % 6, 5) * 70}ms`);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const galleryNode = galleryRef.current;
    if (!galleryNode || window.innerWidth >= 1024) {
      setIsMobileGalleryInView(false);
      return undefined;
    }

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsMobileGalleryInView(false);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsMobileGalleryInView(Boolean(entry?.isIntersecting));
    }, {
      rootMargin: '-12% 0px -38% 0px',
      threshold: 0.16,
    });

    observer.observe(galleryNode);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMobileGalleryInView) return undefined;

    const timerId = window.setInterval(() => {
      if (window.innerWidth >= 1024) return;
      setMobileGalleryIndex((current) => (current + 1) % galleryImages.length);
    }, 3400);

    return () => window.clearInterval(timerId);
  }, [isMobileGalleryInView]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024 || !isMobileGalleryInView) return;

    const galleryTrack = galleryTrackRef.current;
    const activeCard = galleryTrack?.children?.[mobileGalleryIndex];
    activeCard?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }, [isMobileGalleryInView, mobileGalleryIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

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
    const updateStickyCtaVisibility = () => {
      const isDesktop = window.innerWidth >= 1024;

      if (!isDesktop) {
        setStickyCtaVisible(true);
        return;
      }

      const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;
      setStickyCtaVisible(window.scrollY > Math.max(360, heroHeight - 120));
    };

    updateStickyCtaVisibility();
    window.addEventListener('scroll', updateStickyCtaVisibility, { passive: true });
    window.addEventListener('resize', updateStickyCtaVisibility);

    return () => {
      window.removeEventListener('scroll', updateStickyCtaVisibility);
      window.removeEventListener('resize', updateStickyCtaVisibility);
    };
  }, []);

  useEffect(() => {
    if (!visitModalOpen || !visitForm.preferredDate) {
      setAvailableSlots([]);
      setSlotsError('');
      setSlotsLoading(false);
      return undefined;
    }

    let isActive = true;
    setSlotsLoading(true);
    setSlotsError('');
    setAvailableSlots([]);
    setVisitForm((current) => (
      current.preferredTime ? { ...current, preferredTime: '' } : current
    ));

    api.get('/api/site-visits/available-slots', {
      params: { preferredDate: visitForm.preferredDate },
    }).then((response) => {
      if (!isActive) return;
      setAvailableSlots(normalizeVisitSlots(response.data?.slots));
    }).catch(() => {
      if (!isActive) return;
      setSlotsError('Available slots could not be loaded. Please try another date.');
    }).finally(() => {
      if (isActive) setSlotsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [visitForm.preferredDate, visitModalOpen]);

  const openVisitModal = (source = 'lp_b_site_visit') => {
    setVisitSource(source);
    setVisitStep(1);
    setVisitModalOpen(true);
    trackEvent('form_open', withTrackingContext({
      form_name: 'kalpavruksha_site_visit_form',
      lead_type: 'site_visit',
      project: PROJECT.name,
      source,
    }));
  };

  const closeVisitModal = () => {
    setVisitModalOpen(false);
    setVisitStep(1);
  };

  const openBrochureModal = (source = 'lp_b_brochure') => {
    setBrochureModalOpen(true);
    trackEvent('form_open', withTrackingContext({
      form_name: 'kalpavruksha_download_form',
      lead_type: 'brochure_download',
      project: PROJECT.name,
      source,
      asset_type: 'brochure',
    }));
  };

  const closeBrochureModal = () => {
    setBrochureModalOpen(false);
  };

  const handleVisitInput = (event) => {
    const { name, value } = event.target;
    setVisitForm((current) => ({ ...current, [name]: value }));
  };

  const handleBrochureInput = (event) => {
    const { name, value } = event.target;
    setBrochureForm((current) => ({ ...current, [name]: value }));
  };

  const trackCallClick = (placement) => {
    trackEvent('click_call', withTrackingContext({
      project: PROJECT.name,
      placement,
    }));
  };

  const openWhatsApp = (placement) => {
    const message = [
      `Hi Easy Homes, I want current price and available plots for ${PROJECT.name}.`,
      `Page: ${window.location.href}`,
    ].join('\n');
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    trackWhatsAppClick(withTrackingContext({
      project: PROJECT.name,
      placement,
      lead_type: 'whatsapp_price',
    }));
    trackEvent('click_whatsapp', withTrackingContext({
      project: PROJECT.name,
      placement,
      lead_type: 'whatsapp_price',
    }));
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const launchLiveChat = async (placement) => {
    trackEvent('live_chat_open', withTrackingContext({
      project: PROJECT.name,
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

    trackEvent('live_chat_unavailable', withTrackingContext({
      project: PROJECT.name,
      source: 'kalpavruksha',
      placement,
      provider: 'zoho_salesiq',
    }));
    showToast('Live chat is temporarily unavailable. Please try again.');
  };

  const downloadLayoutPdf = (placement) => {
    const trackingPayload = withTrackingContext({
      file_name: LAYOUT_ASSET.fileName,
      file_url: LAYOUT_ASSET.url,
      project: PROJECT.name,
      source: LAYOUT_ASSET.source,
      placement,
      asset_type: 'layout_pdf',
    });

    trackEvent('click_download_layout', trackingPayload);
    trackFileDownload(trackingPayload);
    downloadFile(LAYOUT_ASSET.url, LAYOUT_ASSET.fileName);
  };

  const submitVisit = async (event) => {
    event.preventDefault();
    const trimmedName = visitForm.name.trim();
    const trimmedPhone = visitForm.phone.trim();
    const selectedInterest = visitForm.interest || VISIT_INTEREST_OPTIONS[0];

    if (!trimmedName || !trimmedPhone || !selectedInterest) {
      showToast('Please enter name, phone, and what you are looking for.');
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      showToast('Please enter a valid 10-digit phone number.');
      return;
    }

    if (visitStep === 1) {
      trackEvent('visit_step_1_submit', withTrackingContext({
        form_name: 'kalpavruksha_site_visit_form',
        project: PROJECT.name,
        source: visitSource,
        interest: selectedInterest,
      }));
      setVisitStep(2);
      return;
    }

    const pickupRequired = visitForm.transportRequired === 'Yes';
    if (!visitForm.preferredDate || !visitForm.preferredTime || (pickupRequired && !visitForm.pickupAddress.trim())) {
      showToast(pickupRequired ? 'Please select date, time slot, and pickup address.' : 'Please select date and time slot.');
      return;
    }

    try {
      setVisitSubmitting(true);
      const googleAdsAttribution = getGoogleAdsAttributionPayload();
      const visitNotes = [
        SITE_VISIT_ZOHO_NOTE,
        `Interest: ${selectedInterest}`,
        `Landing Variant: ${LANDING_VARIANT}`,
        `Website Version: ${LANDING_VERSION}`,
      ].join('\n');

      await api.post('/api/site-visits', {
        project: PROJECT.name,
        name: trimmedName,
        phone: trimmedPhone,
        email: visitForm.email.trim() || undefined,
        interest: selectedInterest,
        preferredDate: `${visitForm.preferredDate}T${visitForm.preferredTime}`,
        transportRequired: visitForm.transportRequired,
        notes: visitNotes,
        platformSource: 'Website',
        platform_source: 'website',
        landingVariant: LANDING_VARIANT,
        landing_variant: LANDING_VARIANT,
        landingVersion: LANDING_VERSION,
        landing_version: LANDING_VERSION,
        version: LANDING_VERSION,
        pickupAddress: pickupRequired ? visitForm.pickupAddress.trim() : undefined,
        pickupMode: pickupRequired ? 'manual' : undefined,
        pickupLat: undefined,
        pickupLng: undefined,
        googleAdsAttribution: googleAdsAttribution || undefined,
      });

      const trackingPayload = withTrackingContext({
        form_name: 'kalpavruksha_site_visit_form',
        lead_type: 'site_visit',
        lead_status: 'Visit Scheduled',
        project: PROJECT.name,
        source: visitSource,
        interest: selectedInterest,
        transport_required: visitForm.transportRequired,
        pickup_mode: pickupRequired ? 'manual' : undefined,
        google_ads_attributed: googleAdsAttribution?.hasGoogleAdsClick || undefined,
        google_ads_click_id_type: googleAdsAttribution?.clickIdType,
        google_ads_campaign_id: googleAdsAttribution?.campaignId,
      });
      trackEvent('form_submit', trackingPayload);
      trackGenerateLead(trackingPayload);
      trackScheduleVisit(withTrackingContext({
        form_name: 'kalpavruksha_site_visit_form',
        lead_status: 'Visit Scheduled',
        project: PROJECT.name,
        source: visitSource,
        interest: selectedInterest,
        preferred_date: visitForm.preferredDate,
        preferred_time: visitForm.preferredTime,
        transport_required: visitForm.transportRequired,
      }));

      setVisitModalOpen(false);
      setVisitStep(1);
      setVisitForm(DEFAULT_SITE_VISIT_FORM);
      navigate('/thank-you');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setVisitSubmitting(false);
    }
  };

  const submitBrochure = async (event) => {
    event.preventDefault();
    const trimmedName = brochureForm.name.trim();
    const trimmedPhone = brochureForm.phone.trim();

    if (!trimmedName || !trimmedPhone) {
      showToast('Please enter your name and phone number to continue.');
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      showToast('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setBrochureSubmitting(true);
      const googleAdsAttribution = getGoogleAdsAttributionPayload();
      await api.post('/api/leads/layout-download', {
        project: PROJECT.name,
        source: BROCHURE_ASSET.source,
        platformSource: 'Website',
        platform_source: 'website',
        landingVariant: LANDING_VARIANT,
        landing_variant: LANDING_VARIANT,
        landingVersion: LANDING_VERSION,
        landing_version: LANDING_VERSION,
        version: LANDING_VERSION,
        leadStatus: BROCHURE_ASSET.leadStatus,
        name: trimmedName,
        phone: trimmedPhone,
        email: brochureForm.email.trim() || undefined,
        googleAdsAttribution: googleAdsAttribution || undefined,
      });

      const trackingPayload = withTrackingContext({
        form_name: 'kalpavruksha_download_form',
        lead_type: 'brochure_download',
        project: PROJECT.name,
        source: BROCHURE_ASSET.source,
        asset_type: 'brochure',
        lead_status: BROCHURE_ASSET.leadStatus,
        google_ads_attributed: googleAdsAttribution?.hasGoogleAdsClick || undefined,
        google_ads_click_id_type: googleAdsAttribution?.clickIdType,
        google_ads_campaign_id: googleAdsAttribution?.campaignId,
      });
      trackEvent('form_submit', trackingPayload);
      trackGenerateLead(trackingPayload);
      trackFileDownload(withTrackingContext({
        file_name: BROCHURE_ASSET.fileName,
        file_url: BROCHURE_ASSET.url,
        project: PROJECT.name,
        source: BROCHURE_ASSET.source,
        asset_type: 'brochure',
      }));

      downloadFile(BROCHURE_ASSET.url, BROCHURE_ASSET.fileName);
      setBrochureForm(DEFAULT_BROCHURE_FORM);
      setBrochureModalOpen(false);
      showToast('Brochure download started.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setBrochureSubmitting(false);
    }
  };

  const continueFromQuickRequest = (event) => {
    event.preventDefault();
    const trimmedName = visitForm.name.trim();
    const trimmedPhone = visitForm.phone.trim();

    if (!trimmedName || !trimmedPhone) {
      showToast('Please enter your name and phone number to continue.');
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      showToast('Please enter a valid 10-digit phone number.');
      return;
    }

    setVisitSource('lp_b_inline_request');
    setVisitStep(2);
    setVisitModalOpen(true);
    trackEvent('visit_step_1_submit', withTrackingContext({
      form_name: 'kalpavruksha_site_visit_form',
      project: PROJECT.name,
      source: 'lp_b_inline_request',
      interest: visitForm.interest || VISIT_INTEREST_OPTIONS[0],
    }));
  };

  const navItems = [
    { label: 'Overview', onClick: () => scrollToRef(heroRef) },
    { label: 'Layout', onClick: () => scrollToRef(planRef) },
    { label: 'Amenities', onClick: () => scrollToRef(amenitiesRef) },
    { label: 'Locality', onClick: () => scrollToRef(locationRef) },
  ];
  const activeHeroSlide = heroSlides[activeHeroSlideIndex] || heroSlides[0];

  const formInputClass = 'min-h-[3.35rem] w-full rounded-2xl border border-[#d6bd8f] bg-[#fff7e8] px-4 text-base text-[#27382c] outline-none transition placeholder:text-[#897b62] focus:border-[#b56f37] focus:ring-4 focus:ring-[#b56f37]/12';
  const formLabelClass = 'mb-2 block text-sm font-semibold text-[#52684a]';
  const chipClass = (active) => `min-h-[3.15rem] rounded-2xl border px-4 text-sm font-semibold transition ${
    active
      ? 'border-[#b56f37] bg-[#f2d6aa] text-[#27382c] shadow-sm'
      : 'border-[#d6bd8f] bg-[#fff7e8] text-[#5f684f] hover:border-[#b56f37]'
  }`;

  return (
    <>
      <ZohoSalesIQWidgetLoader
        hideFloatButton
        homeWidgets={KALPAVRUKSHA_ZOHO_HOME_WIDGETS}
        theme={KALPAVRUKSHA_ZOHO_THEME}
        autoLoad={false}
      />
      <Helmet>
        <title>Kalpavruksha Open Plots in Vijayawada | CRDA Approved Plots Near Amaravati | Easy Homes</title>
        <meta
          name="description"
          content="Explore Kalpavruksha by Easy Homes, a CRDA-approved residential plotted community with 105 open plots across 9.03 acres near Vijayawada and Amaravati, with plot sizes from 174 to 525 square yards, premium infrastructure, and clubhouse amenities."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href={KALPAVRUKSHA_OVERVIEW_HERO_PRELOAD} />
      </Helmet>
      <style>
        {`
          .kalpa-v2-page {
            --kv2-ink: #243528;
            --kv2-leaf: #52684a;
            --kv2-moss: #7f8d62;
            --kv2-sage: #dbe0c7;
            --kv2-sand: #f2e3c6;
            --kv2-cream: #fbf3e4;
            --kv2-clay: #b56f37;
            --kv2-copper: #d29252;
            --kv2-line: rgba(116, 87, 49, 0.22);
            font-family: 'Manrope', 'Avenir Next', sans-serif;
            background:
              radial-gradient(circle at 8% 10%, rgba(181,111,55,0.15), transparent 30%),
              radial-gradient(circle at 88% 12%, rgba(127,141,98,0.22), transparent 34%),
              linear-gradient(180deg, #f8efdf 0%, #ead6b6 48%, #f6ead8 100%);
          }

          @media (prefers-reduced-motion: no-preference) {
            .kalpa-v2-page .kv2-float-action {
              animation: kv2-pop 520ms ease both;
            }

            .kalpa-v2-page .kv2-reveal-target,
            .kalpa-v2-page .kv2-card-lift,
            .kalpa-v2-page .kv2-image-card {
              opacity: 0;
              transform: translate3d(0, 26px, 0) scale(0.985);
              transition:
                opacity 720ms cubic-bezier(.2,.7,.2,1),
                transform 720ms cubic-bezier(.2,.7,.2,1),
                box-shadow 260ms ease,
                border-color 260ms ease;
              transition-delay: var(--kv2-delay, 0ms);
              will-change: opacity, transform;
            }

            .kalpa-v2-page .kv2-reveal-target.kv2-visible,
            .kalpa-v2-page .kv2-card-lift.kv2-visible,
            .kalpa-v2-page .kv2-image-card.kv2-visible {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }

            .kalpa-v2-page .kv2-image-card img {
              transform: scale(1.055);
              transition: transform 900ms cubic-bezier(.2,.7,.2,1);
            }

            .kalpa-v2-page .kv2-image-card.kv2-visible img {
              transform: scale(1);
            }

            .kalpa-v2-page .kv2-card-lift {
              transition-property: opacity, transform, box-shadow, border-color, background-color;
            }

            .kalpa-v2-page .kv2-card-lift.kv2-visible:hover {
              transform: translateY(-5px) scale(1.01);
            }
          }

          .kalpa-v2-page .kv2-review-widget > .mt-12 {
            margin-top: 0;
          }

          .kalpa-v2-page .kv2-hero-title {
            text-wrap: balance;
            word-spacing: 0.06em;
          }

          .kalpa-v2-page .kv2-display {
            font-family: 'Fraunces', 'Cormorant Garamond', Georgia, serif;
          }

          .kalpa-v2-page .kv2-mobile-gallery {
            scrollbar-width: none;
            scroll-behavior: smooth;
          }

          .kalpa-v2-page .kv2-mobile-gallery::-webkit-scrollbar {
            display: none;
          }

          .kalpa-v2-page .kv2-section-shell {
            position: relative;
            overflow: hidden;
          }

          .kalpa-v2-page .kv2-section-shell::before {
            content: '';
            pointer-events: none;
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(rgba(82,104,74,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(82,104,74,0.04) 1px, transparent 1px);
            background-size: 38px 38px;
            mask-image: radial-gradient(circle at 50% 20%, black, transparent 72%);
          }

          @keyframes kv2-pop {
            from {
              opacity: 0;
              transform: translateX(14px) scale(0.94);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
        `}
      </style>

      <div className="kalpa-v2-page min-h-screen text-[#27382c]">
        {toast && (
          <div className={`fixed left-1/2 top-4 z-[140] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
            toast.type === 'success' ? 'bg-[#52684a] text-[#fff7e8]' : 'bg-[#8b3f2d] text-[#fff7e8]'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="mx-auto min-h-screen w-full overflow-x-hidden bg-[linear-gradient(180deg,#f8efdd_0%,#ead5b2_42%,#f5e8d4_100%)] lg:max-w-none">
          <header className="fixed inset-x-0 top-0 z-[110] border-b border-[#b56f37]/18 bg-[#fff7e8] text-[#27382c] shadow-[0_16px_38px_rgba(82,104,74,0.14)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 border-b border-[#b56f37]/10 px-4 py-3 sm:px-5 lg:border-b-0 lg:px-6">
              <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Back to Easy Homes home">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#b56f37]/30 bg-[#e9d3aa] text-[#52684a]">
                  <Trees className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="kv2-display block truncate text-[1rem] font-semibold uppercase leading-none tracking-[0.16em] text-[#52684a] sm:text-[1.08rem]">
                    Kalpavruksha
                  </span>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8b5526]/65">
                    Premium Plots
                  </span>
                </span>
              </Link>

              <nav className="hidden items-center gap-1 text-sm font-semibold text-[#52684a]/78 lg:flex">
                {navItems.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={`rounded-full px-4 py-2.5 transition ${
                      index === 0
                        ? 'bg-[#52684a]/12 text-[#52684a]'
                        : 'hover:bg-[#52684a]/10 hover:text-[#27382c]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                type="button"
                onClick={() => openVisitModal('lp_b_header_book')}
                className="rounded-full border border-[#b56f37]/40 bg-[#b56f37] px-3.5 py-2.5 text-xs font-semibold text-[#fff7e8] shadow-[0_10px_24px_rgba(181,111,55,0.18)] transition hover:bg-[#9e5f2e] sm:px-4"
              >
                Book Now
              </button>
            </div>

            <nav className="mx-auto flex max-w-6xl overflow-x-auto px-3 text-xs font-semibold text-[#52684a]/76 sm:text-sm lg:hidden">
              {navItems.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`shrink-0 border-b-2 px-3 py-2.5 transition sm:px-4 ${
                    index === 0
                      ? 'border-[#b56f37] text-[#b56f37]'
                      : 'border-transparent hover:border-[#52684a]/25 hover:text-[#27382c]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </header>

          <main className="pt-[6.05rem] sm:pt-[6.15rem] lg:pt-[4.1rem]">
            <section ref={heroRef} className="text-[#fff7e8]">
              <div className="bg-[#e7d4ad] px-4 py-2 text-center text-sm font-semibold text-[#27382c]">
                {activeHeroSlide.eyebrow}
              </div>
              <div className="relative min-h-[30rem] overflow-hidden lg:min-h-[calc(100vh-4.1rem)]">
                {heroSlides.map((slide, index) => (
                  <picture
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${index === activeHeroSlideIndex ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <source srcSet={slide.imageSrcSet} sizes={HERO_IMAGE_SIZES} />
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="h-full w-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                  </picture>
                ))}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(39,56,44,0.08)_0%,rgba(69,78,50,0.48)_50%,rgba(78,61,35,0.84)_100%)] lg:bg-[linear-gradient(90deg,rgba(39,56,44,0.9)_0%,rgba(77,86,54,0.68)_44%,rgba(181,111,55,0.2)_100%)]" />

                <div className="relative z-10 mx-auto grid min-h-[30rem] max-w-6xl items-end gap-8 px-5 pb-8 pt-10 lg:min-h-[calc(100vh-4.1rem)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-6 lg:py-12">
                  <div className="max-w-2xl text-center lg:text-left">
                    <p className="mx-auto inline-flex rounded-full border border-[#fff7e8]/45 bg-[#fff7e8]/12 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ffe2a8] lg:mx-0">
                      {activeHeroSlide.label}
                    </p>
                    <h1 className="kv2-display kv2-hero-title mt-5 text-[1.68rem] font-semibold uppercase leading-[1.08] tracking-[-0.01em] text-[#ffe2a8] sm:text-[2.2rem] lg:text-[2.85rem] xl:text-[3.15rem]">
                      {activeHeroSlide.title}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#fff7e8]/86 sm:text-base lg:mx-0 lg:text-base lg:leading-7">
                      {PROJECT.plotSizes} {PROJECT.plotSizeUnit} | {PROJECT.projectArea} | {PROJECT.locationShort} | Gated Community
                    </p>
                    <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3 lg:mx-0">
                      <button
                        type="button"
                        onClick={() => openVisitModal('lp_b_hero_book')}
                        className="rounded-xl bg-[#b56f37] px-4 py-3 text-sm font-bold uppercase tracking-[0.02em] text-[#fff7e8] shadow-[0_14px_30px_rgba(181,111,55,0.28)]"
                      >
                        Book Site Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => openWhatsApp('lp_b_hero_price')}
                        className="rounded-xl border border-[#ffe2a8]/70 bg-[#fff7e8]/8 px-4 py-3 text-sm font-bold uppercase tracking-[0.02em] text-[#ffe2a8]"
                      >
                        Current Price
                      </button>
                    </div>

                    <div className="mt-6 flex justify-center gap-2 lg:justify-start">
                      {heroSlides.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setActiveHeroSlideIndex(index)}
                          className={`h-2 rounded-full transition-all ${index === activeHeroSlideIndex ? 'w-8 bg-[#ffe2a8]' : 'w-2 bg-[#fff7e8]/35 hover:bg-[#fff7e8]/60'}`}
                          aria-label={`Show ${slide.label} slide`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="hidden justify-end lg:flex">
                    <div className="kv2-reveal-target w-full max-w-md rounded-[30px] border border-[#fff7e8]/35 bg-[#fff7e8]/82 p-4 text-[#27382c] shadow-[0_28px_80px_rgba(64,73,45,0.26)] backdrop-blur-xl">
                      <div className="grid grid-cols-2 gap-3">
                        {snapshotCards.map((item) => (
                          <div key={item.label} className="kv2-card-lift rounded-2xl border border-[#b56f37]/12 bg-[#f4e6cc]/80 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b5526]/65">{item.label}</p>
                            <ProjectMetricValue label={item.label} value={item.value} unit={item.unit} className="mt-2 block text-lg font-extrabold text-[#27382c]" />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToRef(planRef)}
                        className="mt-4 w-full rounded-xl border border-[#52684a]/35 bg-[#52684a] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#fff7e8] transition hover:bg-[#43573d]"
                      >
                        Explore Site Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          <section ref={snapshotRef} className="kv2-section-shell bg-[linear-gradient(135deg,#f4e6cc_0%,#dbe0c7_54%,#ead2aa_100%)] px-5 py-12 lg:px-6 lg:py-16">
            <div className="relative z-10 mx-auto max-w-5xl">
            <h2 className="kv2-display kv2-reveal-target text-center text-[1.75rem] font-semibold uppercase tracking-[-0.02em] text-[#27382c] lg:text-[2.45rem]">
              Why buyers shortlist Kalpavruksha
            </h2>

            <div className="mx-auto mt-7 grid max-w-5xl grid-cols-2 gap-3 text-center sm:grid-cols-5 lg:gap-4">
              {trustItems.map((item) => (
                <div key={item.label} className="kv2-card-lift rounded-[22px] border border-[#fff7e8]/70 bg-[#fff7e8]/62 px-2 py-3 shadow-[0_18px_36px_rgba(82,104,74,0.08)] backdrop-blur">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#b56f37]/22 bg-[#f2d6aa] text-[#52684a] lg:h-11 lg:w-11">
                    {item.icon}
                  </div>
                  <p className="mt-2 text-[10px] font-extrabold uppercase leading-tight tracking-[0.08em] text-[#27382c]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-7 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
              {[
                galleryImages[0],
                galleryImages[1],
                galleryImages[2],
                galleryImages[3],
                galleryImages[4],
                galleryImages[5],
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => scrollToRef(galleryRef)}
                  className="group kv2-image-card kv2-card-lift relative h-24 overflow-hidden rounded-[18px] border border-[#fff7e8]/70 bg-[#52684a] shadow-[0_18px_36px_rgba(82,104,74,0.18)] lg:h-44 lg:rounded-[26px]"
                >
                  <img src={item.image} alt={item.alt} loading="eager" decoding="async" fetchPriority="low" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#233729]/82 via-[#233729]/10 to-transparent" />
                  <span className="absolute inset-x-2 bottom-3 text-center text-sm font-extrabold uppercase leading-tight text-[#fff7e8]">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="kv2-reveal-target mx-auto mt-8 max-w-5xl rounded-[28px] border border-[#fff7e8]/75 bg-[#fff7e8]/68 p-4 shadow-[0_22px_48px_rgba(82,104,74,0.12)] backdrop-blur lg:p-6">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5526]">Project Snapshot</p>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {snapshotCards.map((item) => (
                  <div key={item.label} className="kv2-card-lift rounded-[20px] border border-[#b56f37]/10 bg-[#f0dfbf]/72 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8b5526]/75">{item.label}</p>
                    <ProjectMetricValue label={item.label} value={item.value} unit={item.unit} className="mt-1 block text-base font-extrabold leading-tight text-[#27382c]" />
                  </div>
                ))}
              </div>
              <div className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-3">
                <button type="button" onClick={() => openVisitModal('lp_b_snapshot')} className="rounded-xl bg-[#b56f37] px-3 py-3 text-sm font-bold text-[#fff7e8]">
                  Book Visit
                </button>
                <button type="button" onClick={() => openWhatsApp('lp_b_snapshot_price')} className="rounded-xl border border-[#b56f37]/45 bg-[#fff7e8]/45 px-3 py-3 text-sm font-bold text-[#8b5526]">
                  WhatsApp Price
                </button>
              </div>
            </div>
            </div>
          </section>

          <section className="kv2-section-shell bg-[linear-gradient(125deg,#d5c397_0%,#f1dfbf_45%,#d7dfc5_100%)] px-5 py-12 text-[#27382c] md:py-16 lg:px-6">
            <div className="relative z-10 mx-auto max-w-5xl">
              <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr] lg:items-end">
                <div className="kv2-reveal-target">
                  <div className="inline-flex items-center rounded-full border border-[#52684a]/25 bg-[#fff7e8]/50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b5526]">
                    Honest Availability
                  </div>
                  <h2 className="mt-4 max-w-xl text-[1.58rem] font-bold leading-[1.12] tracking-[-0.04em] md:text-[2.65rem]">
                    Clear availability, no pressure
                  </h2>
                </div>
                <p className="kv2-reveal-target max-w-xl text-sm leading-7 text-[#52684a] md:text-base md:leading-8 lg:justify-self-end">
                  Current project facts are shown plainly so buyers can compare, ask questions, and plan a visit with confidence.
                </p>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {availabilityCards.map((item) => (
                  <div key={item.label} className="kv2-card-lift rounded-[24px] border border-[#fff7e8]/80 bg-[#fff7e8]/58 p-4 shadow-[0_22px_46px_rgba(82,104,74,0.12)] backdrop-blur md:rounded-[28px] md:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b5526]/70">{item.label}</p>
                    <AvailabilityMetricValue item={item} className="mt-2 block text-xl font-bold tracking-[-0.03em] text-[#27382c] md:text-2xl" />
                    <p className="mt-2 text-sm leading-6 text-[#5f684f]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section ref={galleryRef} className="kv2-section-shell border-y border-[#b56f37]/12 bg-[linear-gradient(180deg,#f8e7ca_0%,#e6caa0_100%)] py-12 md:py-16">
            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
              <SectionHeader
                eyebrow="Project Gallery"
                title="See the layout, lifestyle, and arrival experience"
                description="Swipe on mobile or explore the premium gallery on desktop before planning the visit."
              />

              <div ref={galleryTrackRef} className="kv2-mobile-gallery mt-8 flex snap-x gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 lg:overflow-visible">
                {galleryImages.map((item) => (
                  <div
                    key={item.title}
                    className="group kv2-image-card kv2-card-lift relative min-w-[78%] snap-start overflow-hidden rounded-[26px] border border-[#fff7e8]/70 bg-[#52684a] shadow-[0_22px_48px_rgba(82,104,74,0.18)] sm:min-w-[48%] lg:min-w-0"
                  >
                    <img src={item.image} alt={item.alt} loading="eager" decoding="async" className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 lg:h-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#233729]/82 via-[#233729]/18 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-[#fff7e8]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f1cf8f]">{item.label}</p>
                      <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-2 lg:hidden">
                {galleryImages.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setMobileGalleryIndex(index)}
                    className={`h-2 rounded-full transition-all ${index === mobileGalleryIndex ? 'w-8 bg-[#b56f37]' : 'w-2 bg-[#52684a]/35'}`}
                    aria-label={`Show ${item.title}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section ref={planRef} className="kv2-section-shell bg-[linear-gradient(135deg,#52684a_0%,#7f8d62_58%,#c89458_100%)] py-12 text-[#fff7e8] md:py-16">
            <div className="relative z-10 mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
              <div className="kv2-reveal-target">
                <SectionHeader
                  eyebrow="Layout Plan"
                  title="Master plan and transparency"
                  description="Explore the approved layout image and core project facts without digging through dense content."
                  align="left"
                  tone="dark"
                />
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    ['Project area', PROJECT.projectArea],
                    ['Total plots', PROJECT.totalPlots],
                    ['Plot sizes', `${PROJECT.plotSizes} ${PROJECT.plotSizeUnit}`],
                    ['RERA ID', PROJECT.reraId],
                  ].map(([label, value]) => (
                    <div key={label} className={`kv2-card-lift rounded-[22px] border border-[#fff7e8]/24 bg-[#fff7e8]/16 p-4 shadow-[0_18px_38px_rgba(39,56,44,0.16)] backdrop-blur md:rounded-[26px] md:p-5 ${label === 'RERA ID' ? 'col-span-2 sm:col-span-1' : ''}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fff7e8]/62">{label}</p>
                      <ProjectMetricValue label={label === 'Project area' ? 'Project Area' : label} value={value} className="mt-2 block break-words text-lg font-bold text-[#fff7e8] md:text-xl" />
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <CtaButton onClick={() => openBrochureModal('lp_b_master_plan')} variant="gold" icon={<Download className="h-5 w-5" />}>
                    Get Free Brochure
                  </CtaButton>
                  <CtaButton onClick={() => downloadLayoutPdf('lp_b_master_plan')} variant="dark" icon={<Download className="h-5 w-5" />}>
                    Download Layout PDF
                  </CtaButton>
                </div>
              </div>

              <div className="kv2-image-card self-start rounded-[30px] border border-[#fff7e8]/28 bg-[#fff7e8]/18 p-3 shadow-[0_28px_80px_rgba(39,56,44,0.24)] backdrop-blur md:p-4 lg:self-center">
                <button
                  type="button"
                  onClick={() => setLayoutPreviewOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-[26px] bg-[#fff7e8] text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fff7e8]/35"
                  aria-label="Open Kalpavruksha master layout plan in full view"
                >
                  <img
                    src={require('../assets/kalpavruksha/layout.webp')}
                    alt="Kalpavruksha master layout plan"
                    loading="eager"
                    decoding="async"
                    className="w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full border border-[#fff7e8]/45 bg-[#27382c]/78 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#fff7e8] shadow-lg backdrop-blur">
                    Tap to enlarge
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section ref={locationRef} className="kv2-section-shell border-y border-[#b56f37]/12 bg-[linear-gradient(135deg,#f7ecd9_0%,#e2d1aa_52%,#dbe0c7_100%)] py-12 md:py-16">
            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
              <SectionHeader
                eyebrow="Location Advantages"
                title="Connectivity buyers can verify"
                description="Quick distance markers first, then live directions for the route from your starting point."
              />

              <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-3">
                {locationChips.map((item) => (
                  <div key={`${item.label}-${item.detail}`} className="kv2-card-lift rounded-[24px] border border-[#fff7e8]/75 bg-[#fff7e8]/58 p-4 shadow-[0_16px_34px_rgba(82,104,74,0.12)] backdrop-blur md:rounded-[28px] md:p-5">
                    <LocationMetricValue label={item.label} className="block text-xl font-bold tracking-[-0.04em] text-[#27382c] md:text-2xl" />
                    <p className="mt-1 text-xs leading-5 text-[#5f684f] md:text-sm md:leading-6">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="kv2-reveal-target mx-auto mt-7 max-w-5xl overflow-hidden rounded-[30px] border border-[#fff7e8]/75 bg-[#fff7e8]/58 p-5 shadow-[0_24px_60px_rgba(82,104,74,0.14)] backdrop-blur md:p-8">
                <div className="grid gap-8 lg:grid-cols-[0.85fr,1.15fr] lg:items-center">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b6328]">Locality Summary</p>
                    <h3 className="mt-3 text-[1.6rem] font-bold leading-[1.12] tracking-[-0.04em] text-[#27382c] md:text-3xl">Near Vijayawada-Nagpur Greenfield Highway</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5f684f] md:text-base md:leading-8">
                      Positioned in Vemavaram with practical access to Vijayawada, Western Bypass, Hyderabad Highway and Amaravati-side destinations.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <CtaButton href={DIRECTIONS_URL} target="_blank" variant="gold" icon={<MapPin className="h-5 w-5" />}>
                        Get Directions
                      </CtaButton>
                      <CtaButton onClick={() => openVisitModal('lp_b_location')} icon={<CalendarDays className="h-5 w-5" />}>
                        Book Visit
                      </CtaButton>
                    </div>
                  </div>
                  <div className="relative min-h-[240px] overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#52684a_0%,#7f8d62_100%)] p-5 text-[#fff7e8] shadow-inner md:min-h-[300px] md:p-6">
                    <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#fff7e8]/22" />
                    <div className="absolute left-[18%] top-[26%] h-3 w-3 rounded-full bg-[#f1cf8f]" />
                    <div className="absolute left-[44%] top-[48%] h-4 w-4 rounded-full bg-[#fff7e8] ring-4 ring-[#f1cf8f]/35" />
                    <div className="absolute right-[18%] top-[32%] h-3 w-3 rounded-full bg-[#f1cf8f]" />
                    <div className="absolute bottom-[22%] right-[28%] h-3 w-3 rounded-full bg-[#f1cf8f]" />
                    <div className="absolute left-[22%] top-[30%] h-[2px] w-[55%] rotate-[18deg] bg-[#f1cf8f]/70" />
                    <div className="absolute left-[42%] top-[50%] h-[2px] w-[34%] -rotate-[34deg] bg-[#fff7e8]/34" />
                    <div className="relative z-10 max-w-xs">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">Route View</p>
                      <h4 className="mt-3 text-xl font-bold leading-tight md:text-2xl">Kalpavruksha connectivity map</h4>
                      <p className="mt-3 text-sm leading-6 text-[#fff7e8]/72 md:leading-7">
                        Use directions for the live route and travel estimate from your starting point.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section ref={amenitiesRef} className="kv2-section-shell bg-[linear-gradient(145deg,#c9b984_0%,#e7d6b5_45%,#d7dfc5_100%)] py-12 text-[#27382c] md:py-16">
            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
              <SectionHeader
                eyebrow="Infrastructure & Amenities"
                title="Premium plotted development essentials"
                description="Core infrastructure and lifestyle features, kept easy to compare before a site visit."
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                {amenities.map((item) => (
                  <div key={item.title} className="kv2-card-lift rounded-[24px] border border-[#fff7e8]/72 bg-[#fff7e8]/56 p-4 shadow-[0_20px_46px_rgba(82,104,74,0.12)] backdrop-blur md:rounded-[28px] md:p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#52684a]/12 text-[#52684a] ring-1 ring-[#52684a]/20 md:h-12 md:w-12">
                      {item.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[#27382c] md:mt-5 md:text-xl">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f684f] md:mt-3 md:leading-7">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {FOUNDER_MESSAGE && (
            <section className="kv2-section-shell bg-[linear-gradient(135deg,#52684a_0%,#8c8f61_52%,#c89458_100%)] py-16 text-[#fff7e8] md:py-20">
              <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[0.78fr,1.22fr] lg:items-center">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-[#fff7e8]/40 bg-[#fff7e8]/14 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">
                      Founder
                    </div>
                    <h2 className="kv2-display mt-5 text-3xl font-semibold uppercase tracking-[-0.02em] md:text-5xl">
                      Founder vision
                    </h2>
                  </div>
                  <div className="rounded-[34px] border border-[#fff7e8]/24 bg-[#fff7e8]/16 p-7 shadow-[0_24px_70px_rgba(39,56,44,0.18)] md:p-9">
                    <p className="text-base leading-8 text-[#fff7e8]/76">
                      {FOUNDER_MESSAGE}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section ref={reviewsRef} className="kv2-section-shell border-y border-[#b56f37]/12 bg-[linear-gradient(135deg,#f7ead5_0%,#e4d0aa_100%)] py-12 md:py-16">
            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
              <SectionHeader
                eyebrow="Reviews"
                title="Voices that speak for Kalpavruksha"
                description="See what customers are saying on Google Reviews, then choose the next step with confidence."
              />
              <div className="kv2-reveal-target mt-8 grid gap-4 rounded-[30px] border border-[#fff7e8]/75 bg-[#fff7e8]/58 p-4 shadow-[0_24px_60px_rgba(82,104,74,0.12)] backdrop-blur md:grid-cols-[0.82fr,1.18fr] md:p-5 lg:p-6">
                <div className="rounded-[24px] bg-[linear-gradient(135deg,#52684a_0%,#7f8d62_100%)] p-5 text-[#fff7e8] md:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">Buyer confidence</p>
                  <h3 className="mt-3 text-xl font-bold">Prefer to verify first?</h3>
                  <p className="mt-3 text-sm leading-7 text-[#fff7e8]/72">
                    Google reviews remain available for reassurance. If the widget is slow to load, ask the team directly on WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => openWhatsApp('lp_b_reviews_whatsapp')}
                    className="mt-5 inline-flex min-h-[2.8rem] w-full items-center justify-center rounded-2xl bg-[#fff7e8] px-4 text-sm font-semibold text-[#52684a] transition hover:bg-[#f1cf8f]"
                  >
                    Ask on WhatsApp
                  </button>
                </div>
                <div className="rounded-[24px] border border-[#d7c198] bg-[#fff7e8]/78 p-3 md:p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b5526]">Live Widget</p>
                      <h3 className="mt-1 text-lg font-bold text-[#27382c]">Google reviews</h3>
                    </div>
                  </div>
                  <div className="kv2-review-widget relative min-h-[120px] overflow-hidden rounded-[18px] bg-[#f4e6cc] ring-1 ring-[#d7c198]">
                    <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-sm leading-6 text-[#5f684f]">
                      Google reviews load here. You can continue with WhatsApp if the widget is unavailable.
                    </div>
                    <div className="relative z-10 min-h-[8rem] p-2">
                      {shouldRenderReviews ? (
                      <Suspense fallback={<div className="h-28 rounded-2xl bg-[#f4efe4]" />}>
                        <ReviewsSection />
                      </Suspense>
                      ) : (
                        <div className="flex h-28 items-center justify-center rounded-2xl bg-[#f4efe4] px-4 text-center text-sm leading-6 text-[#5f684f]">
                          Google reviews are preparing as you approach this section.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section ref={faqRef} className="kv2-section-shell bg-[linear-gradient(135deg,#d7dfc5_0%,#ead6b6_100%)] py-12 text-[#27382c] md:py-16">
            <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="FAQ"
                title="Questions before booking a visit"
                description="Short, practical answers to reduce doubt before the form."
              />
              <div className="mt-10 space-y-3">
                {faqs.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div key={item.question} className="kv2-card-lift overflow-hidden rounded-[24px] border border-[#fff7e8]/72 bg-[#fff7e8]/64 shadow-[0_14px_34px_rgba(82,104,74,0.1)] backdrop-blur md:rounded-[28px]">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-5 md:py-5"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-[0.95rem] font-bold text-[#27382c] md:text-lg">{item.question}</span>
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7c198] text-[#8b5526] transition md:h-10 md:w-10 ${isOpen ? 'rotate-180 bg-[#f1cf8f]' : 'bg-[#fff7e8]'}`}>
                          <ChevronDown className="h-5 w-5" />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#d7c198]/70 px-4 py-4 md:px-5">
                          <p className="text-sm leading-6 text-[#5f684f] md:text-base md:leading-7">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section ref={finalCtaRef} className="kv2-section-shell border-t border-[#b56f37]/12 bg-[linear-gradient(135deg,#ead6b6_0%,#f6ead8_100%)] px-5 py-10 text-[#27382c] md:py-14">
            <div className="kv2-reveal-target relative z-10 mx-auto max-w-xl rounded-[30px] border border-[#fff7e8]/72 bg-[linear-gradient(135deg,#52684a_0%,#7f8d62_100%)] p-5 text-[#fff7e8] shadow-[0_26px_70px_rgba(82,104,74,0.18)] md:p-6">
              <h2 className="kv2-display text-center text-[1.45rem] font-semibold uppercase tracking-[-0.015em] text-[#fff7e8] md:text-3xl">
                Request a Callback
              </h2>
              <p className="mx-auto mt-2.5 max-w-md text-center text-sm leading-6 text-[#fff7e8]/72">
                Share your details once. The next step shows available slots for the site visit.
              </p>
              <form onSubmit={continueFromQuickRequest} className="mx-auto mt-6 max-w-lg space-y-3">
                <input
                  name="name"
                  value={visitForm.name}
                  onChange={handleVisitInput}
                  className="min-h-[2.95rem] w-full rounded-2xl border border-[#fff7e8]/20 bg-[#fff7e8] px-4 text-sm font-medium text-[#27382c] outline-none transition focus:border-[#f1cf8f] focus:ring-4 focus:ring-[#fff7e8]/20"
                  placeholder="Your Name"
                />
                <input
                  name="phone"
                  value={visitForm.phone}
                  onChange={handleVisitInput}
                  className="min-h-[2.95rem] w-full rounded-2xl border border-[#fff7e8]/20 bg-[#fff7e8] px-4 text-sm font-medium text-[#27382c] outline-none transition focus:border-[#f1cf8f] focus:ring-4 focus:ring-[#fff7e8]/20"
                  inputMode="tel"
                  maxLength={10}
                  placeholder="Mobile Number"
                />
                <label className="block text-xs font-semibold text-[#fff7e8]/82">
                  Looking For:
                  <select
                    name="interest"
                    value={visitForm.interest}
                    onChange={handleVisitInput}
                    className="mt-1 min-h-[2.95rem] w-full rounded-2xl border border-[#fff7e8]/20 bg-[#fff7e8] px-4 text-sm font-medium text-[#27382c] outline-none transition focus:border-[#f1cf8f] focus:ring-4 focus:ring-[#fff7e8]/20"
                  >
                    {VISIT_INTEREST_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="min-h-[3rem] w-full rounded-2xl bg-[#fff7e8] px-4 text-sm font-bold uppercase tracking-[0.05em] text-[#52684a] shadow-[0_12px_28px_rgba(39,56,44,0.18)]"
                >
                  Continue to Slot
                </button>
              </form>
            </div>
          </section>
        </main>

        {!visitModalOpen && !brochureModalOpen && !layoutPreviewOpen && (
          <div className={`fixed bottom-0 left-1/2 z-[100] w-full max-w-[540px] -translate-x-1/2 border border-[#b56f37]/22 bg-[#fff7e8] px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2.5 shadow-[0_-18px_42px_rgba(82,104,74,0.18)] transition-all duration-300 lg:hidden ${
            stickyCtaVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
          }`}>
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:gap-3">
              <div className="min-w-0 rounded-2xl border border-[#d7c198] bg-[#f4e6cc] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b5526]">Price From</p>
                <p className="truncate text-sm font-bold text-[#27382c]">{PROJECT.priceFrom}</p>
              </div>
              <button
                type="button"
                onClick={() => openWhatsApp('lp_b_sticky_price')}
                className="hidden h-12 items-center justify-center rounded-2xl border border-[#b56f37]/30 bg-[#fff7e8] px-5 text-sm font-semibold text-[#8b5526] shadow-sm lg:inline-flex"
              >
                WhatsApp Price
              </button>
              <a
                href={CALL_URL}
                onClick={() => trackCallClick('lp_b_mobile_sticky')}
                aria-label="Call Easy Homes"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b56f37]/30 bg-[#fff7e8] text-[#8b5526] shadow-sm"
              >
                <Phone className="h-5 w-5" />
              </a>
              <button
                type="button"
                onClick={() => openVisitModal('lp_b_mobile_sticky')}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#b56f37] px-4 text-sm font-semibold text-[#fff7e8] shadow-[0_12px_28px_rgba(181,111,55,0.28)]"
              >
                Book Visit
              </button>
            </div>
          </div>
        )}

        {!visitModalOpen && !brochureModalOpen && !layoutPreviewOpen && stickyCtaVisible && (
          <div className="pointer-events-none fixed right-4 top-1/2 z-[90] hidden -translate-y-1/2 transition-all duration-300 lg:block">
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => downloadLayoutPdf('lp_b_floating_layout')}
                className="kv2-float-action inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#b56f37]/28 bg-[#fff7e8] text-[#8b5526] shadow-[0_18px_38px_rgba(82,104,74,0.18)] transition-all duration-200 hover:scale-[1.04] hover:bg-[#f4e6cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b56f37]/24"
                aria-label="Download layout PDF"
                title="Download layout PDF"
              >
                <Download className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => openWhatsApp('lp_b_floating_whatsapp')}
                className="kv2-float-action inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#b56f37]/28 bg-[#fff7e8] text-[#8b5526] shadow-[0_18px_38px_rgba(82,104,74,0.18)] transition-all duration-200 hover:scale-[1.04] hover:bg-[#f4e6cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b56f37]/24"
                aria-label="Open WhatsApp chat"
                title="Open WhatsApp chat"
              >
                <FaWhatsapp className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => launchLiveChat('lp_b_floating_chat')}
                className="kv2-float-action inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#b56f37]/28 bg-[#fff7e8] text-[#8b5526] shadow-[0_18px_38px_rgba(82,104,74,0.18)] transition-all duration-200 hover:scale-[1.04] hover:bg-[#f4e6cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b56f37]/24"
                aria-label="Open live chat"
                title="Open live chat"
              >
                <MessageCircle className="h-5 w-5" />
              </button>

              <a
                href={CALL_URL}
                onClick={() => trackCallClick('lp_b_floating_call')}
                className="kv2-float-action inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#b56f37]/28 bg-[#fff7e8] text-[#8b5526] shadow-[0_18px_38px_rgba(82,104,74,0.18)] transition-all duration-200 hover:scale-[1.04] hover:bg-[#f4e6cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b56f37]/24"
                aria-label="Call Easy Homes"
                title="Call Easy Homes"
              >
                <Phone className="h-5 w-5" />
              </a>

              <button
                type="button"
                onClick={() => openVisitModal('lp_b_floating_book_visit')}
                className="kv2-float-action inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#b56f37]/28 bg-[#fff7e8] text-[#8b5526] shadow-[0_18px_38px_rgba(82,104,74,0.18)] transition-all duration-200 hover:scale-[1.04] hover:bg-[#f4e6cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b56f37]/24"
                aria-label="Book a site visit"
                title="Book a site visit"
              >
                <CalendarDays className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <footer className="border-t border-[#b56f37]/18 bg-[linear-gradient(135deg,#52684a_0%,#354d39_100%)] px-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-9 text-[#fff7e8] lg:pb-10">
          <div className="mx-auto grid max-w-5xl gap-7 md:grid-cols-[1.15fr_0.9fr_auto] md:items-start">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f1cf8f]">Kalpavruksha</p>
              <p className="mt-3 text-sm leading-7 text-[#fff7e8]/70">
                Premium residential open plots near Vijayawada by Easy Homes.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#fff7e8]/56">
                {PROJECT.location}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">Contact</p>
                <a href={CALL_URL} onClick={() => trackCallClick('lp_b_footer_phone')} className="mt-3 inline-flex text-sm font-semibold text-[#fff7e8] transition hover:text-[#f1cf8f]">
                  +91 89888 96666
                </a>
                <button
                  type="button"
                  onClick={() => openWhatsApp('lp_b_footer_whatsapp')}
                  className="mt-2 block text-left text-sm font-semibold text-[#fff7e8]/72 transition hover:text-[#f1cf8f]"
                >
                  WhatsApp: +91 80192 98488
                </button>
                <button
                  type="button"
                  onClick={() => launchLiveChat('lp_b_footer_chat')}
                  className="mt-2 block text-left text-sm font-semibold text-[#fff7e8]/72 transition hover:text-[#f1cf8f]"
                >
                  Start Live Chat
                </button>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">Book Site Visit</p>
                <p className="mt-3 text-sm leading-7 text-[#fff7e8]/60">
                  Share your details and choose from available visit slots.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <CtaButton onClick={() => openVisitModal('lp_b_footer')} variant="gold" icon={<CalendarDays className="h-5 w-5" />}>
                Book Visit
              </CtaButton>
              <CtaButton href={CALL_URL} onClick={() => trackCallClick('lp_b_footer')} variant="dark" icon={<Phone className="h-5 w-5" />}>
                Contact
              </CtaButton>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-5xl border-t border-[#fff7e8]/12 pt-5">
            <p className="text-xs leading-6 text-[#fff7e8]/46">
              Project facts are shown from the current page source. Please verify final approvals, pricing, plot availability, and registration details before booking.
            </p>
          </div>
        </footer>
        </div>

        {layoutPreviewOpen && (
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-[#18231d]/88 p-3 backdrop-blur-sm md:p-6"
            onClick={(event) => { if (event.target === event.currentTarget) setLayoutPreviewOpen(false); }}
          >
            <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#fff7e8]/24 bg-[#fff7e8] shadow-[0_34px_90px_rgba(0,0,0,0.34)] md:max-h-[calc(100vh-3rem)] md:rounded-[36px]">
              <div className="flex items-center justify-between gap-4 border-b border-[#d7c198] bg-[linear-gradient(135deg,#52684a_0%,#7f8d62_100%)] px-4 py-3 text-[#fff7e8] md:px-5 md:py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">Layout Plan</p>
                  <h3 className="mt-1 text-base font-bold md:text-xl">Kalpavruksha Master Layout</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLayoutPreviewOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#fff7e8]/24 bg-[#fff7e8]/14 text-[#fff7e8] transition hover:bg-[#fff7e8]/22"
                  aria-label="Close layout preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-[#f4e6cc] p-3 md:p-5">
                <img
                  src={require('../assets/kalpavruksha/layout.webp')}
                  alt="Kalpavruksha master layout plan full view"
                  className="mx-auto max-h-none w-full max-w-5xl rounded-[18px] bg-[#fff7e8] object-contain shadow-[0_18px_54px_rgba(39,56,44,0.18)]"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        )}

        {visitModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-[#243528]/72 px-3 py-3 md:items-center md:p-6" onClick={(event) => { if (event.target === event.currentTarget) closeVisitModal(); }}>
            <div className="my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-[#d6bd8f] bg-[#f8efdf] shadow-[0_34px_90px_rgba(39,56,44,0.32)] md:my-6 md:max-h-[calc(100vh-3rem)]">
              <div className="flex items-start justify-between gap-4 border-b border-[#d6bd8f] bg-[linear-gradient(135deg,#52684a_0%,#7f8d62_100%)] px-6 py-5 text-[#fff7e8]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">Step {visitStep} of 2</p>
                  <h3 className="mt-2 text-2xl font-bold">{visitStep === 1 ? 'Book a Site Visit' : 'Choose Your Slot'}</h3>
                </div>
                <button type="button" onClick={closeVisitModal} className="rounded-full border border-[#fff7e8]/20 bg-[#fff7e8]/14 p-2 text-[#fff7e8]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={submitVisit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                  {visitStep === 1 ? (
                    <>
                      <div>
                        <label className={formLabelClass}>Name</label>
                        <input name="name" value={visitForm.name} onChange={handleVisitInput} className={formInputClass} autoFocus placeholder="Your name" />
                      </div>
                      <div>
                        <label className={formLabelClass}>Phone</label>
                        <input name="phone" value={visitForm.phone} onChange={handleVisitInput} className={formInputClass} inputMode="tel" maxLength={10} placeholder="10-digit mobile number" />
                      </div>
                      <div>
                        <label className={formLabelClass}>I am looking for</label>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {VISIT_INTEREST_OPTIONS.map((value) => (
                            <button key={value} type="button" onClick={() => setVisitForm((current) => ({ ...current, interest: value }))} className={chipClass(visitForm.interest === value)}>
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className={formLabelClass}>Preferred Date</label>
                        <input type="date" name="preferredDate" min={todayDate} value={visitForm.preferredDate} onChange={handleVisitInput} className={formInputClass} />
                      </div>
                      <div>
                        <label className={formLabelClass}>Available Slot</label>
                        <div className="rounded-[22px] border border-[#d6bd8f] bg-[#f4e6cc] p-2.5">
                          {!visitForm.preferredDate ? (
                            <p className="rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm text-[#5f684f]">Select a date to see available slots.</p>
                          ) : slotsLoading ? (
                            <p className="rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm text-[#5f684f]">Loading available slots...</p>
                          ) : slotsError ? (
                            <p className="rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm text-[#8b3f2d]">{slotsError}</p>
                          ) : availableSlots.length ? (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {availableSlots.map((slot) => (
                                <button key={slot.value} type="button" onClick={() => setVisitForm((current) => ({ ...current, preferredTime: slot.value }))} className={chipClass(visitForm.preferredTime === slot.value)}>
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-2xl bg-[#fff7e8] px-4 py-3 text-sm text-[#5f684f]">No slots are available for this date. Please choose another date.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className={formLabelClass}>Need Transport?</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['No', 'Yes'].map((value) => (
                            <button key={value} type="button" onClick={() => setVisitForm((current) => ({ ...current, transportRequired: value }))} className={chipClass(visitForm.transportRequired === value)}>
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                      {visitForm.transportRequired === 'Yes' && (
                        <div>
                          <label className={formLabelClass}>Pickup Address</label>
                          <textarea name="pickupAddress" value={visitForm.pickupAddress} onChange={handleVisitInput} className={`${formInputClass} min-h-[7rem] py-3`} placeholder="Enter pickup address" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t border-[#d6bd8f] bg-[#f4e6cc] px-6 py-4 sm:flex-row sm:justify-end">
                  {visitStep === 2 && (
                    <button type="button" onClick={() => setVisitStep(1)} className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl border border-[#b56f37]/30 bg-[#fff7e8] px-5 font-semibold text-[#27382c]">
                      Back
                    </button>
                  )}
                  <button type="submit" disabled={visitSubmitting} className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-[#b56f37] px-6 font-semibold text-[#fff7e8] shadow-[0_14px_30px_rgba(181,111,55,0.24)] disabled:opacity-70">
                    {visitSubmitting ? 'Submitting...' : visitStep === 1 ? 'Continue' : 'Book Free Site Visit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {brochureModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-[#243528]/72 px-3 py-3 md:items-center md:p-6" onClick={(event) => { if (event.target === event.currentTarget) closeBrochureModal(); }}>
            <div className="my-2 w-full max-w-xl overflow-hidden rounded-[32px] border border-[#d6bd8f] bg-[#f8efdf] shadow-[0_34px_90px_rgba(39,56,44,0.32)]">
              <div className="flex items-start justify-between gap-4 border-b border-[#d6bd8f] bg-[linear-gradient(135deg,#52684a_0%,#7f8d62_100%)] px-6 py-5 text-[#fff7e8]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cf8f]">Document Access</p>
                  <h3 className="mt-2 text-2xl font-bold">Get Free Brochure</h3>
                </div>
                <button type="button" onClick={closeBrochureModal} className="rounded-full border border-[#fff7e8]/20 bg-[#fff7e8]/14 p-2 text-[#fff7e8]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={submitBrochure} className="space-y-5 px-6 py-5">
                <div>
                  <label className={formLabelClass}>Name</label>
                  <input name="name" value={brochureForm.name} onChange={handleBrochureInput} className={formInputClass} autoFocus placeholder="Your name" />
                </div>
                <div>
                  <label className={formLabelClass}>Phone</label>
                  <input name="phone" value={brochureForm.phone} onChange={handleBrochureInput} className={formInputClass} inputMode="tel" maxLength={10} placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className={formLabelClass}>Email Optional</label>
                  <input name="email" value={brochureForm.email} onChange={handleBrochureInput} className={formInputClass} type="email" placeholder="Email address" />
                </div>
                <button type="submit" disabled={brochureSubmitting} className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-[#b56f37] px-6 font-semibold text-[#fff7e8] shadow-[0_14px_30px_rgba(181,111,55,0.24)] disabled:opacity-70">
                  {brochureSubmitting ? 'Submitting...' : 'Download Brochure'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
