// client/src/pages/Home.jsx
import React, { useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import Projects from "../components/Home/Projects";
import Features from "../components/Home/Features";
import Hero from "../components/Home/Hero";
import Footer from "../components/Home/Footer";
import { useState } from "react";
import HowItWorks from "../components/Home/HowItWorks";
import Testimonials from "../components/Home/Testimonials";
import CallToAction from "../components/Home/CallToAction";
import FeaturedProjects from "../components/Home/FeaturedProject";

export default function Home() {
  const featuredRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const [toast, setToast] = useState(null);

  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Smooth scroll to #contact if navigated with hash
  useEffect(() => {
    if (window.location.hash === "#contact") {
      setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /* ---------- Structured Data ---------- */

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://easyhomess.com/"
      }
    ]
  };

  const orgData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Easy Homes",
    "url": "https://easyhomess.com/",
    "telephone": "+918988896666",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vijayawada",
      "addressRegion": "Andhra Pradesh",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.facebook.com/easyhomes",
      "https://www.instagram.com/easyhomes"
    ]
  };

  const siteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://easyhomess.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://easyhomess.com/searchProperties?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
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

  return (
    <>
      <Helmet>
        {/* Primary SEO */}
        <title>
          Easy Homes | CRDA-Approved Plots in Amaravati & Vijayawada
        </title>

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Easy Homes" />
        <meta property="og:title" content="Easy Homes | CRDA-Approved Plots in Amaravati & Vijayawada" />
        <meta
          property="og:description"
          content="Explore verified CRDA-approved plots in Amaravati and Vijayawada. Clear titles, trusted developers, and transparent pricing."
        />
        <meta property="og:url" content="https://easyhomess.com/" />
        <meta
          property="og:image"
          content="https://easyhomess.com/logo.png"
        />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://easyhomess.com/logo.png" />

        <meta
          name="description"
          content="Discover 100% CRDA-approved residential plots in Amaravati and Vijayawada. Compare verified projects, clear titles, amenities, pricing, and secure trusted land with Easy Homes."
        />

        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://easyhomess.com/" />

        {/* Open Graph (Social Sharing) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Easy Homes | CRDA-Approved Plots in Amaravati & Vijayawada" />
        <meta property="og:description" content="Explore verified CRDA-approved plots in Amaravati and Vijayawada. Clear titles, trusted developers, and transparent pricing with Easy Homes." />
        <meta property="og:url" content="https://easyhomess.com/" />
        <meta property="og:image" content="https://easyhomess.com/og-home.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(orgData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(siteData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessData)}
        </script>
      </Helmet>

      {toast && (
        <div style={{position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999}}>
          <div className="bg-[#3868B2] text-white px-6 py-3 rounded-lg shadow-lg font-poppins text-base animate-fade-in">
            {toast}
          </div>
        </div>
      )}
      <main>
        <Hero scrollToFeatured={scrollToFeatured} />
        <FeaturedProjects cref={featuredRef} />
        <Projects />
        <HowItWorks />
        {/* About Section Anchor */}
        <div ref={aboutRef} />
        <Features />
        <Testimonials />
        {/* Contact Section Anchor */}
        <div ref={contactRef} />
        <CallToAction />
        <Footer
          onAboutClick={scrollToAbout}
          onContactClick={scrollToContact}
          onTermsClick={() => showToast("Terms & Conditions page is under development.")}
          onPrivacyClick={() => showToast("Privacy Policy page is under development.")}
        />
      </main>
    </>
  );
}

