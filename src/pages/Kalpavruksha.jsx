import React, { useState } from 'react';
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
  Menu,
  X,
  Star
} from 'lucide-react';
import card, { CardContent } from '../components/card';
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom';
import ReviewsSection from '../components/ReviewProject';
import api from '../api';

const KalpavrukshaPage = () => {
  // ...existing code...
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', preferredDate: '' });
  const [toast, setToast] = useState(null);

  // Footer quick link refs and scroll handlers (like Home page)
  const aboutRef = React.useRef(null);
  const locationRef = React.useRef(null);
  const amenitiesRef = React.useRef(null);
  const galleryRef = React.useRef(null);
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
  /* ---------------- SEO STRUCTURED DATA ---------------- */

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": "Kalpavruksha Open Plots",
    "description":
      "CRDA-approved residential open plots near Vijayawada and Amaravati by Easy Homes. Premium gated community with clubhouse, infrastructure, and clear title.",
    "url": "https://easyhomess.com/projects",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vijayawada",
      "addressRegion": "Andhra Pradesh",
      "addressCountry": "IN"
    },
    "provider": {
      "@type": "RealEstateAgent",
      "name": "Easy Homes",
      "telephone": "+918988896666"
    }
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
        "7 km from Vijayawada • 12.5 km from Amaravati's Startup Village & BITS • Adjacent to Vijayawada–Nagpur Greenfield Highway",
    },
    {
      icon: <Car className="w-6 h-6 text-purple-600" />,
      title: "Roads That Respect Space and Flow",
      description: "60', 40', and 33' wide internal CC roads, walkways, avenue plantations, and stormwater drains.",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Seamless Systems Beneath the Surface",
      description: "Underground networks for power, water, fiber, and sewage — silent, secure, and future-ready.",
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
      title: "Play Isn't Just for Kids — It's for Community",
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
      title: "Designed Not Just to Last — But to Mean Something",
      description: "More than a layout — a vision grounded in values for your family's legacy.",
    },
  ]

  const CTAButton = ({
    icon,
    text,
    primary = false,
    onClick,
    href,
    target,
  }) => {
    const classes = `
    inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold 
    transition-all duration-300 transform hover:scale-105 hover:shadow-lg
    ${primary
        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
        : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
      }
  `;

    // 👉 If link exists, render <a>
    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className={classes}
        >
          {icon}
          <span>{text}</span>
        </a>
      );
    }

    // 👉 Default: button
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

  const openVisitModal = () => setShowVisitModal(true);
  const closeVisitModal = () => setShowVisitModal(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitSiteVisit = async (e) => {
    e?.preventDefault?.();
    if (!form.name || !form.phone || !form.preferredDate) {
      setToast({ type: 'error', msg: 'Please enter name, phone and date.' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/api/site-visits', {
        project: 'Kalpavruksha',
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        preferredDate: form.preferredDate,
      });
      setToast({ type: 'success', msg: 'Request received. We will confirm shortly.' });
      setShowVisitModal(false);
      setForm({ name: '', phone: '', email: '', preferredDate: '' });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      setToast({ type: 'error', msg });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 4000);
    }
  };
  return (
    <>
      <Helmet>
        <title>
          Kalpavruksha Open Plots in Vijayawada | CRDA Approved Plots Near Amaravati
        </title>

        <meta
          name="description"
          content="Kalpavruksha by Easy Homes offers CRDA-approved open plots near Vijayawada & Amaravati. Premium gated layout with clubhouse, infrastructure & clear title."
        />

        <meta
          name="keywords"
          content="Kalpavruksha plots, CRDA approved plots Vijayawada, open plots near Amaravati, Easy Homes projects, gated community plots Andhra Pradesh"
        />

        <link rel="canonical" href="https://easyhomess.com/projects" />
        <meta name="robots" content="index,follow" />

        <script type="application/ld+json">
          {JSON.stringify(projectSchema)}
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) closeVisitModal(); }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Book a Site Visit</h3>
              <button onClick={closeVisitModal} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitSiteVisit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date & Time</label>
                <input type="datetime-local" name="preferredDate" value={form.preferredDate} onChange={onChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>
              <button type="submit" disabled={submitting} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold ${submitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <p className="text-xs text-gray-500 text-center">You will receive an email and WhatsApp update once submitted.</p>
            </form>
          </div>
        </div>
      )}
      <h1 className="sr-only">
        Kalpavruksha Project
        <Link to="/searchProperties">View All Projects</Link>
      </h1>
      <Navbar />
      <div className="min-h-screen bg-white overflow-hidden">
        {/* Section 1: Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-16">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b3b26]/80 via-[#295638]/60  to-transparent"></div>
          <picture className="absolute inset-0 w-full h-full z-0 block">
            <source
              media="(min-width: 768px)"
              srcSet="kalpPcImg.webp"
              type="image/webp"
            />
            <source
              media="(max-width: 767px)"
              srcSet="kalpPhImg.webp"
              type="image/webp"
            />
            <img
              src="/kalpPcImg.webp"
              alt="Kalpavruksha Hero"
              className="w-full h-full object-cover opacity-80 aspect-[16/9]"
              fetchpriority="high"
              decoding="async"
            />
          </picture>


          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className='rounded-full shadow  px-3 md:px-4 py-0 max-h-fit bg-[#dbba5733] max-w-fit mx-auto border border-[#f2e5c0] mb-4 lg:mb-12'>
              <p className="text-sm md:text-base text-[#f2e5c0]  font-medium tracking-wide ">
                CRDA-Approved Open Plots in Vijayawada
              </p>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-[#fbfaf9] mb-6 leading-tight">
              Where You Don't Just <br />
              Arrive — <span className='text-[#f2e5c0]'>You Belong</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              It's not just the feeling of arriving somewhere new — but somewhere<br />
              right, where your heart belongs. Just 12 mins from Amaravati.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="/mainBrouche.pdf"
                download
                className="inline-flex items-center h-fit w-fit  text-white rounded-full transition duration-200"
              >
                <CTAButton
                  icon={<Download className="w-5 h-5" />}
                  text="Get Brochure"
                  primary
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900"
                /></a>
              {/* <CTAButton
                icon={<MapPin className="w-5 h-5" />}
                text="Schedule Site Visit"
                className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
              /> */}
              <a
                href="https://wa.me/918988896666?text=Hi%20Easy%20Homes,%20I%20am%20interested%20in%20Kalpavruksha%20project."
                target="_blank"
                rel="noopener noreferrer"
              >
                <CTAButton
                  icon={<MessageCircle className="w-5 h-5" />}
                  text="Talk to Us on WhatsApp"
                  className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                />
              </a>
            </div>

            {/* <CTAButton
              icon={<Phone className="w-5 h-5" />}
              text="Request a Callback"
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
            /> */}
          </div>
        </section>

        {/* Section 2: From Longing to Belonging */}
        <div ref={aboutRef} />
        <section id="about" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
              From Longing to <span className="text-emerald-600">Belonging</span>
            </h2>

            <div className="prose prose-lg md:prose-xl mx-auto text-gray-700 leading-relaxed">
              <p className="mb-6">
                Some journeys don't begin with a destination. They begin with a feeling —
                and some places bring a stillness so true, your heart remembers it.
              </p>

              <p className="mb-6">
                Kalpavruksha was shaped by that search. Not just to be seen, but to be felt.
                And when you stand here — with hills behind you and the creek beside you —
                something in you softens.
              </p>

              <p className="text-xl font-semibold text-emerald-600">
                This isn't just arrival. It's belonging.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Video Walkthrough */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 ">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                A Glimpse of What <span className="text-emerald-400">Belonging</span> Looks Like
              </h2>
              <p className="text-xl text-gray-300">
                Let Kalpavruksha reveal itself — in motion, in flow, in feeling.
              </p>
              <p className="text-gray-400 mt-2">
                Watch the vision unfold before your visit
              </p>
            </div>

            <div className="relative aspect-video bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                className="w-full aspect-video"
                src="https://www.youtube.com/embed/mt-G29uakpQ?autoplay=1&mute=1&loop=1&playlist=mt-G29uakpQ"
                title="YouTube video player"
                frameBorder="0"
                loading='lazy'
                allow="autoplay; fullscreen"
              ></iframe>
              <div className="absolute bottom-4 left-4 right-4 hidden md:block">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white font-medium">Project Walkthrough Video</p>
                  <p className="text-gray-300 text-sm">Experience Kalpavruksha before you visit</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Project Renderings Gallery */}
        <div ref={galleryRef} />
        <section id="gallery" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Picture the Life That <span className="text-emerald-600">Awaits</span>
              </h2>
              <p className="text-xl text-gray-600">
                Every space rendered with care — so you can feel it before it's real.
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
        <section id="amenities" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                What Sets <span className="text-emerald-600">Kalpavruksha</span> Apart
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Some places are where you stay — but some places stay with you.
                Kalpavruksha is built with quiet assurances that go beyond the sale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <card
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
                </card>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Community Details */}
        <section className="py-20 bg-white">
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

                <div className="space-y-6">
                  {[
                    { label: "Total Area", value: "9 Acres" },
                    { label: "Number of Plots", value: "101 Plots" },
                    { label: "Plot Size Range", value: "162 to 525 Sq Yards" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="text-xl font-bold text-emerald-600">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4">
                  <a
                    href="/Kalpavruksha Master Layout.pdf"
                    download
                    className="inline-flex items-center h-fit w-fit  text-white rounded-full transition duration-200"
                  >
                    <CTAButton
                      icon={<Download className="w-5 h-5" />}
                      text="Download Layout PDF"
                      primary
                    /></a>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <CTAButton
                      icon={<MapPin className="w-5 h-5" />}
                      text="Book a Site Visit"
                      onClick={openVisitModal}
                    />
                    <CTAButton
                      icon={<MessageCircle className="w-5 h-5" />}
                      text="Chat on WhatsApp"
                      href="https://wa.me/918988896666?text=Hi%20Easy%20Homes,%20I%20want%20to%20book%20a%20site%20visit%20for%20Kalpavruksha."
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
                    Every plot and pathway — drawn with care, not just to optimize space,
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
        <section id="location" className="py-20 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              Moments from the City. <br />
              <span className="text-emerald-300">Miles from the Noise.</span>
            </h2>
            <p className="text-xl text-emerald-100">
              Between Vijayawada's pulse and Amaravati's promise,
              Kalpavruksha finds the perfect pause.
            </p>
          </div>
        </section>

        {/* Section 8: Journey Home */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
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
                onClick={openVisitModal}
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://wa.me/918988896666?text=Hi%20Easy%20Homes,%20I%20am%20interested%20in%20Kalpavruksha."
                  target="_blank"
                  rel="noopener noreferrer"
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
                <a
                  href="/mainBrouche.pdf"
                  download
                  className="inline-flex items-center h-fit w-fit  text-white rounded-full transition duration-200"
                >
                  <CTAButton
                    icon={<Download className="w-5 h-5" />}
                    text="Download Project Brochure"
                  /></a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Testimonials */}
        <section className="py-20 bg-white">
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
                <ReviewsSection />
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
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
                  <a href="tel:+918988896666">
                    <CTAButton
                      icon={<Phone className="w-4 h-4 " />}
                      text="Call Now"
                    />
                  </a>
                  <div>
                    <a
                      href="https://wa.me/918988896666?text=Hi%20Easy%20Homes,%20please%20contact%20me%20regarding%20Kalpavruksha."
                      target="_blank"
                      rel="noopener noreferrer"
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
