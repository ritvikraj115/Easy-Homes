import React from 'react';
import { Map, DollarSign, FileCheck, Camera, BarChart3, Handshake, TrendingUp } from 'lucide-react';
import './Footer.css'
import { Link } from 'react-router-dom';

const Features = () => {
  const features = [
    {
      icon: Map,
      title: 'Smarter Property Discovery',
      description: 'Explore CRDA-approved layouts on a live map, filter by your needs, and find properties that match—without the clutter.'
    },
    {
      icon: DollarSign,
      title: 'Unbiased Platform, Zero Commission',
      description: 'We don\'t push projects. We don\'t take commissions. Easy Homes works only in your interest.'
    },
    {
      icon: FileCheck,
      title: 'Verified Layouts & In-Force Plans',
      description: 'Every project includes the latest approved CRDA plan—no outdated files, no plot mismatches, no surprises.'
    },
    {
      icon: Camera,
      title: 'Real Images & Walkthrough Videos',
      description: 'Get on-site clarity from wherever you are. We provide up-to-date visuals and 360° walkthroughs where available.'
    },
    {
      icon: BarChart3,
      title: 'Transparent Market Insights',
      description: 'Understand pricing with historic data, market comparisons, and suggested price ranges—so you never overpay.'
    },
    {
      icon: Handshake,
      title: 'Direct or Guided Buying',
      description: 'Reach out to the project\'s sales manager directly—or let Easy Homes assist you, with no commission and full support.'
    },
    {
      icon: TrendingUp,
      title: 'Community Demand Made Visible',
      description: 'See where buyers are investing. We track recent transactions and registered plots so you can judge demand with confidence.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 font-['Poppins']">
            Why Choose Easy Homes?
          </h2>
          <h3 className="text-2xl font-medium text-gray-800 mb-4 font-['Poppins']">
            Built for Clarity. Backed by Trust. Designed Around You.
          </h3>
          <p className="text-xl text-gray-600 font-['Inter'] max-w-3xl mx-auto mb-8">
            Easy Homes simplifies your property search with verified data, visual tools, and zero-pressure guidance—so you can buy with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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

        <div className="text-center">
          <Link to="/contact">
            <button
              className="bg-gradient-to-r from-[#3868B2] to-[#38689F]
               text-white px-8 py-4 rounded-lg text-lg font-semibold
               hover:shadow-lg transition-all duration-300 hover:scale-105
               font-['Poppins']"
            >
              Contact us Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;