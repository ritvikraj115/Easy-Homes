import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/Logo.webp';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter } from 'react-feather';

const Footer = () => {
  return (
    <footer className="bg-[#020407] text-white relative">
      <div className="container mx-auto !px-4 md:!px-10 lg:!px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-8 py-16">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12  rounded-md flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-12 h-12  rounded-md flex items-center justify-center" />
              </div>
              <div>
                <h3 className="text-xl font-semibold font-poppins">EASY HOMES</h3>
                <p className="text-gray-400 -mt-1 font-inter">Building Dreams, Delivering Trust</p>
              </div>
            </div>
            <p className="text-gray-300 font-inter leading-relaxed mb-6 max-w-xl">
              Your trusted partner for CRDA-approved plots in Amaravati. We specialize in premium real estate investments with clear titles and verified properties.
            </p>
            <div className="flex gap-4">
              <Link to='/' className="w-10 h-10 bg-gray-700 hover:bg-[#3868B2] rounded-md flex items-center justify-center">
                <Facebook size={20} />
              </Link>
              <Link to='/' className="w-10 h-10 bg-gray-700 hover:bg-[#3868B2] rounded-md flex items-center justify-center">
                <Twitter size={20} />
              </Link>
              <Link to='/' className="w-10 h-10 bg-gray-700 hover:bg-[#3868B2] rounded-md flex items-center justify-center">
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="sm:ml-4">
            <h4 className="text-lg font-semibold mb-6 font-poppins">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/#projects" className="text-gray-300 hover:text-white font-inter">Projects</Link></li>
              <li><Link to="/#buy-plot" className="text-gray-300 hover:text-white font-inter">Buy a Plot</Link></li>
              <li><Link to="/#about" className="text-gray-300 hover:text-white font-inter">About Us</Link></li>
              <li><Link to="/#contact" className="text-gray-300 hover:text-white font-inter">Contact</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white font-inter">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white font-inter">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-poppins">Contact Info</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#3868B2] mt-1" />
                <p className="text-gray-300 font-inter">
                  123 Capital Avenue,<br />Amaravati, Andhra Pradesh<br />522020
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#3868B2] mt-1" />
                <p className="text-gray-300 font-inter">+91 98765 43210</p>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-[#3868B2] mt-1" />
                <p className="text-gray-300 font-inter">info@easyhomes.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 font-inter text-sm">© 2025 Easy Homes. All rights reserved.</p>
          <p className="text-gray-400 font-inter text-sm">CRDA Registration: AP/CRDA/2024/001234</p>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <Link to='/' className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl z-50 transition-transform transform hover:scale-110">
        <MessageCircle className="w-8 h-8" />
      </Link>
    </footer>
  );
};

export default Footer;
