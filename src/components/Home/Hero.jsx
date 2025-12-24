// client/src/components/Hero.jsx
import React from 'react';
import { CheckCircle, ChevronDown } from 'lucide-react';
import heropc from '../../assets/img/Hero Image V2.webp';
import heroph from '../../assets/img/Hero image mobile v1.webp';
import { Link } from 'react-router-dom';

const Hero = ({ scrollToFeatured }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Responsive background image */}
     <picture className="absolute inset-0 z-0 w-full h-full block">
        {/* Desktop */}
        <source
          media="(min-width: 1024px)"
          srcSet={heropc}
          type="image/webp"
        />

        {/* Mobile */}
        <source
          media="(max-width: 1023px)"
          srcSet={heroph}
          type="image/webp"
        />

        {/* Fallback */}
        <img
          src={heropc}
          alt="CRDA Approved Plots in Amaravati"
          className="w-full h-full object-cover"
          decoding="async"
          loading="eager"
          fetchpriority="high"
          width="1920"
          height="1080"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30" />
      </picture>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 font-['Poppins'] leading-tight sm:!leading-snug tracking-tight">
            All CRDA-Approved Projects
            Fully Verified Instantly
            <span className="text-[#97B3D9]"> Accessible</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 font-['Inter'] leading-relaxed max-w-3xl mx-auto">
            Visually explore, compare, and shortlist projects in Amaravati
            <br />
            and Vijayawada on our interactive map.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12">
            {['100% Verified Properties', 'Clear Title', 'CRDA Approved'].map((text) => (
              <div key={text} className="flex items-center space-x-3 text-white">
                <CheckCircle className="text-green-400" size={24} />
                <span className="font-medium font-['Inter']">{text}</span>
              </div>
            ))}
          </div>

          {/* Call to Action */}
         <div className="flex justify-center">
          <Link
            to="/searchProperties"
            className="bg-[#3868B2] hover:bg-[#38689F] text-white px-8 py-4 rounded-lg font-medium font-['Poppins'] text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 min-w-[200px] text-center"
            aria-label="Search CRDA Approved Plots in Amaravati and Vijayawada"
          >
            Explore Projects
          </Link>
        </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        onClick={scrollToFeatured}
        className="absolute inset-x-0 bottom-16 flex justify-center animate-bounce z-10 cursor-pointer"
      >
        <ChevronDown className="text-white/70" size={32} />
      </div>
    </section>
  );
};

export default Hero;
