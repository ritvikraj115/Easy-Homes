// src/components/Home/FeaturedProject.jsx
import React from 'react';
import { ArrowRight, MapPin, Building, ShieldCheck, TrendingUp } from 'lucide-react';
import Kalp from '../../assets/img/kalp.webp';
import { Link } from 'react-router-dom';

function FeaturedProjects({ cref }) {
  return (
    <section ref={cref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold font-poppins text-gray-900">
            Featured Projects
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4 font-inter">
            The finest CRDA projects—curated for location, infrastructure, and long-term value,
            with the right entry price and high return potential.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            {/* Left Image */}
            <div className="relative overflow-hidden">
              <img
                src={Kalp}
                alt="Kalpavriksha CRDA Approved Layout"
                className="w-full h-80 lg:h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-6 left-6 bg-emerald-500/95 text-white px-4 py-2 rounded-full text-sm font-medium font-inter flex items-center gap-2 backdrop-blur">
                <ShieldCheck size={16} />
                <span>CRDA Approved</span>
              </div>
            </div>

            {/* Right Content */}
            <div className="p-10 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 font-poppins leading-tight mb-4">
                Kalpavruksha – CRDA-Approved Layout
                <span className="block text-[#3868B2] font-medium text-base mt-2">
                  Strategically Located Between Vijayawada and Amaravati
                </span>
              </h3>

              <p className="text-lg text-gray-600 font-inter mb-8 leading-relaxed">
                Thoughtfully planned layout with infrastructure and investment upside.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 mb-10">
                <div className="flex items-center gap-3 text-gray-700 font-inter font-medium">
                  <MapPin size={20} className="text-[#3868B2]" />
                  Prime Corridor Location
                </div>
                <div className="flex items-center gap-3 text-gray-700 font-inter font-medium">
                  <TrendingUp size={20} className="text-[#3868B2]" />
                  High Appreciation Potential
                </div>
                <div className="flex items-center gap-3 text-gray-700 font-inter font-medium">
                  <Building size={20} className="text-[#3868B2]" />
                  Ready Infrastructure
                </div>
              </div>

              <Link
                to="/projects"
                aria-label="View Kalpavruksha CRDA Approved Plots Project Details"
                className="group bg-[#3868B2] text-white px-8 py-4 rounded-lg text-lg font-poppins font-medium shadow-md hover:bg-[#38689F] hover:shadow-lg transition-all flex items-center gap-3 min-w-[12rem]"
              >
                Explore Kalpavruksha
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProjects;
