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
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '../components/card';
import Navbar from '../components/Navbar'
import { useLocation, useNavigate } from 'react-router-dom';
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
const HERO_IMAGE_SIZES = '(max-width: 1023px) 100vw, 50vw';
const HERO_IMAGE_SRC_SET = '/kalpabg2-640.webp 640w, /kalpabg2-960.webp 960w';
const SECURITY_HERO_IMAGE_SRC_SET = '/entry-hero-640.webp 640w, /entry-hero-960.webp 960w';
const WALKTHROUGH_POSTER_SIZES = '(max-width: 768px) 100vw, 960px';

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
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [form, setForm] = useState({
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
  });
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
  const scrollToAmenities = () => {
    amenitiesRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // Expose scroll handlers globally for Navbar (after function declarations)
  if (typeof window !== 'undefined') {
    window.scrollToAmenities = scrollToAmenities;
    window.scrollToContact = () => {
      // Scroll to footer contact section
      const footer = document.querySelector('footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    };
  }

  React.useEffect(() => {
    const target = heroSectionRef.current;
    if (!target || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingActions(!entry.isIntersecting);
      },
      {
        threshold: 0.01,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
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
  const projectDirectionsUrl = 'https://www.google.com/maps/search/?api=1&query=16.60108128415813,80.59797237418302';

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
      icon: <CheckCircle className="w-6 h-6 text-g  reen-600" />,
      title: "Fully Approved. Carefully Maintained.",
      description: "CRDA-approved and backed by 5 years of developer maintenance.",
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: "Closer to Everything That Matters",
      description:
        "7.5 km from Vijayawada | 13.5 km from Amaravati Start-up Village & BITS | Near Vijayawada-Nagpur Greenfield Highway",
    },
    {
      icon: <Car className="w-6 h-6 text-purple-600" />,
      title: "Roads That Respect Space and Flow",
      description: "60', 40', and 33' wide internal CC roads, walkways, avenue plantations, and stormwater drains.",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Seamless Systems Beneath the Surface",
      description: "Underground networks for power, water, fiber, and sewage - silent, secure, and future-ready.",
    },
    {
      icon: <Waves className="w-6 h-6 text-cyan-600" />,
      title: "Water That Works, Landscapes That Live",
      description: "Overhead tank with underground supply, STP-connected drainage, and drip irrigation.",
    },
    {
      icon: <Building className="w-6 h-6 text-indigo-600" />,
      title: "A Clubhouse That Feels Like a Second Home",
      description: "Infinity pool, yoga room, gym, party lawn, convention hall, private theatre, and guest rooms.",
    },
    {
      icon: <Users className="w-6 h-6 text-pink-600" />,
      title: "Play Isn't Just for Kids - It's for Community",
      description: "Basketball, net cricket, multi-purpose court, children's play zone, and indoor games.",
    },
    {
      icon: <Trees className="w-6 h-6 text-green-500" />,
      title: "Where Nature is Always Within Reach",
      description: "Central rivulet garden beside the creek, landscaped arrival court, and edge gardens.",
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "Protected. Peaceful. Prepared.",
      description: "8' compound wall with 2' solar fencing, 24x7 gated entry with CCTV, and solar lighting.",
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-600" />,
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
    inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold 
    transition-all duration-300 transform hover:scale-105 hover:shadow-lg
    ${primary
        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
        : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
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
      image: '/kalpabg2.webp',
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
        'CRDA-approved residential plotted development near Vijayawada-Nagpur Greenfield Highway with clubhouse amenities and internal infrastructure.',
    },
    {
      id: 'security',
      navLabel: 'Security',
      eyebrow: 'Security',
      title: '24x7 gated entry and perimeter security',
      description:
        "8' compound wall with 2' solar fencing, 24x7 gated entry with CCTV, and solar lighting.",
      image: '/entry-hero.webp',
      imageSrcSet: SECURITY_HERO_IMAGE_SRC_SET,
      imageSizes: HERO_IMAGE_SIZES,
      alt: demoImg[0].alt,
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        '24x7 gated entry',
        'CCTV',
        'Solar lighting',
      ],
      summaryLabel: 'Facility view',
      summaryTitle: demoImg[0].title,
      summaryText:
        "Grand entrance view supported by the project's gated access, boundary wall, CCTV coverage, and solar lighting.",
    },
    {
      id: 'clubhouse',
      navLabel: 'Clubhouse',
      eyebrow: 'Clubhouse amenities',
      title: 'Clubhouse amenities for everyday living',
      description:
        'Infinity pool, yoga room, gym, party lawn, convention hall, private theatre, and guest rooms.',
      image: '/club-house-hero.webp',
      alt: demoImg[1].alt,
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'Infinity pool',
        'Yoga room & gym',
        'Guest rooms',
      ],
      summaryLabel: 'Facility view',
      summaryTitle: demoImg[1].title,
      summaryText:
        'Clubhouse planning includes wellness, recreation, celebration, and guest stay spaces within the project.',
    },
    {
      id: 'landscape',
      navLabel: 'Landscape',
      eyebrow: 'Landscape',
      title: 'Landscape planning within the layout',
      description:
        'Central rivulet garden beside the creek, landscaped arrival court, and edge gardens.',
      image: '/contour-garden-hero.webp',
      alt: demoImg[2].alt,
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'Rivulet garden',
        'Arrival court',
        'Edge gardens',
      ],
      summaryLabel: 'Facility view',
      summaryTitle: demoImg[2].title,
      summaryText:
        'Green spaces are planned across the arrival and internal landscape zones of the community.',
    },
    {
      id: 'connectivity',
      navLabel: 'Connectivity',
      eyebrow: 'Roads and access',
      title: 'Wide internal roads and regional access',
      description:
        "60', 40', and 33' wide internal CC roads, walkways, avenue plantations, and stormwater drains.",
      image: '/arrival-court-hero.webp',
      alt: demoImg[3].alt,
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'Near Greenfield Highway',
        '7.5 km from Vijayawada',
        '13.5 km from BITS Amaravati',
      ],
      summaryLabel: 'Facility view',
      summaryTitle: demoImg[3].title,
      summaryText:
        'Near Vijayawada-Nagpur Greenfield Highway, with connectivity to Vijayawada and Amaravati-side destinations.',
    },
    {
      id: 'water',
      navLabel: 'Water',
      eyebrow: 'Water and utilities',
      title: 'Water and utility systems below the surface',
      description:
        'Overhead tank with underground supply, STP-connected drainage, and drip irrigation.',
      image: '/lotus-pond-hero.webp',
      alt: demoImg[4].alt,
      imagePosition: 'center center',
      imageScale: 1.03,
      facts: [
        'Underground supply',
        'STP drainage',
        'Drip irrigation',
      ],
      summaryLabel: 'Facility view',
      summaryTitle: demoImg[4].title,
      summaryText:
        'Underground networks are planned for power, water, fiber, and sewage, alongside the project water systems.',
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
    }, 3000);

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
    if (!form.name || !form.phone || !form.preferredDate || !form.preferredTime || !form.pickupAddress.trim()) {
      setToast({ type: 'error', msg: 'Please fill name, phone, date, time slot and pickup address.' });
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
        pickupAddress: form.pickupAddress.trim(),
        pickupMode: form.pickupMode,
        pickupLat: form.pickupLat || undefined,
        pickupLng: form.pickupLng || undefined
      });
      trackGenerateLead({
        form_name: 'kalpavruksha_site_visit_form',
        lead_type: 'site_visit',
        project: 'Kalpavruksha',
        source: 'kalpavruksha_site_visit_modal',
        transport_required: form.transportRequired,
        pickup_mode: form.pickupMode,
      });
      trackScheduleVisit({
        form_name: 'kalpavruksha_site_visit_form',
        project: 'Kalpavruksha',
        source: 'kalpavruksha_site_visit_modal',
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime,
        transport_required: form.transportRequired,
        pickup_mode: form.pickupMode,
      });
      setShowVisitModal(false);
      setForm({
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
      });
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
          href="/kalpabg2-960.webp"
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
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded shadow text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Site Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-[120] flex items-start md:items-center justify-center bg-black/50 overflow-y-auto p-4" onClick={(e) => { if (e.target === e.currentTarget) closeVisitModal(); }}>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl my-6 max-h-[calc(100vh-3rem)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold">Book a Site Visit</h3>
              <button onClick={closeVisitModal} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitSiteVisit} className="flex flex-1 min-h-0 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input name="name" value={form.name} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., 9898899666" required />
                  <p className="text-xs text-gray-500 mt-1">We will also send a WhatsApp update to this number.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input type="date" name="preferredDate" min={todayDate} value={form.preferredDate} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time Slot</label>
                  <div className="border rounded-lg p-2 bg-gray-50 max-h-36 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {VISIT_TIME_SLOTS.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, preferredTime: slot.value }))}
                          className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                            form.preferredTime === slot.value
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:text-emerald-700'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="hidden" name="preferredTime" value={form.preferredTime} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport Required</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Yes', 'No'].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, transportRequired: value }))}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          form.transportRequired === value
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:text-emerald-700'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address Input</label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="pickupMode"
                        value="manual"
                        checked={form.pickupMode === 'manual'}
                        onChange={onChange}
                      />
                      Manual
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="pickupMode"
                        value="map"
                        checked={form.pickupMode === 'map'}
                        onChange={onChange}
                      />
                      Select on Map
                    </label>
                  </div>

                  {form.pickupMode === 'map' && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 mb-2">
                      {!pickupMapApiKey ? (
                        <div className="p-3 text-xs text-gray-600">
                          Map is unavailable right now. Enter the pickup address manually below.
                        </div>
                      ) : pickupMapLoadError ? (
                        <div className="p-3 text-xs text-red-600">
                          Map failed to load. Enter the pickup address manually below.
                        </div>
                      ) : (
                        <Suspense fallback={<div className="p-3 text-xs text-gray-600">Loading map...</div>}>
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

                  <textarea
                    name="pickupAddress"
                    value={form.pickupAddress}
                    onChange={onChange}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={form.pickupMode === 'map' ? 'Click map/drag marker to fill textual address, or type manually' : 'Enter pickup address'}
                    required
                  />
                  {form.pickupMode === 'map' && (
                    <p className="text-xs text-gray-500 mt-1">Tap on map or drag marker to auto-fill a textual address.</p>
                  )}
                </div>
              </div>
              <div className="shrink-0 border-t border-gray-200 bg-white px-6 pt-3 pb-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)]">
                <button type="submit" disabled={submitting} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold ${submitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">You will receive an email and WhatsApp update once submitted.</p>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Layout Download Lead Modal */}
      {downloadAssetKey && activeDownloadAsset && (
        <div
          className="fixed inset-0 z-[120] flex items-start md:items-center justify-center bg-black/50 overflow-y-auto p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeDownloadLeadModal(); }}
        >
          <div className="relative bg-white rounded-2xl w-full max-w-xl shadow-xl my-6 max-h-[calc(100vh-3rem)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-xl font-bold text-gray-900">{activeDownloadAsset.title}</h3>
              <button onClick={closeDownloadLeadModal} className="p-2 rounded hover:bg-white/80" type="button">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitLayoutLead} className="flex flex-1 min-h-0 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeDownloadAsset.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      name="name"
                      value={layoutLeadForm.name}
                      onChange={onLayoutLeadChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      name="phone"
                      value={layoutLeadForm.phone}
                      onChange={onLayoutLeadChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., 9898899666"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={layoutLeadForm.email}
                    onChange={onLayoutLeadChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
                <p className="text-xs text-gray-500">By continuing, you agree to be contacted by Easy Homes regarding this project.</p>
              </div>
              <div className="shrink-0 border-t border-gray-200 bg-white px-6 pt-3 pb-4 shadow-[0_-10px_24px_rgba(15,23,42,0.08)]">
                <button
                  type="submit"
                  disabled={downloadSubmitting}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                >
                  {downloadSubmitting ? 'Submitting...' : 'Submit & Download'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <h1 className="sr-only">
        Kalpavruksha open plots in Vijayawada by Easy Homes
      </h1>
      <Navbar />
      <div className="min-h-screen bg-white overflow-hidden">
        {/* Section 1: Hero Section */}
        <section ref={heroSectionRef} className="relative overflow-hidden bg-[#faf8f3] pt-2 text-slate-900 sm:pt-4 lg:min-h-[calc(100vh-64px)] lg:pt-4">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#fffefb] to-transparent"></div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:flex lg:min-h-[calc(100vh-96px)] lg:flex-col lg:px-8 lg:py-4">
            <div
              className="grid gap-4 sm:gap-5 lg:flex-1 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch lg:gap-6"
              onTouchStart={handleHeroTouchStart}
              onTouchEnd={handleHeroTouchEnd}
              style={{ touchAction: 'pan-y' }}
            >
              <div className="order-2 relative overflow-hidden flex flex-col rounded-[28px] border border-[#e7dfcf] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.08),_transparent_30%),linear-gradient(180deg,_#fffdf8_0%,_#f8f3e8_100%)] px-4 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[32px] sm:px-6 sm:py-6 lg:order-1 lg:h-full lg:min-h-0 lg:px-8 lg:py-8">
                <div className="pointer-events-none absolute -left-10 top-10 h-28 w-28 rounded-full bg-emerald-200/25 blur-3xl"></div>
                <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 rounded-full bg-amber-100/40 blur-3xl"></div>
                <div aria-live="polite" className="relative z-10 flex flex-1 flex-col">
                  <article
                    key={activeHeroSlide.id}
                    className={`flex flex-1 flex-col transition-all duration-500 ease-in-out ${
                      isHeroSlideVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                    }`}
                  >
                    <div className="max-w-[36rem]">
                      <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-800 shadow-[0_10px_24px_rgba(16,185,129,0.08)] backdrop-blur sm:text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]"></span>
                        <span>{activeHeroSlide.eyebrow}</span>
                      </p>
                      <h1 className="mt-5 max-w-[12.8ch] text-[2rem] font-semibold leading-[0.96] tracking-[-0.05em] text-slate-900 sm:text-[2.55rem] md:text-[2.9rem] lg:text-[3.2rem]">
                        {activeHeroSlide.title}
                      </h1>
                      <p className="mt-5 max-w-[33rem] text-[15.5px] leading-7 text-slate-600 sm:text-base sm:leading-8 lg:text-[1.05rem] lg:leading-8">
                        {activeHeroSlide.description}
                      </p>
                      <div className="mt-6 h-px w-full max-w-[34rem] bg-gradient-to-r from-[#dccb9e] via-[#ece3cd] to-transparent"></div>
                    </div>

                    <div className="mt-5 grid max-w-[34rem] grid-cols-1 gap-2.5 min-[480px]:grid-cols-3">
                      {activeHeroSlide.facts.map((fact) => (
                        <div
                          key={fact}
                          className="group relative overflow-hidden rounded-[18px] border border-[#e6dcc7] bg-white/88 px-3.5 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.045)] backdrop-blur-sm transition-transform duration-300"
                        >
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent"></div>
                          <div className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"></span>
                            <span className="text-[0.95rem] font-semibold leading-5 text-slate-700">
                              {fact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                      <div className="mt-8 pt-1 lg:mt-auto lg:pt-8">
                        <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => openDownloadLeadModal('brochure', 'hero_brochure_cta')}
                          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(16,185,129,0.22)] transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-[0_18px_34px_rgba(16,185,129,0.26)] sm:min-h-14 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                        >
                          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Get Brochure</span>
                        </button>
                        <a
                          href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20I%20am%20interested%20in%20Kalpavruksha%20project."
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackKalpavrukshaWhatsAppClick('hero_cta')}
                          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#e7d7ac] bg-[#fffaf0] px-6 py-3.5 text-[15px] font-semibold text-emerald-800 shadow-[0_10px_22px_rgba(242,229,192,0.35)] transition-all duration-300 hover:border-[#dcc58a] hover:bg-white hover:shadow-[0_14px_28px_rgba(242,229,192,0.4)] sm:min-h-14 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                        >
                          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Talk to Us on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <div className="order-1 overflow-hidden rounded-[28px] border border-[#e8e1d0] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[32px] lg:order-2 lg:h-full lg:min-h-0">
                <div className="relative aspect-[16/9] overflow-hidden sm:h-[17rem] sm:aspect-auto md:h-[22rem] lg:h-full">
                  <div
                    className={`h-full w-full transition-all duration-500 ease-in-out ${
                      isHeroSlideVisible ? 'scale-100 opacity-100' : 'scale-[1.02] opacity-0'
                    }`}
                  >
                    <img
                      key={activeHeroSlide.id}
                      src={activeHeroSlide.image}
                      srcSet={activeHeroSlide.imageSrcSet}
                      sizes={activeHeroSlide.imageSizes}
                      alt={activeHeroSlide.alt}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out"
                      style={{
                        objectPosition: activeHeroSlide.imagePosition || 'center center',
                        transformOrigin: 'center center',
                        transform: `scale(${activeHeroSlide.imageScale || 1})`,
                      }}
                      fetchPriority={activeHeroSlideIndex === 0 ? 'high' : 'auto'}
                      decoding="async"
                      loading={activeHeroSlideIndex === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
                <div className="min-h-[4.5rem] border-t border-[#eee4cf] bg-[linear-gradient(180deg,_#fffdf8_0%,_#faf5e9_100%)] px-4 py-3.5 md:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {heroSlides.map((slide, index) => {
                        const isActive = index === activeHeroSlideIndex;
                        return (
                          <button
                            key={slide.id}
                            type="button"
                            aria-label={`Show ${slide.navLabel} slide`}
                            onClick={() => changeHeroSlide(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              isActive ? 'w-7 bg-emerald-600' : 'w-2.5 bg-[#d8ccb0] hover:bg-[#bfae82]'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goToPreviousHeroSlide}
                        aria-label="Show previous slide"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e6dcc6] bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-emerald-200 hover:text-emerald-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextHeroSlide}
                        aria-label="Show next slide"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e6dcc6] bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-emerald-200 hover:text-emerald-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: From Longing to Belonging */}
        <div ref={aboutRef} />
        <section id="about" className="py-20 bg-gradient-to-b from-white to-gray-50" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
              From Longing to <span className="text-emerald-600">Belonging</span>
            </h2>

            <div className="prose prose-lg md:prose-xl mx-auto text-gray-700 leading-relaxed">
              <p className="mb-6">
                Some journeys don't begin with a destination. They begin with a feeling -
                and some places bring a stillness so true, your heart remembers it.
              </p>

              <p className="mb-6">
                Kalpavruksha was shaped by that search. Not just to be seen, but to be felt.
                And when you stand here - with hills behind you and the creek beside you -
                something in you softens.
              </p>

              <p className="text-xl font-semibold text-emerald-600">
                This isn't just arrival. It's belonging.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Video Walkthrough */}
        <section className="py-20 bg-gray-900" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 ">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                A Glimpse of What <span className="text-emerald-400">Belonging</span> Looks Like
              </h2>
              <p className="text-xl text-gray-300">
                Let Kalpavruksha reveal itself - in motion, in flow, in feeling.
              </p>
              <p className="text-gray-400 mt-2">
                Watch the vision unfold before your visit
              </p>
            </div>

            <div className="relative aspect-video bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl overflow-hidden shadow-2xl">
              <YouTubeLiteEmbed
                videoId="mt-G29uakpQ"
                title="Project Walkthrough Video"
                description="Experience Kalpavruksha before you visit"
                posterSrc="/kalpabg2-960.webp"
                posterSrcSet={HERO_IMAGE_SRC_SET}
                posterSizes={WALKTHROUGH_POSTER_SIZES}
              />
            </div>
          </div>
        </section>

        {/* Section 4: Project Renderings Gallery */}
        <div ref={galleryRef} />
        <section id="gallery" className="py-20 bg-white" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Picture the Life That <span className="text-emerald-600">Awaits</span>
              </h2>
              <p className="text-xl text-gray-600">
                Every space rendered with care - so you can feel it before it's real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoImg.map((item, index) => (
                <div key={index}
                  onClick={() => openModal(item)}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                    </div>
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
        <section id="amenities" className="py-20 bg-white" style={DEFERRED_SECTION_STYLE}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                What Sets <span className="text-emerald-600">Kalpavruksha</span> Apart
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Some places are where you stay - but some places stay with you.
                Kalpavruksha is built with quiet assurances that go beyond the sale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">{feature.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {index + 1}. {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Community Details */}
        <section className="py-20 bg-white" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                A Community Drawn with <span className="text-emerald-600">Intention</span>
              </h2>
              <p className="text-xl text-gray-600">
                From plot sizes to pathways, everything at Kalpavruksha has been shaped
                to bring balance, beauty, and belonging.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Project Snapshot</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projectSnapshotStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 p-5 shadow-sm"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {item.label}
                      </p>
                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-slate-900">{item.value}</span>
                        <span className="text-sm font-semibold text-emerald-600">{item.unit}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4">
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
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-lg">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
                    Master Plan Layout
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Every plot and pathway - drawn with care, not just to optimize space,
                    but to cultivate a lifestyle.
                  </p>

                  {/* Landscape aspect ratio for layout image */}
                  <div className="aspect-[16/9] bg-white rounded-lg shadow-inner cursor-pointer flex items-center justify-center overflow-hidden" onClick={() => setSelectedImage({ image: require('../assets/kalpavruksha/layout.webp'), title: 'Kalpavruksha Project Master Layout', alt: 'Kalpavruksha Project Master Layout - CRDA Approved Plots Map' })}>
                    <img
                      src={require('../assets/kalpavruksha/layout.webp')}
                      alt="Kalpavruksha Project Master Layout - CRDA Approved Plots Map"
                      className="object-contain w-full h-full rounded-lg transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      style={{ maxHeight: '320px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click image to enlarge</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Location */}
        <div ref={locationRef} />
        <section id="location" className="py-20 bg-slate-50" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
                Property Location
              </div>
              <h2 className="mt-5 text-3xl md:text-5xl font-bold text-slate-900">
                Connected to Vijayawada. <br />
                <span className="text-emerald-600">Positioned for everyday convenience.</span>
              </h2>
              <p className="mt-5 text-lg md:text-xl text-slate-600">
                A project location that keeps daily access practical while preserving a quieter plotted community setting.
              </p>
            </div>

            <div className="mt-14 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
              <div className="grid grid-cols-1 lg:grid-cols-[0.86fr,1.14fr]">
                <div className="border-b border-slate-200 p-6 md:p-8 lg:border-b-0 lg:border-r">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Property Location</p>
                      <h3 className="mt-1 text-2xl font-bold leading-tight text-slate-900">
                        {projectLocationTitle}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        The project sits on a well-connected corridor near Vijayawada, with practical access to highway links, city infrastructure, and Amaravati-side growth zones.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Address Summary</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {projectLocationAddress}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={projectDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackKalpavrukshaDirectionsClick('location_section')}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-md"
                    >
                      Get Directions
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => openVisitModal('location_section')}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-white hover:text-emerald-700 hover:shadow-sm"
                    >
                      <MapPin className="h-4 w-4" />
                      Book Site Visit
                    </button>
                  </div>
                </div>

                <div className="bg-slate-100">
                  <div className="h-full min-h-[380px] lg:min-h-[100%]">
                    {shouldLoadTravelMap ? (
                      <Suspense
                        fallback={
                          <div className="flex h-full min-h-[380px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)]">
                            <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
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
                      <div className="flex h-full min-h-[380px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)]">
                        <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
                          Preparing interactive map...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
              <div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Location Highlights
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-slate-900">
                    Key distance markers from the project
                  </h3>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {locationHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-slate-200">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold leading-snug text-slate-900">{item.title}</h3>
                      {item.detail && (
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
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
        <section className="py-20 bg-white" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Frequently Asked Questions
              </div>
              <h2 className="mt-5 text-3xl md:text-5xl font-bold text-slate-900">
                Questions buyers usually ask before the first visit
              </h2>
              <p className="mt-5 text-lg text-slate-600">
                Tap a question to view the answer. The section stays clean until someone wants the detail.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-base md:text-lg font-semibold leading-snug text-slate-900">
                        {item.question}
                      </span>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 border-emerald-200 bg-emerald-50 text-emerald-700' : ''}`}>
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="border-t border-slate-100 px-5 py-4 md:px-6">
                          <p className="max-w-3xl text-sm md:text-base leading-relaxed text-slate-600">
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
        <section className="py-20 bg-gradient-to-b from-white to-gray-50" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Journey Home <span className="text-emerald-600">Begins Here</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Every lasting story begins with one step. Let's take it together.
            </p>

            <div className="space-y-6">
              <CTAButton
                icon={<MapPin className="w-5 h-5" />}
                text="Schedule a Site Visit"
                primary
                onClick={() => openVisitModal('journey_home')}
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20I%20am%20interested%20in%20Kalpavruksha."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackKalpavrukshaWhatsAppClick('journey_home')}
                >
                  <CTAButton
                    icon={<MessageCircle className="w-5 h-5" />}
                    text="Talk to Us on WhatsApp"
                  />
                </a>
                <CTAButton
                  icon={<Phone className="w-5 h-5" />}
                  text="Request a Callback"
                  onClick={goToHomeCallToAction}
                />
                <CTAButton
                  icon={<Download className="w-5 h-5" />}
                  text="Download Project Brochure"
                  onClick={() => openDownloadLeadModal('brochure', 'journey_home')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Testimonials */}
        <section className="py-20 bg-white" style={DEFERRED_SECTION_STYLE}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-9">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Voices That Speak for <span className="text-emerald-600">Kalpavruksha</span>
              </h2>
              <div className="rounded-2xl text-center">
                <p className="text-gray-600 text-xl">
                  See what our customers are saying on {' '}
                  <span className="mb-4">
                    <span className='text-blue-500'>G</span>
                    <span className='text-red-500'>o</span>
                    <span className='text-yellow-500'>o</span>
                    <span className='text-blue-500'>g</span>
                    <span className='text-green-500'>l</span>
                    <span className='text-red-500'>e</span>
                    <span className='text-red-500'>{'  '}</span>
                  </span>
                  Reviews
                </p>
                <Suspense fallback={<div className="mt-8 h-24 rounded-2xl bg-slate-100" />}>
                  <ReviewsSection />
                </Suspense>
                <div className="max-w-4xl mx-auto mt-10 px-4 text-left">
                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/35 to-slate-50 p-6 md:p-8 shadow-lg">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-50 border border-emerald-100 text-emerald-700 mb-4">
                      Buyer Decision Guide
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-emerald-500/80 via-teal-500/50 to-transparent mb-5" />
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                      Why Kalpavruksha Is a Preferred Choice for Plot Buyers
                    </h3>
                    <p className="text-slate-700 leading-relaxed mb-6 max-w-3xl">
                      Plot buyers usually evaluate three things first: legal clarity, daily convenience, and on-ground readiness.
                      Kalpavruksha performs strongly on all three.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="rounded-xl border border-slate-200 border-t-2 border-t-emerald-400/70 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-300">
                        <h4 className="font-semibold text-slate-900 mb-2">1. Clear Approvals</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          CRDA approvals, boundaries, and registration details are easier to verify.
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 border-t-2 border-t-emerald-400/70 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-300">
                        <h4 className="font-semibold text-slate-900 mb-2">2. Practical Location</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          The site connects well to Vijayawada, Amaravati corridors, and major roads.
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 border-t-2 border-t-emerald-400/70 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-300">
                        <h4 className="font-semibold text-slate-900 mb-2">3. Visible Infrastructure</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Roads, utilities, and drainage planning are visible during site inspection.
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium">
                      Compare documents, check the layout, and visit the site to decide with confidence.
                    </p>
                  </div>
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
                <div className="rounded-[28px] border border-[#dfe9d5] bg-white/96 p-3.5 shadow-[0_24px_55px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                  <div className="px-2 pb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                      Quick Actions
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Everything important, one tap away.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openVisitModal('mobile_quick_actions');
                  }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-emerald-100 bg-[#f7fbf5] px-4 py-3 text-left text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Schedule Site Visit</span>
                          <span className="block text-xs text-slate-500">Pick your preferred day and time</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('layout', 'mobile_quick_actions');
                  }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-emerald-100 bg-[#f7fbf5] px-4 py-3 text-left text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <Download className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Download Layout PDF</span>
                          <span className="block text-xs text-slate-500">Get the approved master layout</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('brochure', 'mobile_quick_actions');
                  }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-emerald-100 bg-[#f7fbf5] px-4 py-3 text-left text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <Download className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Download Brochure</span>
                          <span className="block text-xs text-slate-500">Get the full project brochure</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </button>

                    <a
                      href={projectDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsQuickActionsOpen(false)}
                      className="flex w-full items-center justify-between rounded-[22px] border border-emerald-100 bg-[#f7fbf5] px-4 py-3 text-left text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Get Directions</span>
                          <span className="block text-xs text-slate-500">Open the route in Google Maps</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </a>

                    <a
                      href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20please%20contact%20me%20regarding%20Kalpavruksha."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        trackKalpavrukshaWhatsAppClick('desktop_quick_actions');
                      }}
                      className="flex w-full items-center justify-between rounded-[22px] border border-emerald-100 bg-[#f7fbf5] px-4 py-3 text-left text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <FaWhatsapp className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Chat on WhatsApp</span>
                          <span className="block text-xs text-slate-500">Speak to the sales team directly</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickActionsOpen((current) => !current)}
                aria-expanded={isQuickActionsOpen}
                aria-controls="kalpavruksha-quick-actions"
                className="inline-flex h-14 items-center gap-2 rounded-l-full border border-r-0 border-[#d8c995] bg-gradient-to-r from-[#0f7b63] to-[#0e8f72] pl-4 pr-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(15,123,99,0.28)] transition-all duration-200 hover:pr-4 hover:shadow-[0_20px_42px_rgba(15,123,99,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
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
                className="inline-flex min-h-14 items-center gap-2 rounded-full border border-[#d8c995] bg-white/95 px-5 text-sm font-semibold text-emerald-900 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#0f7b63] to-[#0e8f72] text-white">
                  <Zap className="h-4 w-4" />
                </span>
                <span>Quick Actions</span>
                <ChevronDown className={`h-4 w-4 text-emerald-700 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {shouldShowFloatingActions && isQuickActionsOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/28 backdrop-blur-[2px]"
              aria-label="Close quick actions"
              onClick={() => setIsQuickActionsOpen(false)}
            />
            <div
              id="kalpavruksha-mobile-quick-actions"
              className="absolute inset-x-0 bottom-0 rounded-t-[32px] border-t border-[#dfe9d5] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 shadow-[0_-24px_60px_rgba(15,23,42,0.18)]"
            >
              <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                    Quick Actions
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Everything important in one place
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Fast actions for site visit, layout, directions, and direct contact.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    trackKalpavrukshaDirectionsClick('mobile_quick_actions');
                  }}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-200 hover:bg-white hover:text-slate-900"
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
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#dfe9d5] bg-[#f7fbf5] px-4 py-4 text-left shadow-sm transition-all duration-200"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">Schedule Site Visit</span>
                      <span className="block text-xs leading-5 text-slate-500">Choose a day and time that suits you</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('layout', 'desktop_quick_actions');
                  }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#dfe9d5] bg-[#f7fbf5] px-4 py-4 text-left shadow-sm transition-all duration-200"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                      <Download className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">Download Layout PDF</span>
                      <span className="block text-xs leading-5 text-slate-500">Get the approved master layout instantly</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    openDownloadLeadModal('brochure', 'desktop_quick_actions');
                  }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#dfe9d5] bg-[#f7fbf5] px-4 py-4 text-left shadow-sm transition-all duration-200"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                      <Download className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">Download Brochure</span>
                      <span className="block text-xs leading-5 text-slate-500">Get the full project brochure instantly</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </button>

                <a
                  href={projectDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        trackKalpavrukshaDirectionsClick('desktop_quick_actions');
                      }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#dfe9d5] bg-[#f7fbf5] px-4 py-4 text-left shadow-sm transition-all duration-200"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">Get Directions</span>
                      <span className="block text-xs leading-5 text-slate-500">Open the route directly in Google Maps</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </a>

                <a
                  href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20please%20contact%20me%20regarding%20Kalpavruksha."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    trackKalpavrukshaWhatsAppClick('mobile_quick_actions');
                  }}
                  className="flex w-full items-center justify-between rounded-[24px] border border-[#dfe9d5] bg-[#f7fbf5] px-4 py-4 text-left shadow-sm transition-all duration-200"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                      <FaWhatsapp className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">Chat on WhatsApp</span>
                      <span className="block text-xs leading-5 text-slate-500">Connect with the sales team directly</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 pb-24 pt-12 text-white lg:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <TreePine className="w-8 h-8 text-emerald-400" />
                  <span className="ml-2 text-xl font-bold">Kalpavruksha</span>
                </div>
                <p className="text-gray-400">
                  by Easy Homes - Creating communities where hearts belong
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={scrollToAbout} className="footer-slide-link bg-transparent border-none outline-none p-0">About Project</button></li>
                  <li><button onClick={scrollToLocation} className="footer-slide-link bg-transparent border-none outline-none p-0">Location</button></li>
                  <li><button onClick={scrollToAmenities} className="footer-slide-link bg-transparent border-none outline-none p-0">Amenities</button></li>
                  <li><button onClick={scrollToGallery} className="footer-slide-link bg-transparent border-none outline-none p-0">Gallery</button></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                <div className="flex gap-4">
                  <a href="tel:+918988896666" onClick={() => trackKalpavrukshaCallClick('footer_contact')}>
                    <CTAButton
                      icon={<Phone className="w-4 h-4 " />}
                      text="Call Now"
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

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Kalpavruksha by Easy Homes. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default KalpavrukshaPage;
