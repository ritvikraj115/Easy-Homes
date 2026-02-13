import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/Logo.webp';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'react-feather';
import { FaYoutube } from 'react-icons/fa';

const Footer = ({ onAboutClick, onContactClick, onTermsClick, onPrivacyClick }) => {
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
              <a href="https://m.facebook.com/894019353792727/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 bg-gray-700 hover:bg-[#3868B2] rounded-md flex items-center justify-center">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/easyhomesofficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 bg-gray-700 hover:bg-pink-600 rounded-md flex items-center justify-center">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@easyhomes8" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-md flex items-center justify-center">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="sm:ml-4">
            <h4 className="text-lg font-semibold mb-6 font-poppins">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/projects" className="text-gray-300 hover:text-white font-inter">Projects</Link></li>
              <li><Link to="/searchProperties" className="text-gray-300 hover:text-white font-inter">Buy a Plot</Link></li>
              <li><button onClick={onAboutClick} className="text-left text-gray-300 hover:text-white font-inter bg-transparent border-none outline-none cursor-pointer">About Us</button></li>
              <li><button onClick={onContactClick} className="text-left text-gray-300 hover:text-white font-inter bg-transparent border-none outline-none cursor-pointer">Contact</button></li>
              <li><button onClick={onTermsClick} className="text-left text-gray-300 hover:text-white font-inter bg-transparent border-none outline-none cursor-pointer">Terms & Conditions</button></li>
              <li><button onClick={onPrivacyClick} className="text-left text-gray-300 hover:text-white font-inter bg-transparent border-none outline-none cursor-pointer">Privacy Policy</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 font-poppins">Contact Info</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#3868B2] mt-1" />
                <a
                  href="https://www.google.com/maps/place/Easy+Homes/@16.553755,80.568644,17z/data=!4m6!3m5!1s0x3a35efa10202d185:0x6a994082397967aa!8m2!3d16.553755!4d80.570832!16s%2Fg%2F11t4w2w7qg?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 font-inter hover:text-emerald-400 transition-colors no-underline"
                  style={{ textDecoration: 'none' }}
                  title="Open Easy Homes in Google Maps"
                >
                  4th Floor, adjacent to GIG International School,<br />Gollapudi, Vijayawada,<br />Andhra Pradesh 521225
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#3868B2] mt-1" />
                <a
                  href="tel:+918988896666"
                  className="text-gray-300 font-inter hover:text-emerald-400 transition-colors no-underline"
                  style={{ textDecoration: 'none' }}
                  title="Call Easy Homes"
                >
                  +91 8988896666
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-[#3868B2] mt-1" />
                <a
                  href="mailto:contact@easyhomess.com"
                  className="text-gray-300 font-inter hover:text-emerald-400 transition-colors no-underline"
                  style={{ textDecoration: 'none' }}
                  title="Email Easy Homes"
                >
                  contact@easyhomess.com
                </a>
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
      <a href="https://wa.me/918019298488?text=Hi%20Easy%20Homes,%20I%20am%20interested%20in%20your%20projects." target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl z-50 transition-transform transform hover:scale-110">
        <MessageCircle className="w-8 h-8" />
      </a>
    </footer>
  );
};

export default Footer;
