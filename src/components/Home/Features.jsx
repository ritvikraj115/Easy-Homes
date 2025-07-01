import React from 'react';
import { Shield, MapPin, FileCheck, Zap, Users, Award } from 'lucide-react';
import './Footer.css'

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'CRDA Approved',
      description: 'All our plots are officially approved by Capital Region Development Authority'
    },
    {
      icon: FileCheck,
      title: 'Clear Titles',
      description: 'Verified legal documentation with clear and marketable titles'
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Strategic locations in Amaravati with excellent connectivity and growth potential'
    },
    {
      icon: Zap,
      title: 'Ready Infrastructure',
      description: 'Developed plots with roads, electricity, and water connections'
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Professional support throughout your property buying journey'
    },
    {
      icon: Award,
      title: 'Trusted Brand',
      description: 'Years of experience in Amaravati real estate with satisfied customers'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 font-['Poppins']">
            Why Choose Easy Homes?
          </h2>
          <p className="text-xl text-gray-600 font-['Inter'] max-w-3xl mx-auto">
            We make property investment simple, secure, and profitable with our commitment to transparency and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#3868B2] to-[#38689F] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Poppins']">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-['Inter'] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;