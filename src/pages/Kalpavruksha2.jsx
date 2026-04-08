import React, { Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Download,
  MapPin,
  MessageCircle,
  Phone,
  Heart,
  Trees,
  Building,
  Waves,
  Car,
  Shield,
  Zap,
  CheckCircle,
  Users,
  TreePine,
  X,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Card, CardContent } from '../components/card';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { MAP_LIBRARIES, MAPS_LOADER_ID } from '../config/googleMaps';
import { FaWhatsapp } from 'react-icons/fa';
import YouTubeLiteEmbed from '../components/YouTubeLiteEmbed';
import {
  trackFileDownload,
  trackEvent,
  trackGenerateLead,
  trackScheduleVisit,
  trackWhatsAppClick,
} from '../utils/analytics';

const VISIT_TIME_SLOTS = Array.from({ length: 33 }, (_, index) => {
  const totalMinutes = (9 * 60) + (index * 15);
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = (hours24 % 12) || 12;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const value = `${String(hours24).padStart(2, '0')}:${paddedMinutes}`;
  const label = `${hours12}:${paddedMinutes} ${suffix}`;
  return { value, label };
});

const PICKUP_MAP_DEFAULT_CENTER = { lat: 16.553755, lng: 80.570832 };
const KALPAVRUKSHA_PROPERTY_POSITION = { lat: 16.60108128415813, lng: 80.59797237418302 };
const PICKUP_MAP_CONTAINER_STYLE = { width: '100%', height: '220px' };
const KALPAVRUKSHA_TRAVEL_DESTINATIONS = [
  {
    id: 'airport',
    label: 'Gannavaram Airport',
    address: 'Vijayawada International Airport, Gannavaram, Andhra Pradesh, India',
    emoji: '✈️',
    fallbackLabel: 'Approx. 22 mins drive',
    pinOptions: {
      background: '#d97706',
      borderColor: '#fde68a',
      glyph: 'A',
      glyphColor: '#ffffff',
      scale: 1.05,
    },
  },
  {
    id: 'railway-station',
    label: 'Vijayawada Railway Station',
    address: 'Vijayawada Junction railway station, Vijayawada, Andhra Pradesh, India',
    emoji: '🚆',
    fallbackLabel: 'Approx. 15 mins drive',
    pinOptions: {
      background: '#2563eb',
      borderColor: '#bfdbfe',
      glyph: 'R',
      glyphColor: '#ffffff',
      scale: 1.05,
    },
  },
];
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
    title: 'Download Project Brochure',
    description: 'Share your details to access the Kalpavruksha project brochure.',
    source: 'Website',
    leadStatus: 'Downloaded Brochure'
  }
};

const ReviewsSection = React.lazy(() => import('../components/ReviewProject'));
const PickupLocationMap = React.lazy(() => import('../components/PickupLocationMap'));
const TravelTimesLocationMap = React.lazy(() => import('../components/TravelTimesLocationMap'));
const DEFERRED_SECTION_STYLE = {
  contentVisibility: 'auto',
  containIntrinsicSize: '1px 960px',
};
const HERO_IMAGE_SIZES = '100vw';
const HERO_IMAGE_SRC_SET = '/kalpabg1-640.webp 640w, /kalpabg1-960.webp 960w, /kalpabg1.webp 1440w, /kalpabg1-1920.webp 1920w';
const TRUST_HERO_SRC_SET = '/kalpavruksha-trust-hero-768.webp 768w, /kalpavruksha-trust-hero-1440.webp 1440w, /kalpavruksha-trust-hero-1920.webp 1920w';
const CALM_HERO_SRC_SET = '/kalpavruksha-calm-hero-768.webp 768w, /kalpavruksha-calm-hero-1440.webp 1440w, /kalpavruksha-calm-hero-1920.webp 1920w';
const PEACE_HERO_SRC_SET = '/kalpavruksha-peace-hero-768.webp 768w, /kalpavruksha-peace-hero-1440.webp 1440w, /kalpavruksha-peace-hero-1920.webp 1920w';
const BELONGING_HERO_SRC_SET = '/kalpavruksha-belonging-hero-768.webp 768w, /kalpavruksha-belonging-hero-1440.webp 1440w, /kalpavruksha-belonging-hero-1920.webp 1920w';
const CARE_HERO_SRC_SET = '/kalpavruksha-care-hero-768.webp 768w, /kalpavruksha-care-hero-1440.webp 1440w, /kalpavruksha-care-hero-1920.webp 1920w';
const HERO_SUPPORT_LINE = 'CRDA approved | 9.03 acres | 105 plots';
const WALKTHROUGH_POSTER_SIZES = '(max-width: 768px) 100vw, 960px';
const DEFAULT_SITE_VISIT_FORM = {
  name: '',
  phone: '',
  email: '',
  preferredDate: '',
  preferredTime: '',
  transportRequired: 'Yes',
  pickupAddress: '',
  pickupMode: 'manual',
  pickupLat: '',
  pickupLng: ''
};

const SITE_VISIT_ZOHO_NOTE = 'Site visit scheduled from website.';

