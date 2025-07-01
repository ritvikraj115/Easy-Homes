import React, { useState } from 'react';
import { Phone, Mail, User } from 'lucide-react';
import bgMap from '../../assets/img/map.png'

const CallToAction = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    requirements: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
<section
  className="py-20 bg-cover bg-center relative overflow-hidden"
  style={{
    backgroundImage: `url(${bgMap})`,
  }}
>
  {/* Gradient Overlay */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.3) 100%)`,
    }}
  />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 font-['Poppins']">
              Ready to Invest in Your Future?
            </h2>
            <p className="text-xl mb-8 font-['Inter'] leading-relaxed opacity-90">
              Get expert guidance on CRDA-approved plots in Amaravati. Our team will help you find the perfect investment opportunity.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Phone className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium font-['Poppins']">Call Us Now</p>
                  <p className="opacity-90 font-['Inter']">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Mail className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium font-['Poppins']">Email Us</p>
                  <p className="opacity-90 font-['Inter']">info@easyhomes.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 font-['Poppins']">
              Get a Call Back
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3868B2] focus:border-transparent font-['Inter']"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3868B2] focus:border-transparent font-['Inter']"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3868B2] focus:border-transparent font-['Inter']"
                  placeholder="Tell us about your plot requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3868B2] hover:bg-[#38689F] text-white py-3 rounded-lg font-medium font-['Poppins'] transition-colors shadow-lg hover:shadow-xl"
              >
                Request Call Back
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center font-['Inter']">
              We'll call you within 24 hours to discuss your requirements
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;