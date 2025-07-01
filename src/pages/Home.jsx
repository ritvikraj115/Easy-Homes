import React from 'react'
import Projects from '../components/Home/Projects'
import Features from '../components/Home/Features'
import Hero from '../components/Home/Hero'
import Footer from '../components/Home/Footer'
import HowItWorks from '../components/Home/HowItWorks'
import Testimonials from '../components/Home/Testimonials'
import CallToAction from '../components/Home/CallToAction'
import FeaturedProjects from '../components/Home/FeaturedProject'

function Home() {
  return (
    <div className="min-h-screen">
        <Hero/>
        <FeaturedProjects/>
        <Projects/>
        <Features/>
        <HowItWorks/>
        <Testimonials/>
        <CallToAction/>
        <Footer/>
    </div>
  )
}

export default Home