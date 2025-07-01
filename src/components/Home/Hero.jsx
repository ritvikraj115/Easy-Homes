import React from 'react';
import { CheckCircle, ChevronDown } from 'lucide-react';
import heropc from '../../assets/img/heroPc.jpg'
import heroph from '../../assets/img/herophone.jpg'


const Hero = ({ref}) => {
   const scrollToFeatured = () => {
    console.log(ref)
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <img
          src={heropc}
          alt="CRDA Approved Plots in Amaravati"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30"></div>
      </div>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 block lg:hidden">
        <img
          src={heroph}
          alt="CRDA Approved Plots in Amaravati"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 font-['Poppins'] leading-tight sm:!leading-snug tracking-tight">
            All CRDA-Approved Projects
              Fully Verified Instantly<span className="text-[#97B3D9]"> Accessible</span>  
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 font-['Inter'] leading-relaxed max-w-3xl mx-auto">
            Visually explore, compare, and shortlist projects in Amaravati
            <br />
            and Vijayawada on our interactive map.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12">
            <div className="flex items-center space-x-3 text-white">
              <CheckCircle className="text-green-400" size={24} />
              <span className="font-medium font-['Inter']">100% Verified Properties</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <CheckCircle className="text-green-400" size={24} />
              <span className="font-medium font-['Inter']">Clear Title</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <CheckCircle className="text-green-400" size={24} />
              <span className="font-medium font-['Inter']">CRDA Approved</span>
            </div>
          </div>

          {/* Single CTA Button */}
          <div className="flex justify-center">
            <button className="bg-[#3868B2] hover:bg-[#38689F] text-white px-8 py-4 rounded-lg font-medium font-['Poppins'] text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 min-w-[200px]">
              Explore Projects
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Positioned at bottom */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce z-10" onClick={scrollToFeatured}>
        <ChevronDown className="text-white/70" size={32} />
      </div>
    </section>
  );
};

export default Hero;