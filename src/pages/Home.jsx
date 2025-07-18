// client/src/pages/Home.jsx
import React, { useRef } from 'react';
import { Helmet } from 'react-helmet-async';

import Projects from '../components/Home/Projects';
import Features from '../components/Home/Features';
import Hero from '../components/Home/Hero';
import Footer from '../components/Home/Footer';
import HowItWorks from '../components/Home/HowItWorks';
import Testimonials from '../components/Home/Testimonials';
import CallToAction from '../components/Home/CallToAction';
import FeaturedProjects from '../components/Home/FeaturedProject';

export default function Home() {
  const featuredRef = useRef(null);
  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // JSON‑LD structured data snippets
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
      "streetAddress": "123 Capital Avenue",
      "addressLocality": "Amaravati",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "522020",
      "addressCountry": "IN"
    },
    "url": "https://easyhomess.com/",
    "areaServed": ["Vijayawada", "Amaravati"]
  };

  return (
    <>
      <Helmet>
        {/* Primary SEO tags */}
        <title>Easy Homes | CRDA‑Approved Plots in Amaravati & Vijayawada</title>
        <meta
          name="description"
          content="Discover 100% verified, CRDA‑approved residential plots in Amaravati and Vijayawada. Instantly compare, shortlist, and secure clear‑title land."
        />
        <meta
          name="keywords"
          content="Easy Homes, easy homes, CRDA approved plots, Amaravati real estate, Vijayawada property, verified plots, clear title land"
        />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://easyhomess.com/" />

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

      <main>
        {/* Hero */}
        <Hero scrollToFeatured={scrollToFeatured} />

        {/* Featured Projects */}
        <FeaturedProjects cref={featuredRef} />

        {/* All Projects */}
        <Projects />

        {/* How It Works */}
        <HowItWorks />

        {/* Features */}
        <Features />

        {/* Testimonials */}
        <Testimonials />

        {/* Call To Action */}
        <CallToAction />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