const KalpavrukshaPage = () => {
  // ...existing code...
  const navigate = useNavigate();
  const location = useLocation();
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [downloadAssetKey, setDownloadAssetKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloadSubmitting, setDownloadSubmitting] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProjectNavOpen, setIsProjectNavOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [form, setForm] = useState(DEFAULT_SITE_VISIT_FORM);
  const [layoutLeadForm, setLayoutLeadForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const activeDownloadAsset = downloadAssetKey ? DOWNLOAD_ASSET_CONFIG[downloadAssetKey] : null;
  const isModalOpen = showVisitModal || Boolean(activeDownloadAsset);
  const shouldShowFloatingActions = showFloatingActions && !isModalOpen;
  const [toast, setToast] = useState(null);
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const todayDate = new Date().toISOString().split('T')[0];
  const [pickupMapCenter, setPickupMapCenter] = useState(PICKUP_MAP_DEFAULT_CENTER);
  const [pickupMapLoadError, setPickupMapLoadError] = useState(false);
  const [shouldLoadTravelMap, setShouldLoadTravelMap] = useState(false);
  const pickupMapApiKey = process.env.REACT_APP_MAP_KEY || '';
  const pickupGeocodeRequestRef = React.useRef(0);

  // Footer quick link refs and scroll handlers (like Home page)
  const aboutRef = React.useRef(null);
  const locationRef = React.useRef(null);
  const amenitiesRef = React.useRef(null);
  const galleryRef = React.useRef(null);
  const masterPlanRef = React.useRef(null);
  const heroSectionRef = React.useRef(null);
  // For Home page CallToAction scroll (no reload)
  const goToHomeCallToAction = () => {
    window.location.href = "/#contact";
  };

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
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  };
  // Expose scroll handlers globally for Navbar (after function declarations)
  if (typeof window !== 'undefined') {
    window.scrollToAmenities = scrollToAmenities;
    window.scrollToContact = scrollToContact;
  }

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
    const target = locationRef.current;
    if (!target || shouldLoadTravelMap || typeof window === 'undefined') {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldLoadTravelMap(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setShouldLoadTravelMap(true);
        observer.disconnect();
      },
      {
        rootMargin: '320px 0px',
        threshold: 0.01,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [shouldLoadTravelMap]);

  useEffect(() => {
    if (!showVisitModal || form.pickupMode !== 'map') {
      setPickupMapLoadError(false);
    }
  }, [form.pickupMode, showVisitModal]);

  useEffect(() => {
    if (!showFloatingActions) {
      setIsQuickActionsOpen(false);
    }
  }, [showFloatingActions]);

  useEffect(() => {
    if (isModalOpen) {
      setIsQuickActionsOpen(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      setIsProjectNavOpen(false);
    }
  }, [isModalOpen]);

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
    'Explore Kalpavruksha by Easy Homes, a CRDA-approved residential plotted community with 105 open plots across 9.03 acres near Vijayawada and Amaravati, with plot sizes from 174 to 525 square yards, premium infrastructure, and clubhouse amenities.';
  const projectKeywords =
    'Kalpavruksha, Kalpavruksha plots, CRDA approved plots Vijayawada, open plots near Amaravati, Easy Homes projects, residential plots Andhra Pradesh';
  const projectCanonicalUrl = 'https://easyhomess.com/kalpavruksha/';
  const projectImageUrl = 'https://easyhomess.com/kalpPcImg.webp';
  const projectShareTitle = 'Kalpavruksha Open Plots in Vijayawada | Easy Homes';
  const projectShareDescription =
    'CRDA-approved plotted development near Vijayawada and Amaravati with 105 residential plots across 9.03 acres, plot sizes from 174 to 525 square yards, premium amenities, and strong connectivity.';
  const projectLocationTitle = 'Kalpavruksha, near Vijayawada Nagpur Greenfield Highway, Vemavaram';
  const projectLocationAddress = 'Kalpavruksha, near Vijayawada Nagpur Greenfield Highway, Vemavaram, Vijayawada, Andhra Pradesh';
  const projectMapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3823.5114526053485!2d80.59797237418302!3d16.60108128415813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35ef003f891535%3A0xdb8f6ca60fc5d3fe!2sKalpavruksha!5e0!3m2!1sen!2sus!4v1774516140803!5m2!1sen!2sus';
  const projectDirectionsUrl = 'https://maps.app.goo.gl/dNA1KdiDNuLjTthG8';

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
        'The project spans 9.03 acres and is planned as a gated residential plotted community.',
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
        'The current overview shows an average price of around Rs 15.5 K per square yard. Final pricing can vary by plot size, facing, and location within the layout.',
    },
    {
      question: 'When does possession start?',
      answer:
        'The current project overview indicates possession from June 2028.',
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
        'The project is near the Vijayawada Nagpur Greenfield Highway in Vemavaram, with connectivity to Vijayawada, Western Bypass, Hyderabad Highway (NH 65), and Amaravati-side destinations.',
    },
    {
      question: 'How can I get the brochure or schedule a visit?',
      answer:
        'You can download the brochure directly from this page or submit a site visit request to connect with the Easy Homes team for the next steps.',
    },
  ];

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

  const features = [
    {
      icon: <CheckCircle className="h-6 w-6 text-[#e3cb98]" />,
      title: "Fully Approved. Carefully Maintained.",
      description: "CRDA-approved and backed by 5 years of developer maintenance.",
    },
    {
      icon: <MapPin className="h-6 w-6 text-[#e3cb98]" />,
      title: "Closer to Everything That Matters",
      description:
        "7.5 km from Vijayawada | 13.5 km from Amaravati Start-up Village & BITS | Near Vijayawada-Nagpur Greenfield Highway",
    },
    {
      icon: <Car className="h-6 w-6 text-[#e3cb98]" />,
      title: "Roads That Respect Space and Flow",
      description: "60', 40', and 33' wide internal CC roads, walkways, avenue plantations, and stormwater drains.",
    },
    {
      icon: <Zap className="h-6 w-6 text-[#e3cb98]" />,
      title: "Seamless Systems Beneath the Surface",
      description: "Underground networks for power, water, fiber, and sewage - silent, secure, and future-ready.",
    },
    {
      icon: <Waves className="h-6 w-6 text-[#e3cb98]" />,
      title: "Water That Works, Landscapes That Live",
      description: "Overhead tank with underground supply, STP-connected drainage, and drip irrigation.",
    },
    {
      icon: <Building className="h-6 w-6 text-[#e3cb98]" />,
      title: "A Clubhouse That Feels Like a Second Home",
      description: "Infinity pool, yoga room, gym, party lawn, convention hall, private theatre, and guest rooms.",
    },
    {
      icon: <Users className="h-6 w-6 text-[#e3cb98]" />,
      title: "Play Isn't Just for Kids - It's for Community",
      description: "Basketball, net cricket, multi-purpose court, children's play zone, and indoor games.",
    },
    {
      icon: <Trees className="h-6 w-6 text-[#e3cb98]" />,
      title: "Where Nature is Always Within Reach",
      description: "Central rivulet garden beside the creek, landscaped arrival court, and edge gardens.",
    },
    {
      icon: <Shield className="h-6 w-6 text-[#e3cb98]" />,
      title: "Protected. Peaceful. Prepared.",
      description: "8' compound wall with 2' solar fencing, 24x7 gated entry with CCTV, and solar lighting.",
    },
    {
      icon: <Heart className="h-6 w-6 text-[#e3cb98]" />,
      title: "Designed Not Just to Last - But to Mean Something",
      description: "More than a layout - a vision grounded in values for your family's legacy.",
    },
  ]

  const projectSnapshotStats = [
    {
      label: "Project Units",
      value: "105",
      unit: "Units",
      detail: "Registered residential plot inventory."
    },
    {
      label: "Project Area",
      value: "9.03",
      unit: "Acres",
      detail: "Overall layout spread across the project site."
    },
    {
      label: "Sizes",
      value: "174-525",
      unit: "Sq.yd.",
      detail: "Available plot-size range."
    }
  ];

  const locationHighlights = [
    {
      icon: <MapPin className="h-4 w-4" />,
      title: "Near Vijayawada-Nagpur Greenfield Highway"
    },
    {
      icon: <Car className="h-4 w-4" />,
      title: "5 km from Western Bypass"
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
    inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full border text-sm font-semibold tracking-[0.01em]
    shadow-[0_16px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5
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


  //All codes related to img glary 
  const demoImg = [
    { title: "Grand Entrance", image: require("../assets/kalpavruksha/Entry-000.webp"), alt: "Kalpavruksha Grand Entrance - CRDA Approved Plots Vijayawada" },
    { title: "Modern Clubhouse", image: require("../assets/kalpavruksha/club house.webp"), alt: "Kalpavruksha Modern Clubhouse - Luxury Amenities" },
    { title: "Contour Garden", image: require("../assets/kalpavruksha/contour garden.webp"), alt: "Kalpavruksha Contour Garden - Landscaped Greenery" },
    { title: "Arrival Court", image: require("../assets/kalpavruksha/arrival court.webp"), alt: "Kalpavruksha Arrival Court - Gated Community Entrance" },
    { title: "Lotus Pond Retreat", image: require("../assets/kalpavruksha/lotus pond 2.webp"), alt: "Kalpavruksha Lotus Pond - Serene Water Feature" },
    { title: "Seating Area", image: require("../assets/kalpavruksha/seating area.webp"), alt: "Kalpavruksha Seating Area - Relaxing Outdoor Space" }
  ]
  const heroSlides = [
    {
      id: 'overview',
      navLabel: 'Overview',
      eyebrow: 'CRDA-approved open plots in Vijayawada',
      title: "Where You Don't Just Arrive - You Belong",
      description:
        "It's not just the feeling of arriving somewhere new, but somewhere right, where your heart belongs. Just 12 mins from Amaravati.",
      image: '/kalpabg1.webp',
      imageSrcSet: HERO_IMAGE_SRC_SET,
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
        'CRDA-approved plotted community near the Vijayawada-Nagpur Greenfield Highway with 105 residential plots, clubhouse amenities, and planned internal infrastructure.',
    },
    {
      id: 'security',
      navLabel: 'Trust',
      eyebrow: 'Trust',
      title: 'Trust begins with clarity',
      description:
        'CRDA approval, gated entry, CCTV, and 5 years of maintenance make the project easier to choose with confidence.',
      image: '/kalpavruksha-trust-hero-1440.webp',
      imageSrcSet: TRUST_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Interlocking wooden beams representing trust, stability, and structure',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'CRDA approved',
        '24x7 gated entry',
        '5 years maintenance',
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
        'Wide roads, walkways, avenue planting, and underground utilities help the layout feel open and ordered.',
      image: '/kalpavruksha-calm-hero-1440.webp',
      imageSrcSet: CALM_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Soft misty hills and layered gradients expressing calm and ease',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        "60' / 40' / 33' roads",
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
      image: '/kalpavruksha-peace-hero-1440.webp',
      imageSrcSet: PEACE_HERO_SRC_SET,
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
      id: 'connectivity',
      navLabel: 'Belonging',
      eyebrow: 'Belonging',
      title: 'Belonging grows around shared spaces',
      description:
        'The clubhouse, pool, play areas, and guest spaces give families more ways to spend time together.',
      image: '/kalpavruksha-belonging-hero-1440.webp',
      imageSrcSet: BELONGING_HERO_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: 'Interwoven illuminated roots expressing belonging and connection',
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'Infinity pool',
        'Guest rooms',
        'Indoor and outdoor play',
      ],
      summaryLabel: 'Belonging in practice',
      summaryTitle: 'Community feels more natural',
      summaryText:
        'The clubhouse mix supports both everyday routines and larger gatherings inside the community.',
    },
    {
      id: 'water',
      navLabel: 'Care',
      eyebrow: 'Care',
      title: 'Care shows in what lasts',
      description:
        'Power, water, fiber, drainage, and solar lighting are planned for dependable long-term use.',
      image: '/kalpavruksha-care-hero-1440.webp',
      imageSrcSet: CARE_HERO_SRC_SET,
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
  const openModal = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const openVisitModal = (source = 'kalpavruksha_site_visit_modal') => {
    trackEvent('form_open', {
      form_name: 'kalpavruksha_site_visit_form',
      lead_type: 'site_visit',
      project: 'Kalpavruksha',
      source,
    });
    setShowVisitModal(true);
  };
  const closeVisitModal = () => setShowVisitModal(false);
  const openDownloadLeadModal = (assetKey, source = 'kalpavruksha_download_modal') => {
    const assetType = assetKey === 'layout' ? 'master_layout' : 'brochure';
    trackEvent('form_open', {
      form_name: 'kalpavruksha_download_form',
      lead_type: `${assetType}_download`,
      project: 'Kalpavruksha',
      source,
      asset_type: assetType,
    });
    setLayoutLeadForm({ name: '', phone: '', email: '' });
    setDownloadAssetKey(assetKey);
  };
  const closeDownloadLeadModal = () => setDownloadAssetKey(null);

  const onLayoutLeadChange = (e) => {
    const { name, value } = e.target;
    setLayoutLeadForm((prev) => ({ ...prev, [name]: value }));
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

  const trackKalpavrukshaWhatsAppClick = (placement) => {
    trackWhatsAppClick({
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
    });
  };

  const trackKalpavrukshaDirectionsClick = (placement) => {
    trackEvent('directions_click', {
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      destination: 'kalpavruksha',
    });
  };

  const trackKalpavrukshaCallClick = (placement) => {
    trackEvent('phone_click', {
      project: 'Kalpavruksha',
      source: 'kalpavruksha',
      placement,
      contact_method: 'phone',
    });
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
    const pickupRequired = form.transportRequired === 'Yes';
    if (!form.name || !form.phone || !form.preferredDate || !form.preferredTime || (pickupRequired && !form.pickupAddress.trim())) {
      setToast({
        type: 'error',
        msg: pickupRequired
          ? 'Please fill name, phone, date, time slot and pickup address.'
          : 'Please fill name, phone, date and time slot.'
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    try {
      setSubmitting(true);
      const preferredDateTime = `${form.preferredDate}T${form.preferredTime}`;
      await api.post('/api/site-visits', {
        project: 'Kalpavruksha',
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        preferredDate: preferredDateTime,
        transportRequired: form.transportRequired,
        notes: SITE_VISIT_ZOHO_NOTE,
        pickupAddress: pickupRequired ? form.pickupAddress.trim() : undefined,
        pickupMode: pickupRequired ? form.pickupMode : undefined,
        pickupLat: pickupRequired ? (form.pickupLat || undefined) : undefined,
        pickupLng: pickupRequired ? (form.pickupLng || undefined) : undefined
      });
      trackGenerateLead({
        form_name: 'kalpavruksha_site_visit_form',
        lead_type: 'site_visit',
        project: 'Kalpavruksha',
        source: 'kalpavruksha_site_visit_modal',
        transport_required: form.transportRequired,
        pickup_mode: pickupRequired ? form.pickupMode : undefined,
      });
      trackScheduleVisit({
        form_name: 'kalpavruksha_site_visit_form',
        project: 'Kalpavruksha',
        source: 'kalpavruksha_site_visit_modal',
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime,
        transport_required: form.transportRequired,
        pickup_mode: pickupRequired ? form.pickupMode : undefined,
      });
      setShowVisitModal(false);
      setForm(DEFAULT_SITE_VISIT_FORM);
      navigate('/thank-you');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      setToast({ type: 'error', msg });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLayoutLead = async (e) => {
    e?.preventDefault?.();
    if (!layoutLeadForm.name.trim() || !layoutLeadForm.phone.trim()) {
      setToast({ type: 'error', msg: 'Please enter your name and phone number to continue.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (!activeDownloadAsset) {
      setToast({ type: 'error', msg: 'Please select a valid download option.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    try {
      setDownloadSubmitting(true);
      await api.post('/api/leads/layout-download', {
        project: 'Kalpavruksha',
        source: activeDownloadAsset.source,
        leadStatus: activeDownloadAsset.leadStatus,
        name: layoutLeadForm.name.trim(),
        phone: layoutLeadForm.phone.trim(),
        email: layoutLeadForm.email.trim() || undefined,
      });

  const assetType = downloadAssetKey === 'layout' ? 'master_layout' : 'brochure';
      trackGenerateLead({
        form_name: 'kalpavruksha_download_form',
        lead_type: `${assetType}_download`,
        project: 'Kalpavruksha',
        source: activeDownloadAsset.source || 'Website',
        asset_type: assetType,
        lead_status: activeDownloadAsset.leadStatus,
      });
      trackFileDownload({
        project: 'Kalpavruksha',
        source: 'kalpavruksha_download_form',
        asset_type: assetType,
        file_name: activeDownloadAsset.fileName,
        file_extension: 'pdf',
        link_url: activeDownloadAsset.url,
      });

      closeDownloadLeadModal();
      setLayoutLeadForm({ name: '', phone: '', email: '' });
      triggerAssetDownload(activeDownloadAsset);
      navigate('/thank-you');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      setToast({ type: 'error', msg });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setDownloadSubmitting(false);
    }
  };

  const formSectionClass = "rounded-[24px] border border-[#eadfcb] bg-white/[0.86] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm md:p-5";
  const formSectionEyebrowClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6328]";
  const formSectionTitleClass = "mt-1 text-lg font-semibold tracking-[-0.01em] text-[#221c14]";
  const formLabelClass = "mb-2 block text-sm font-medium text-[#53594f]";
  const formInputClass = "min-h-[3.2rem] w-full rounded-2xl border border-[#e0cfaf] bg-white px-4 py-3 text-[15px] text-[#221c14] placeholder:text-[#9a927f] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-200 focus:border-[#cba159] focus:outline-none focus:ring-4 focus:ring-[#cba159]/15";
  const formTextareaClass = "w-full rounded-2xl border border-[#e0cfaf] bg-white px-4 py-3 text-[15px] text-[#221c14] placeholder:text-[#9a927f] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-200 focus:border-[#cba159] focus:outline-none focus:ring-4 focus:ring-[#cba159]/15";
  const formChipClass = (isActive) =>
    isActive
      ? 'rounded-2xl border border-[#cba159] bg-[linear-gradient(180deg,#d8b36e_0%,#cba159_100%)] px-3 py-3 text-sm font-semibold text-[#1d1609] shadow-[0_12px_24px_rgba(203,161,89,0.18)]'
      : 'rounded-2xl border border-[#e0cfaf] bg-white px-3 py-3 text-sm font-medium text-[#5f665d] transition-all duration-200 hover:border-[#cba159] hover:text-[#8b6328]';
  const pickupModeCardClass = (isActive) =>
    isActive
      ? 'flex cursor-pointer flex-col rounded-[20px] border border-[#cba159] bg-[linear-gradient(180deg,#fff4dc_0%,#f7ebd0_100%)] px-4 py-3 shadow-[0_14px_28px_rgba(203,161,89,0.14)]'
      : 'flex cursor-pointer flex-col rounded-[20px] border border-[#e3d4b9] bg-white px-4 py-3 transition-all duration-200 hover:border-[#cba159] hover:bg-[#fffaf1]';
  return (
    <>
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
          href="/kalpabg1-960.webp"
          type="image/webp"
          imageSrcSet={HERO_IMAGE_SRC_SET}
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

        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(realEstateAgentData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(webPageData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(projectSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'border-[#d3b57c] bg-[#162118] text-[#f5ebd2]' : 'border-[#8f4a4a] bg-[#5d2626] text-[#fff1ee]'}`}>
          {toast.msg}
        </div>
      )}

      {/* Site Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-[3px] md:items-center" onClick={(e) => { if (e.target === e.currentTarget) closeVisitModal(); }}>
          <div className="relative my-6 flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-[#e2d4ba] bg-[linear-gradient(180deg,#fcfaf5_0%,#f6efe0_100%)] shadow-[0_34px_90px_rgba(0,0,0,0.24)]">
            <div className="border-b border-[#ebe2d1] bg-[linear-gradient(180deg,#f7f0e2_0%,#f0e1c4_100%)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6328]">Visit Planning</p>
                  <h3 className="mt-2 text-[1.65rem] font-bold tracking-[-0.02em] text-[#221c14]">Book a Site Visit</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6f6758]">
                    Share your preferred date, time, and travel preference. We will confirm the visit and help coordinate pickup if needed.
                  </p>
                </div>
                <button onClick={closeVisitModal} type="button" className="rounded-full border border-[#dfd2b5] bg-white p-2 text-[#6f6a5f] transition-colors duration-200 hover:bg-[#fbf7ef] hover:text-[#221c14]"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <form onSubmit={submitSiteVisit} className="flex flex-1 min-h-0 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div className={formSectionClass}>
                  <p className={formSectionEyebrowClass}>Contact Details</p>
                  <h4 className={formSectionTitleClass}>Where should we reach you?</h4>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={formLabelClass}>Full Name</label>
                      <input name="name" value={form.name} onChange={onChange} className={formInputClass} placeholder="Your name" required />
                    </div>
                    <div>
                      <label className={formLabelClass}>Phone Number</label>
                      <input name="phone" value={form.phone} onChange={onChange} className={formInputClass} placeholder="e.g., 9898899666" required />
                      <p className="mt-2 text-xs text-[#8b877d]">We will also send a WhatsApp update to this number.</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className={formLabelClass}>Email (optional)</label>
                      <input type="email" name="email" value={form.email} onChange={onChange} className={formInputClass} placeholder="you@example.com" />
                    </div>
                  </div>
                </div>

                <div className={formSectionClass}>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-6">
                    <div>
                      <p className={formSectionEyebrowClass}>Visit Preferences</p>
                      <h4 className={formSectionTitleClass}>Pick a suitable slot</h4>
                      <p className="mt-2 text-sm leading-6 text-[#716a5d]">
                        Choose the date and time that works best for you. We will confirm availability after submission.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={formLabelClass}>Preferred Date</label>
                        <input type="date" name="preferredDate" min={todayDate} value={form.preferredDate} onChange={onChange} className={formInputClass} required />
                      </div>
                      <div>
                        <label className={formLabelClass}>Preferred Time Slot</label>
                        <div className="max-h-40 overflow-y-auto rounded-[22px] border border-[#e6dac2] bg-[#fbf6ec] p-2.5">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {VISIT_TIME_SLOTS.map((slot) => (
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
                        </div>
                        <input type="hidden" name="preferredTime" value={form.preferredTime} required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={formSectionClass}>
                  <p className={formSectionEyebrowClass}>Travel Assistance</p>
                  <h4 className={formSectionTitleClass}>Do you need pickup support?</h4>
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
                            <span className="mt-1 text-xs leading-5 text-[#746d60]">Type the pickup location directly.</span>
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
                            <span className="mt-1 text-xs leading-5 text-[#746d60]">Tap the map to auto-fill your pickup point.</span>
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
                        {form.pickupMode === 'map' && (
                          <p className="mt-2 text-xs text-[#8b877d]">Tap on the map or drag the marker to auto-fill a textual address.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-[20px] border border-[#eadfcb] bg-[#fbf5e8] px-4 py-3 text-sm text-[#5f665d]">
                      Pickup details are not needed if you will arrange your own travel.
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0 border-t border-[#ebe2d1] bg-white/[0.72] px-6 pb-5 pt-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button type="submit" disabled={submitting} className={`inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-[0_18px_34px_rgba(203,161,89,0.18)] sm:w-auto sm:min-w-[13rem] ${submitting ? 'bg-[#dcc7a0] text-[#6f654e]' : 'bg-[#cba159] text-[#1d1609] hover:bg-[#d4ab68]'}`}>
                    <CheckCircle className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit Request'}
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
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-[3px] md:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeDownloadLeadModal(); }}
        >
          <div className="relative my-6 flex max-h-[calc(100vh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-[32px] border border-[#e2d4ba] bg-[linear-gradient(180deg,#fcfaf5_0%,#f6efe0_100%)] shadow-[0_34px_90px_rgba(0,0,0,0.24)]">
            <div className="border-b border-[#ebe2d1] bg-[linear-gradient(180deg,#f7f0e2_0%,#f0e1c4_100%)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6328]">Document Access</p>
                  <h3 className="mt-2 text-[1.55rem] font-bold tracking-[-0.02em] text-[#221c14]">{activeDownloadAsset.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6f6758]">
                    {activeDownloadAsset.description}
                  </p>
                </div>
                <button onClick={closeDownloadLeadModal} className="rounded-full border border-[#dfd2b5] bg-white p-2 text-[#6f6a5f] transition-colors duration-200 hover:bg-[#fbf7ef] hover:text-[#221c14]" type="button">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={submitLayoutLead} className="flex flex-1 min-h-0 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div className={formSectionClass}>
                  <p className={formSectionEyebrowClass}>Quick Details</p>
                  <h4 className={formSectionTitleClass}>Tell us where to send it</h4>
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
                    <div className="md:col-span-2">
                      <label className={formLabelClass}>Email (optional)</label>
                      <input
                        type="email"
                        name="email"
                        value={layoutLeadForm.email}
                        onChange={onLayoutLeadChange}
                        className={formInputClass}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#eadfcb] bg-[#fbf5e8] px-4 py-3 text-sm leading-6 text-[#625c50]">
                  Submit once and the document will open for download immediately after the form is accepted.
                </div>
              </div>
              <div className="shrink-0 border-t border-[#ebe2d1] bg-white/[0.72] px-6 pb-5 pt-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-[#756d5f]">
                    By continuing, you agree to be contacted by Easy Homes regarding this project.
                  </p>
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
        <div className="mx-auto max-w-7xl rounded-[24px] border border-white/[0.22] bg-[linear-gradient(180deg,rgba(7,11,9,0.96)_0%,rgba(10,14,12,0.92)_100%)] shadow-[0_26px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to="/"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d7bd86]/40 bg-white/[0.08] text-[#f0ddb3] transition-colors duration-300 hover:bg-white/[0.14]"
                aria-label="Go back to Easy Homes home"
              >
                <TreePine className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium uppercase tracking-[0.3em] text-[#dbc58f] sm:text-[0.95rem]">
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
                  className="text-sm font-medium text-white/[0.92] transition-colors duration-300 hover:text-[#f6e6bf]"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                className="hidden rounded-full border border-white/[0.2] bg-white/[0.08] px-4 py-2 text-sm font-medium text-white/[0.92] transition-all duration-300 hover:bg-white/[0.14] md:inline-flex"
              >
                Back to Home
              </Link>
              <button
                type="button"
                onClick={() => openVisitModal()}
                className="hidden rounded-xl bg-[#cba159] px-4 py-2.5 text-sm font-semibold text-[#1d1609] shadow-[0_16px_34px_rgba(203,161,89,0.3)] transition-all duration-300 hover:bg-[#d4ab68] lg:inline-flex"
              >
                Schedule a Visit
              </button>
              <button
                type="button"
                onClick={() => setIsProjectNavOpen((current) => !current)}
                aria-expanded={isProjectNavOpen}
                aria-controls="kalpavruksha2-project-nav"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.08] text-white transition-colors duration-300 hover:bg-white/[0.14] lg:hidden"
              >
                {isProjectNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isProjectNavOpen && (
            <div
              id="kalpavruksha2-project-nav"
              className="border-t border-white/10 px-4 pb-4 pt-3 lg:hidden"
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
                    className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.1]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.1]"
                >
                  Back to Home
                </Link>
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
      </div>

      <div className="min-h-screen overflow-hidden bg-[#f5f1e8]">
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
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#f1ddb1] backdrop-blur-none sm:px-3.5 sm:py-2 sm:text-[11px] sm:backdrop-blur-sm">
                          <span className="h-2 w-2 rounded-full bg-[#dcb66a] shadow-[0_0_0_4px_rgba(220,182,106,0.12)]"></span>
                          <span>{activeHeroSlide.eyebrow}</span>
                        </p>
                        <div className="mt-4 h-px w-28 bg-gradient-to-r from-[#e1cb97] via-white/[0.45] to-transparent sm:mt-5"></div>

                        <div className="mt-4 min-h-[4.4rem] sm:mt-5 sm:min-h-[5.4rem] lg:min-h-[6.1rem]">
                          <h1
                            className="w-full max-w-none leading-[0.95] tracking-[-0.045em] text-[#fbf6ea] [text-shadow:0_10px_28px_rgba(0,0,0,0.22)] sm:max-w-[14ch] lg:max-w-[15.2ch]"
                            style={{ fontFamily: 'Georgia, Times New Roman, serif', fontWeight: 400, fontSize: 'clamp(1.68rem, 3.2vw, 3.28rem)', textWrap: 'balance' }}
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
                              className={`inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-white/[0.92] backdrop-blur-none sm:px-3.5 sm:text-[13px] sm:backdrop-blur-sm ${
                                index === 2 ? 'hidden sm:inline-flex' : ''
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-[#dcb66a]"></span>
                              <span>{fact}</span>
                            </span>
                          ))}
                        </div>

                        <p className="mt-5 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead6aa]/90 sm:block">
                          {HERO_SUPPORT_LINE}
                        </p>

                        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:gap-3.5">
                          <button
                            type="button"
                            onClick={() => openDownloadLeadModal('brochure', 'hero_brochure_cta')}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#cba159] px-6 py-3.5 text-[15px] font-semibold text-[#1d1609] shadow-[0_18px_38px_rgba(203,161,89,0.28)] transition-all duration-300 hover:bg-[#d4ab68] hover:shadow-[0_22px_42px_rgba(203,161,89,0.34)] sm:min-h-14 sm:w-auto sm:min-w-[13.5rem] sm:px-8 sm:text-base"
                          >
                            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Download Brochure</span>
                          </button>

                          <a
                            href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20I%20am%20interested%20in%20Kalpavruksha%20project."
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackKalpavrukshaWhatsAppClick('hero_cta')}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.05] px-5 py-3.5 text-[15px] font-semibold text-white/[0.92] shadow-[0_10px_20px_rgba(0,0,0,0.08)] backdrop-blur-none transition-all duration-300 hover:border-[#d8b46c]/70 hover:bg-white/[0.1] hover:text-white sm:min-h-14 sm:w-auto sm:px-6 sm:text-base sm:backdrop-blur-sm"
                          >
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Talk to Us on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <div className="hidden items-end justify-end lg:flex">
                <div className="translate-y-3 rounded-[20px] border border-white/[0.08] bg-black/[0.1] px-3.5 py-3 shadow-[0_16px_32px_rgba(0,0,0,0.14)] backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] uppercase tracking-[0.24em] text-white/[0.62]">
                    <span>{String(activeHeroSlideIndex + 1).padStart(2, '0')}</span>
                    <span className="h-1 w-1 rounded-full bg-[#d4ab67]/65"></span>
                    <span>{activeHeroSlide.navLabel}</span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goToPreviousHeroSlide}
                      aria-label="Show previous slide"
                      className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/[0.74] backdrop-blur-sm transition-all duration-300 hover:border-[#d8b46c]/60 hover:bg-white/[0.08] hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

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

                    <button
                      type="button"
                      onClick={goToNextHeroSlide}
                      aria-label="Show next slide"
                      className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/[0.74] backdrop-blur-sm transition-all duration-300 hover:border-[#d8b46c]/60 hover:bg-white/[0.08] hover:text-white"
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

        {/* Section 2: From Longing to Belonging */}
        <div ref={aboutRef} />
        <section
          id="about"
          className="relative overflow-hidden border-t border-[#ebe0ca] bg-[linear-gradient(180deg,#fdf8ef_0%,#f6ede0_100%)] py-20 md:py-24"
          style={DEFERRED_SECTION_STYLE}
        >
          <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-[#e7d7b4]/35 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/3 h-64 w-64 rounded-full bg-[#f4e4bf]/50 blur-3xl" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm backdrop-blur">
                Project Essence
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-[#18231d] md:text-5xl">
                From Longing to <span className="text-[#8b6328]">Belonging</span>
              </h2>
            </div>

            <div className="mt-10 rounded-[36px] border border-[#eadfcb] bg-white/[0.92] p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-12 lg:p-14">
              <div className="mx-auto h-px w-28 bg-gradient-to-r from-transparent via-[#d7b16f] to-transparent" />
              <div className="mx-auto mt-8 max-w-[44rem] space-y-6 text-[#58635c]">
                <p className="text-[1.04rem] leading-8">
                  Some journeys don't begin with a destination. They begin with a feeling,
                  and some places bring a stillness so true, your heart remembers it.
                </p>

                <p className="text-[1.04rem] leading-8">
                  Kalpavruksha was shaped by that search. Not just to be seen, but to be felt.
                  And when you stand here, with hills behind you and the creek beside you,
                  something in you softens.
                </p>

                <p className="text-xl font-semibold text-[#8b6328] md:text-2xl">
                  This isn't just arrival. It's belonging.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Video Walkthrough */}
        <section
          className="relative overflow-hidden border-t border-[#242c27] bg-[radial-gradient(circle_at_top_left,rgba(203,161,89,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(203,161,89,0.08),transparent_28%),linear-gradient(180deg,#111713_0%,#0d1310_100%)] py-20 md:py-24"
          style={DEFERRED_SECTION_STYLE}
        >
          <div className="pointer-events-none absolute -left-16 top-12 h-72 w-72 rounded-full bg-[#d7b16f]/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#d7b16f]/6 blur-3xl" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-white/[0.14] bg-white/[0.06] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#e3cb98] backdrop-blur">
                Walkthrough
              </div>
              <h2 className="mt-6 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-[3.4rem]">
                A Glimpse of What <span className="text-[#e3cb98]">Belonging</span> Looks Like
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#d4d9d2] md:text-[1.05rem]">
                Let Kalpavruksha reveal itself in motion, in flow, and in feeling before you ever visit the site.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-[36px] border border-[#2f3933] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-5">
              <div className="relative aspect-video overflow-hidden rounded-[30px] bg-[#171e1a] ring-1 ring-[#39453e]">
                <YouTubeLiteEmbed
                  videoId="mt-G29uakpQ"
                  title="Project Walkthrough Video"
                  description="Experience Kalpavruksha before you visit"
                  posterSrc="/kalpabg1-960.webp"
                  posterSrcSet={HERO_IMAGE_SRC_SET}
                  posterSizes={WALKTHROUGH_POSTER_SIZES}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Project Renderings Gallery */}
        <div ref={galleryRef} />
        <section
          id="gallery"
          className="border-t border-[#ece1cb] bg-[linear-gradient(180deg,#fffdfa_0%,#f3ebde_100%)] py-20 md:py-24"
          style={DEFERRED_SECTION_STYLE}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm">
                Project Gallery
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-[#18231d] md:text-5xl">
                Picture the Life That <span className="text-[#8b6328]">Awaits</span>
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#637067] md:text-xl">
                Every space is rendered with care, so visitors understand the atmosphere before the first walkthrough.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {demoImg.map((item, index) => (
                <div key={index}
                  onClick={() => openModal(item)}
                  className="group overflow-hidden rounded-[30px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d6b171] hover:shadow-[0_24px_55px_rgba(15,23,42,0.1)]">
                  <div className="aspect-[16/11] overflow-hidden bg-[linear-gradient(180deg,#fbf7ef_0%,#f2e6ce_100%)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-[#efe4cf] px-5 py-5">
                    <div>
                      <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] ring-1 ring-[#d7ba82]">
                        Render {String(index + 1).padStart(2, '0')}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-[#18231d]">{item.title}</h3>
                    </div>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d7ba82] bg-white text-[#8b6328] shadow-sm transition-transform duration-300 group-hover:translate-x-0.5">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
          >
            <div className="relative max-w-4xl max-h-full">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
              >
                <X size={24} />
              </button>

              {/* Large image */}
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg cursor-pointer"
                onClick={closeModal}
              />

              {/* Title */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-white font-semibold text-xl bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  {selectedImage.title}
                </h3>
              </div>
            </div>
          </div>)}

        {/* Section 5: What Sets Kalpavruksha Apart */}
        <div ref={amenitiesRef} />
        <section
          id="amenities"
          className="relative overflow-hidden border-t border-[#263129] bg-[linear-gradient(180deg,#111813_0%,#15211a_100%)] py-20 md:py-24"
          style={DEFERRED_SECTION_STYLE}
        >
          <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#d7b16f]/14 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#d7b16f]/10 blur-3xl" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[40px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(203,161,89,0.18),transparent_26%),linear-gradient(135deg,#111813_0%,#18271d_52%,#0d1410_100%)] px-6 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.3)] md:px-10 md:py-12 lg:px-12">
              <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center rounded-full border border-white/[0.14] bg-white/[0.06] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#e3cb98] shadow-sm backdrop-blur">
                  Signature Advantages
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
                  What Sets <span className="text-[#e3cb98]">Kalpavruksha</span> Apart
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#d7ddd4] md:text-xl">
                  Some places are where you stay, but some places stay with you. Kalpavruksha is shaped by the quieter assurances that matter after the sale too.
                </p>
              </div>

              <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="h-full rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-7 text-white shadow-[0_20px_44px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d8b46c]/65 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_100%)] hover:shadow-[0_28px_58px_rgba(0,0,0,0.28)]"
                  >
                    <CardContent className="p-0">
                      <div className="flex h-full flex-col gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7b16f]/28 bg-[linear-gradient(180deg,rgba(215,177,111,0.18)_0%,rgba(215,177,111,0.08)_100%)] shadow-[0_12px_28px_rgba(203,161,89,0.12)]">
                          {feature.icon}
                        </div>

                        <div className="h-px w-20 bg-gradient-to-r from-[#d7b16f] via-[#c59a55]/45 to-transparent"></div>

                        <div>
                          <div className="mb-3 inline-flex items-center rounded-full bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e3cb98] ring-1 ring-white/[0.1]">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <h3 className="mb-3 text-lg font-semibold text-[#f8f7f2]">
                            {feature.title}
                          </h3>
                          <p className="leading-7 text-[#d7ddd4]">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Community Details */}
        <div ref={masterPlanRef} />
        <section className="border-t border-[#e3d2b4] bg-[linear-gradient(180deg,#fcf4e6_0%,#efdfc5_100%)] py-20 md:py-24" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8b6328] shadow-sm">
                Master Plan
              </div>
              <h2 className="mt-6 text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#18231d] mb-6">
                A Community Drawn with <span className="text-[#8b6328]">Intention</span>
              </h2>
              <p className="text-lg leading-8 text-[#647067] md:text-xl">
                From plot sizes to pathways, everything at Kalpavruksha has been shaped
                to bring balance, beauty, and belonging.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.95fr,1.05fr] lg:gap-14">
              <div>
                <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                  Layout Overview
                </div>
                <h3 className="mt-4 text-[2rem] font-bold tracking-[-0.03em] text-[#18231d] md:text-[2.35rem]">
                  Project Snapshot
                </h3>
                <div className="mt-4 h-px w-24 bg-gradient-to-r from-[#d7b16f] via-[#c59a55]/45 to-transparent" />
                <p className="mt-5 max-w-xl text-[1rem] leading-7 text-[#647067]">
                  The layout is planned to feel practical on paper and comfortable on site, with balanced plot sizing, circulation, and day-to-day usability.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {projectSnapshotStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[26px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8d71]">
                        {item.label}
                      </p>
                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-[#18231d]">{item.value}</span>
                        <span className="text-sm font-semibold text-[#8b6328]">{item.unit}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-[#627067]">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 max-w-xl space-y-4">
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
                      text="Chat on WhatsApp"
                      onClick={() => trackKalpavrukshaWhatsAppClick('master_plan_section')}
                      href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20I%20want%20to%20book%20a%20site%20visit%20for%20Kalpavruksha."
                      target="_blank"
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[36px] border border-[#eadfcb] bg-white/[0.96] p-6 shadow-[0_22px_55px_rgba(15,23,42,0.07)] md:p-8">
                  <h4 className="text-xl font-bold text-[#18231d] mb-4 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-[#8b6328]" />
                    Master Plan Layout
                  </h4>
                  <p className="text-[#627067] mb-6 leading-7">
                    Every plot and pathway - drawn with care, not just to optimize space,
                    but to cultivate a lifestyle.
                  </p>

                  {/* Landscape aspect ratio for layout image */}
                  <div className="aspect-[16/9] bg-[linear-gradient(180deg,#fbf7ef_0%,#f1e6d0_100%)] rounded-[28px] border border-[#eadfcb] shadow-inner cursor-pointer flex items-center justify-center overflow-hidden" onClick={() => setSelectedImage({ image: require('../assets/kalpavruksha/layout.webp'), title: 'Kalpavruksha Project Master Layout', alt: 'Kalpavruksha Project Master Layout - CRDA Approved Plots Map' })}>
                    <img
                      src={require('../assets/kalpavruksha/layout.webp')}
                      alt="Kalpavruksha Project Master Layout - CRDA Approved Plots Map"
                      className="object-contain w-full h-full rounded-[28px] transition-transform duration-300 hover:scale-[1.03]"
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
        <section id="location" className="border-t border-[#ebdfc6] bg-[linear-gradient(180deg,#fffbf4_0%,#f4ead9_100%)] py-20 md:py-24" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                Property Location
              </div>
              <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#18231d]">
                Connected to Vijayawada. <br />
                <span className="text-[#8b6328]">Positioned for everyday convenience.</span>
              </h2>
              <p className="mt-5 text-lg md:text-xl leading-8 text-[#647067]">
                A project location that keeps daily access practical while preserving a quieter plotted community setting.
              </p>
            </div>

            <div className="mt-14 overflow-hidden rounded-[36px] border border-[#eadfcb] bg-white/[0.95] shadow-[0_24px_68px_rgba(15,23,42,0.07)]">
              <div className="grid grid-cols-1 lg:grid-cols-[0.86fr,1.14fr]">
                <div className="border-b border-[#ece4d3] p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
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

                <div className="bg-[linear-gradient(180deg,#faf4e8_0%,#f1e6d0_100%)]">
                  <div className="h-full min-h-[380px] lg:min-h-[100%]">
                    {shouldLoadTravelMap ? (
                      <Suspense
                        fallback={
                          <div className="flex h-full min-h-[380px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(203,161,89,0.12),_transparent_45%),linear-gradient(180deg,_#faf4e7_0%,_#efe3cd_100%)]">
                            <div className="rounded-3xl border border-[#eadfcb] bg-white/92 px-5 py-4 text-sm font-medium text-[#627067] shadow-sm backdrop-blur">
                              Loading live map...
                            </div>
                          </div>
                        }
                      >
                        <TravelTimesLocationMap
                          propertyPosition={KALPAVRUKSHA_PROPERTY_POSITION}
                          propertyLabel="Kalpavruksha"
                          destinations={KALPAVRUKSHA_TRAVEL_DESTINATIONS}
                          fallbackEmbedUrl={projectMapEmbedUrl}
                        />
                      </Suspense>
                    ) : (
                      <div className="flex h-full min-h-[380px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(203,161,89,0.12),_transparent_45%),linear-gradient(180deg,_#faf4e7_0%,_#efe3cd_100%)]">
                        <div className="rounded-3xl border border-[#eadfcb] bg-white/92 px-5 py-4 text-sm font-medium text-[#627067] shadow-sm backdrop-blur">
                          Preparing interactive map...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[32px] border border-[#eadfcb] bg-white/[0.95] p-6 shadow-[0_22px_55px_rgba(15,23,42,0.06)] md:p-8">
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
                {locationHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="flex h-full items-start gap-4 rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d6b171] hover:bg-white hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
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
        <section className="relative overflow-hidden border-t border-[#e5d6b7] bg-[linear-gradient(180deg,#faf3e8_0%,#eee0c9_100%)] py-20 md:py-24" style={DEFERRED_SECTION_STYLE}>
          <div className="pointer-events-none absolute -right-16 top-16 h-72 w-72 rounded-full bg-[#ead8b1]/28 blur-3xl" />
          <div className="pointer-events-none absolute left-0 bottom-0 h-72 w-72 rounded-full bg-[#f0e2c6]/30 blur-3xl" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                Frequently Asked Questions
              </div>
              <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#18231d]">
                Questions buyers usually ask before the first visit
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#647067]">
                Tap a question to view the answer. The section stays clean until someone wants the detail.
              </p>
            </div>

            <div className="mt-12 space-y-3">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-[28px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] shadow-[0_14px_28px_rgba(15,23,42,0.05)] transition-all duration-300"
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

        {/* Section 9: Journey Home */}
        <section className="border-t border-[#e0cfa8] bg-[linear-gradient(180deg,#fbf5e9_0%,#f0dfbf_100%)] py-20 md:py-24" style={DEFERRED_SECTION_STYLE}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[40px] border border-[#d5c29a] bg-[radial-gradient(circle_at_top_left,rgba(214,189,130,0.16),transparent_24%),linear-gradient(135deg,#111712_0%,#173325_42%,#0f1a14_100%)] px-6 py-10 text-center shadow-[0_28px_70px_rgba(0,0,0,0.26)] md:px-10 md:py-14 lg:px-14">
              <div className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e3cb98] backdrop-blur">
                Next Step
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
                Your Journey Home <span className="text-[#e3cb98]">Begins Here</span>
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/[0.84] md:text-xl">
                Every lasting story begins with one step. This section keeps the next actions clear, simple, and reassuring.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4">
                <CTAButton
                  icon={<MapPin className="w-5 h-5" />}
                  text="Schedule a Site Visit"
                  primary
                  onClick={() => openVisitModal('journey_home')}
                  className="min-w-[16rem]"
                />

                <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
                  <a
                    href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20I%20am%20interested%20in%20Kalpavruksha."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackKalpavrukshaWhatsAppClick('journey_home')}
                    className="w-full"
                  >
                    <CTAButton
                      icon={<MessageCircle className="w-5 h-5" />}
                      text="Talk to Us on WhatsApp"
                      className="w-full justify-center !border-white/[0.16] !bg-white/[0.10] !text-white hover:!bg-white/[0.14] hover:!text-white"
                    />
                  </a>
                  <CTAButton
                    icon={<Phone className="w-5 h-5" />}
                    text="Request a Callback"
                    onClick={goToHomeCallToAction}
                    className="w-full justify-center !border-white/[0.16] !bg-white/[0.10] !text-white hover:!bg-white/[0.14] hover:!text-white"
                  />
                  <CTAButton
                    icon={<Download className="w-5 h-5" />}
                    text="Download Project Brochure"
                    onClick={() => openDownloadLeadModal('brochure', 'journey_home')}
                    className="w-full justify-center !border-white/[0.16] !bg-white/[0.10] !text-white hover:!bg-white/[0.14] hover:!text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Testimonials */}
        <section className="border-t border-[#e8dbc0] bg-[linear-gradient(180deg,#f9f2e7_0%,#efe0c9_100%)] py-20 md:py-24" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-9 max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-[#d7ba82] bg-[#fff9ef] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b6328] shadow-sm">
                Reviews & Trust
              </div>
              <h2 className="mt-6 text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#18231d] mb-6">
                Voices That Speak for <span className="text-[#8b6328]">Kalpavruksha</span>
              </h2>
            </div>
            <div className="rounded-2xl text-center">
              <p className="mx-auto max-w-2xl text-lg leading-8 text-[#627067] md:text-xl">
                See what our customers are saying on <span className='font-semibold text-[#8b6328]'>Google</span> Reviews
              </p>
              <div className="mt-8 rounded-[32px] border border-[#e5dcc8] bg-white/[0.92] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
                  <Suspense fallback={<div className="h-24 rounded-2xl bg-[#f4efe4]" />}>
                    <ReviewsSection />
                  </Suspense>
              </div>
              <div className="mx-auto mt-10 max-w-5xl text-left">
                  <div className="rounded-[32px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffdfa_0%,#f5eee2_100%)] p-6 shadow-[0_22px_55px_rgba(15,23,42,0.07)] md:p-8">
                    <div className="mb-4 inline-flex items-center rounded-full border border-[#d7ba82] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b6328]">
                      Buyer Decision Guide
                    </div>
                    <div className="mb-5 h-px w-24 bg-gradient-to-r from-[#d7b16f] via-[#c59a55]/35 to-transparent" />
                    <h3 className="text-2xl md:text-3xl font-bold text-[#18231d] mb-4">
                      Why Kalpavruksha Is a Preferred Choice for Plot Buyers
                    </h3>
                    <p className="text-[#5f6a62] leading-relaxed mb-6 max-w-3xl">
                      Plot buyers usually evaluate three things first: legal clarity, daily convenience, and on-ground readiness.
                      Kalpavruksha performs strongly on all three.
                    </p>

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-[24px] border border-[#eadfcb] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        <h4 className="font-semibold text-[#18231d] mb-2">1. Clear Approvals</h4>
                        <p className="text-sm text-[#627067] leading-relaxed">
                          CRDA approvals, boundaries, and registration details are easier to verify.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-[#eadfcb] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        <h4 className="font-semibold text-[#18231d] mb-2">2. Practical Location</h4>
                        <p className="text-sm text-[#627067] leading-relaxed">
                          The site connects well to Vijayawada, Amaravati corridors, and major roads.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-[#eadfcb] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        <h4 className="font-semibold text-[#18231d] mb-2">3. Visible Infrastructure</h4>
                        <p className="text-sm text-[#627067] leading-relaxed">
                          Roads, utilities, and drainage planning are visible during site inspection.
                        </p>
                      </div>
                    </div>

                    <p className="text-[#435046] leading-relaxed font-medium">
                      Compare documents, check the layout, and visit the site to decide with confidence.
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </section>
        {shouldShowFloatingActions && (
          <div
            className="pointer-events-none fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 transition-all duration-300 lg:block"
            aria-hidden={!shouldShowFloatingActions}
          >
            <div className="pointer-events-auto relative flex items-center justify-end">
              <div
                id="kalpavruksha-quick-actions"
                className={`absolute right-[calc(100%+0.65rem)] top-1/2 w-[min(16.5rem,calc(100vw-4.75rem))] -translate-y-1/2 transition-all duration-200 ${
                  isQuickActionsOpen
                    ? 'visible translate-x-0 opacity-100'
                    : 'invisible translate-x-6 opacity-0'
                }`}
              >
                <div className="rounded-[32px] border border-[#eadfcb] bg-white/[0.97] p-4 shadow-[0_24px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-3 px-2 pb-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6328]">
                        Quick Actions
                      </p>
                      <p className="mt-1 text-sm text-[#68736b]">
                        Everything important, one tap away.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQuickActionsOpen(false)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#eadfcb] bg-white text-[#6c756d] transition-colors duration-200 hover:bg-[#fffaf1] hover:text-[#18231d]"
                      aria-label="Close quick actions"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openVisitModal('mobile_quick_actions');
                  }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-3 text-left text-[#4b5750] shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white hover:shadow-md"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#18231d]">Schedule Site Visit</span>
                          <span className="block text-xs text-[#7a7f77]">Pick your preferred day and time</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                    </button>

                    <button
                      type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('layout', 'mobile_quick_actions');
                  }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-3 text-left text-[#4b5750] shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white hover:shadow-md"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                          <Download className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#18231d]">Download Layout PDF</span>
                          <span className="block text-xs text-[#7a7f77]">Get the approved master layout</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                    </button>

                    <button
                      type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('brochure', 'mobile_quick_actions');
                  }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-3 text-left text-[#4b5750] shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white hover:shadow-md"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                          <Download className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#18231d]">Download Brochure</span>
                          <span className="block text-xs text-[#7a7f77]">Get the full project brochure</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                    </button>

                    <a
                      href={projectDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsQuickActionsOpen(false)}
                      className="flex w-full items-center justify-between rounded-[22px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-3 text-left text-[#4b5750] shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white hover:shadow-md"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#18231d]">Get Directions</span>
                          <span className="block text-xs text-[#7a7f77]">Open the route in Google Maps</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                    </a>

                    <a
                      href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20please%20contact%20me%20regarding%20Kalpavruksha."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        trackKalpavrukshaWhatsAppClick('desktop_quick_actions');
                      }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-3 text-left text-[#4b5750] shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white hover:shadow-md"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                          <FaWhatsapp className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#18231d]">Chat on WhatsApp</span>
                          <span className="block text-xs text-[#7a7f77]">Speak to the sales team directly</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                    </a>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickActionsOpen((current) => !current)}
                aria-expanded={isQuickActionsOpen}
                aria-controls="kalpavruksha-quick-actions"
                className="inline-flex h-14 items-center gap-2 rounded-l-full border border-r-0 border-[#d3ab67] bg-gradient-to-r from-[#cba159] to-[#d7b16f] pl-4 pr-3 text-sm font-semibold text-[#1d1609] shadow-[0_16px_35px_rgba(203,161,89,0.24)] transition-all duration-200 hover:pr-4 hover:shadow-[0_20px_42px_rgba(203,161,89,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b16f]/24"
              >
                <Zap className="h-4 w-4" />
                <span>Quick Actions</span>
              </button>
            </div>
          </div>
        )}

        {shouldShowFloatingActions && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4 transition-all duration-300 lg:hidden"
            aria-hidden={!shouldShowFloatingActions}
          >
            <div className="pointer-events-auto mx-auto flex max-w-sm justify-center">
              <button
                type="button"
                onClick={() => setIsQuickActionsOpen((current) => !current)}
                aria-expanded={isQuickActionsOpen}
                aria-controls="kalpavruksha-mobile-quick-actions"
                className="inline-flex min-h-14 items-center gap-2 rounded-full border border-[#e0cfaf] bg-white/[0.96] px-5 text-sm font-semibold text-[#221c14] shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b16f]/24"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#cba159] to-[#d7b16f] text-[#1d1609]">
                  <Zap className="h-4 w-4" />
                </span>
                <span>Quick Actions</span>
                <ChevronDown className={`h-4 w-4 text-[#8b6328] transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {shouldShowFloatingActions && isQuickActionsOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#101712]/30 backdrop-blur-[2px]"
              aria-label="Close quick actions"
              onClick={() => setIsQuickActionsOpen(false)}
            />
            <div
              id="kalpavruksha-mobile-quick-actions"
              className="absolute inset-x-0 bottom-0 rounded-t-[32px] border-t border-[#eadfcb] bg-[#fffdf8] px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 shadow-[0_-24px_60px_rgba(15,23,42,0.16)]"
            >
              <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d7ccb8]" />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6328]">
                    Quick Actions
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#18231d]">
                    Everything important in one place
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#68736b]">
                    Fast actions for site visit, layout, directions, and direct contact.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    trackKalpavrukshaDirectionsClick('mobile_quick_actions');
                  }}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfcb] bg-white text-[#6c756d] transition-colors duration-200 hover:bg-[#fffaf1] hover:text-[#18231d]"
                  aria-label="Close quick actions"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openVisitModal('desktop_quick_actions');
                  }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-4 text-left shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#18231d]">Schedule Site Visit</span>
                      <span className="block text-xs leading-5 text-[#7a7f77]">Choose a day and time that suits you</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('layout', 'desktop_quick_actions');
                  }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-4 text-left shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                      <Download className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#18231d]">Download Layout PDF</span>
                      <span className="block text-xs leading-5 text-[#7a7f77]">Get the approved master layout instantly</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('brochure', 'desktop_quick_actions');
                  }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-4 text-left shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                      <Download className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#18231d]">Download Brochure</span>
                      <span className="block text-xs leading-5 text-[#7a7f77]">Get the full project brochure instantly</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                </button>

                <a
                  href={projectDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        trackKalpavrukshaDirectionsClick('desktop_quick_actions');
                      }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-4 text-left shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#18231d]">Get Directions</span>
                      <span className="block text-xs leading-5 text-[#7a7f77]">Open the route directly in Google Maps</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                </a>

                <a
                  href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20please%20contact%20me%20regarding%20Kalpavruksha."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    trackKalpavrukshaWhatsAppClick('mobile_quick_actions');
                  }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#eadfcb] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e5_100%)] px-4 py-4 text-left shadow-sm transition-all duration-200 hover:border-[#d6b171] hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#8b6328] ring-1 ring-[#d7ba82]">
                      <FaWhatsapp className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#18231d]">Chat on WhatsApp</span>
                      <span className="block text-xs leading-5 text-[#7a7f77]">Connect with the sales team directly</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#8b887d]" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-[radial-gradient(circle_at_top_left,rgba(213,177,110,0.16),transparent_24%),linear-gradient(180deg,#132018_0%,#0c1410_100%)] pb-24 pt-16 text-white lg:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.1fr,0.8fr,1fr]">
              <div>
                <div className="mb-5 flex items-center">
                  <TreePine className="w-8 h-8 text-[#e3cb98]" />
                  <span className="ml-2 text-xl font-bold">Kalpavruksha</span>
                </div>
                <p className="max-w-sm leading-7 text-white/[0.74]">
                  by Easy Homes - Creating communities where hearts belong
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
                <h4 className="text-lg font-semibold mb-4 text-[#e9d6ad]">Contact Us</h4>
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  <a href="tel:+918988896666" onClick={() => trackKalpavrukshaCallClick('footer_contact')}>
                    <CTAButton
                      icon={<Phone className="w-4 h-4 " />}
                      text="Call Now"
                      className="!border-white/[0.14] !bg-white/[0.10] !text-white hover:!bg-white/[0.14] hover:!text-white"
                    />
                  </a>
                  <div>
                    <a
                      href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20please%20contact%20me%20regarding%20Kalpavruksha."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackKalpavrukshaWhatsAppClick('footer_contact')}
                    >
                      <CTAButton
                        icon={<MessageCircle className="w-4 h-4" />}
                        text="WhatsApp"
                        primary
                      />
                    </a>
                  </div>
                </div>
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
