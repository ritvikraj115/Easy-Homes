import React, { useRef } from 'react'
import Projects from '../components/Home/Projects'
import Features from '../components/Home/Features'
import Hero from '../components/Home/Hero'
import Footer from '../components/Home/Footer'
import HowItWorks from '../components/Home/HowItWorks'
import Testimonials from '../components/Home/Testimonials'
import CallToAction from '../components/Home/CallToAction'
import FeaturedProjects from '../components/Home/FeaturedProject'

function Home() {
 const featuredRef = useRef(null);
 const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="min-h-screen overflow-hidden">
        <Hero scrollToFeatured={scrollToFeatured}/>
        <FeaturedProjects cref={featuredRef}/>
        <Projects/>
        <HowItWorks/>
        <Features/>
        <Testimonials/>
        <CallToAction/>
        <Footer/>
    </div>
  )
}

export default Home