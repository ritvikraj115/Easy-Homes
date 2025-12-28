import React from "react";
import { Helmet } from "react-helmet-async";
import { Phone, Mail, MapPin } from "lucide-react";


export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Easy Homes</title>
        <meta name="description" content="Contact Easy Homes for CRDA-approved plots, site visits, and real estate queries in Amaravati and Vijayawada. We're here to help you move forward." />
      </Helmet>
      <section className="relative py-24 bg-gradient-to-br from-[#e0e7ef] to-[#f8fafc] min-h-[80vh] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#3868B2]/20 via-white/0 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3868B2] mb-3 font-poppins tracking-tight drop-shadow-lg">Contact Us</h1>
            <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-4 font-poppins">We're Here to Help You Move Forward</h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 font-inter max-w-2xl mx-auto">
              Have questions about a property, want to schedule a site visit, or need guidance? Reach out to Easy Homes—our team is ready to assist you with clarity and care.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col justify-center border-t-4 border-[#3868B2]">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <Phone className="text-[#3868B2]" size={28} />
                  <div>
                    <p className="font-semibold text-lg text-[#3868B2]">Call Us</p>
                    <a href="tel:+918988896666" className="text-gray-700 hover:text-[#3868B2] font-inter">+91 8988896666</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="text-[#3868B2]" size={28} />
                  <div>
                    <p className="font-semibold text-lg text-[#3868B2]">Email</p>
                    <a href="mailto:contact@easyhomess.com" className="text-gray-700 hover:text-[#3868B2] font-inter">contact@easyhomess.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="text-[#3868B2]" size={28} />
                  <div>
                    <p className="font-semibold text-lg text-[#3868B2]">Visit Us</p>
                    <span className="text-gray-700 font-inter">4th Floor, GIG International School, Gollapudi, Vijayawada, AP 521225</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col justify-center border-t-4 border-[#3868B2]">
              <iframe
                title="Easy Homes Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15297.806891133698!2d80.56864385236149!3d16.55375480291117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35efa10202d185%3A0x6a994082397967aa!2sEasy%20Homes!5e0!3m2!1sen!2sin!4v1766740166376!5m2!1sen!2sin"
                width="100%"
                height="260"
                style={{ border: 0, borderRadius: '1rem', minHeight: '200px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
