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

  // Breadcrumb structured data
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

  return (
    <>
      <Helmet>
        {/* Core SEO tags */}
        <title>Easy Homes | CRDA‑Approved Plots in Amaravati & Vijayawada</title>
        <meta
          name="description"
          content="Discover 100% verified, CRDA‑approved residential plots in Amaravati and Vijayawada. Instantly compare, shortlist, and secure clear‑title land."
        />
        <link rel="canonical" href="https://easyhomess.com/" />

        {/* Breadcrumb JSON‑LD */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
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
          <Features />

        {/* Testimonials */}
          <Testimonials />

          <CallToAction />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}

