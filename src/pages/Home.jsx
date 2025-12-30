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
  // Expose scrollToContact and scrollToAbout globally for Navbar/Features buttons
  if (typeof window !== 'undefined') {
    window.scrollToContact = scrollToContact;
    window.scrollToAbout = scrollToAbout;
  }

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
      "streetAddress": "4th Floor, adjacent to GIG International School, Gollapudi",
      "addressLocality": "Vijayawada",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "521225",
      "addressCountry": "IN"
    }
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
        {/* Primary SEO with all target keywords */}
        <title>Easy Homes | CRDA-Approved Plots in Amaravati & Vijayawada</title>
        <meta name="description" content="View details and compare CRDA-approved residential plots in Andhra Pradesh. Find your ideal plot in Amaravati, Vijayawada, and more. Explore plot listings, view amenities, and get all details with Easy Homes." />
        <meta name="keywords" content="plot, andhra, pradesh, view, details, plots in Andhra Pradesh, plot view, plot details, buy plot Andhra Pradesh, Amaravati, Vijayawada" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://easyhomess.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Easy Homes" />
        <meta property="og:title" content="Andhra Pradesh Plot View Details | Buy Plots in Andhra Pradesh | Easy Homes" />
        <meta property="og:description" content="View details and compare CRDA-approved residential plots in Andhra Pradesh. Find your ideal plot in Amaravati, Vijayawada, and more. Explore plot listings, view amenities, and get all details with Easy Homes." />
        <meta property="og:url" content="https://easyhomess.com/" />
        <meta property="og:image" content="https://easyhomess.com/logo.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Andhra Pradesh Plot View Details | Buy Plots in Andhra Pradesh | Easy Homes" />
        <meta name="twitter:description" content="View details and compare CRDA-approved residential plots in Andhra Pradesh. Find your ideal plot in Amaravati, Vijayawada, and more. Explore plot listings, view amenities, and get all details with Easy Homes." />
        <meta name="twitter:image" content="https://easyhomess.com/logo.png" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
        <script type="application/ld+json">{JSON.stringify(orgData)}</script>
        <script type="application/ld+json">{JSON.stringify(siteData)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessData)}</script>
      </Helmet>

        {/* SEO Headings for keyword coverage */}
        <h1 style={{display:'none'}}>Andhra Pradesh Plot View Details</h1>
        <h2 style={{display:'none'}}>Plot Listings in Andhra Pradesh</h2>
        <h2 style={{display:'none'}}>View Plot Details in Andhra Pradesh</h2>
        <h2 style={{display:'none'}}>Andhra Pradesh Plot Amenities and Features</h2>
        <h2 style={{display:'none'}}>Compare Plots in Andhra Pradesh</h2>
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

