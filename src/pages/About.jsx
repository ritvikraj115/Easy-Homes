import React from "react";
import { Helmet } from "react-helmet-async";
import logo from "../assets/img/Logo.webp";


export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | Easy Homes</title>
        <meta name="description" content="Learn about Easy Homes, your trusted partner for CRDA-approved plots in Amaravati and Vijayawada. Discover our mission, values, and commitment to transparency and trust." />
      </Helmet>
      <section className="relative py-24 bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] min-h-[80vh] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#3868B2]/20 via-white/0 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <img
              src={logo}
              alt="Easy Homes Logo"
              className="w-24 h-24 mb-6 rounded-xl shadow-xl border-4 border-white bg-white"
              width="96"
              height="96"
              style={{ aspectRatio: '1/1', objectFit: 'contain', width: '6rem', height: '6rem', display: 'block' }}
            />
            <h1 className="text-4xl md:text-5xl font-bold text-[#3868B2] mb-3 font-poppins tracking-tight drop-shadow-lg">About Easy Homes</h1>
            <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-4 font-poppins">Building Dreams, Delivering Trust</h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 font-inter max-w-2xl mx-auto">
              Easy Homes is dedicated to making property buying transparent, secure, and stress-free. We specialize in CRDA-approved plots in Amaravati and Vijayawada, offering only verified properties with clear titles and honest guidance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col justify-center border-t-4 border-[#3868B2]">
              <h3 className="text-2xl font-semibold text-[#3868B2] mb-4 font-poppins">Our Mission</h3>
              <p className="text-gray-700 font-inter text-base leading-relaxed">
                To empower families and investors with trustworthy real estate options, clear information, and a seamless buying experience. We believe in building lasting relationships based on trust, transparency, and service.
              </p>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col justify-center border-t-4 border-[#3868B2]">
              <h3 className="text-2xl font-semibold text-[#3868B2] mb-4 font-poppins">Why Choose Us?</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 font-inter text-base">
                <li>100% CRDA-approved layouts and properties</li>
                <li>Zero commission, unbiased advice</li>
                <li>Verified documentation and clear titles</li>
                <li>Personalized support from site visit to registration</li>
                <li>Modern, user-friendly platform for property discovery</li>
              </ul>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col justify-center border-t-4 border-[#3868B2]">
              <h3 className="text-2xl font-semibold text-[#3868B2] mb-4 font-poppins">Our Values</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 font-inter text-base">
                <li><span className="font-semibold">Transparency:</span> Every detail, every document, always open for you.</li>
                <li><span className="font-semibold">Trust:</span> We deliver what we promise, every time.</li>
                <li><span className="font-semibold">Service:</span> Your needs come first, from first call to final registration.</li>
                <li><span className="font-semibold">Innovation:</span> We use technology to simplify and enhance your property journey.</li>
              </ul>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col justify-center border-t-4 border-[#3868B2]">
              <h3 className="text-2xl font-semibold text-[#3868B2] mb-4 font-poppins">Contact Us</h3>
              <div className="space-y-2 text-gray-700 font-inter text-base">
                <div className="flex items-center gap-2"><span className="font-semibold">Address:</span> 4th Floor, adjacent to GIG International School, Gollapudi, Vijayawada, Andhra Pradesh 521225</div>
                <div className="flex items-center gap-2"><span className="font-semibold">Phone:</span> <a href="tel:+918988896666" className="text-[#3868B2] hover:underline">+91 8988896666</a></div>
                <div className="flex items-center gap-2"><span className="font-semibold">Email:</span> <a href="mailto:contact@easyhomess.com" className="text-[#3868B2] hover:underline">contact@easyhomess.com</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
