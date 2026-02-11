// import React, { useState } from 'react';
// import { Phone, Mail, User } from 'lucide-react';
// import api from '../../api';

// const CallToAction = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     requirements: ''
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setMessage({ type: '', text: '' });

//     try {
//       await api.post('/api/site-visits', {
//         project: 'General Inquiry',
//         name: formData.name,
//         phone: formData.phone,
//         email: '',
//         preferredDate: new Date().toISOString(),
//         notes: formData.requirements
//       });
//       setMessage({ type: 'success', text: 'Request received! We will call you back shortly.' });
//       setFormData({ name: '', phone: '', requirements: '' });
//     } catch (error) {
//       console.error('Callback request failed:', error);
//       setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
//     } finally {
//       setSubmitting(false);
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   return (
//     <section
//       id="contact"
//       className="py-20 bg-cover bg-center relative overflow-hidden"
//     >
//       {/* Google Maps Background - Street View with Neighborhoods */}
//       <div className="absolute inset-0 z-0 w-full h-full">
//         <iframe
//           title="Easy Homes Location Map"
//           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15297.806891133698!2d80.56864385236149!3d16.55375480291117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35efa10202d185%3A0x6a994082397967aa!2sEasy%20Homes!5e0!3m2!1sen!2sin!4v1766740166376!5m2!1sen!2sin"
//           width="100%"
//           height="100%"
//           style={{ border: 0 }}
//           allowFullScreen
//           loading="lazy"
//           referrerPolicy="no-referrer-when-downgrade"
//           className="w-full h-full"
//         />

//       </div>
//       {/* Gradient Overlay - Protect left content, fade right for form */}
//       <div
//         className="absolute inset-0 z-5 pointer-events-none"
//         style={{
//           background: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)`,
//         }}
//       />
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//           {/* Content Left */}
//           <div className="text-white">
//             <h2 className="text-3xl md:text-4xl font-semibold mb-6 font-['Poppins']">
//               Let’s Help You Move Forward
//             </h2>
//             <p className="text-xl mb-8 font-['Inter'] leading-relaxed opacity-90">
//               Reach out for project details, walkthroughs, or a site visit—no pressure, just clarity.
//             </p>

//             <div className="space-y-4">
//               <div className="flex items-center space-x-4">
//                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Phone className="text-white" size={20} />
//                 </div>
//                 <div>
//                   <p className="font-medium font-['Poppins']">Call Us Now</p>
//                   <a
//                     href="tel:+918988896666"
//                     className="opacity-90 font-['Inter'] hover:text-emerald-400 transition-colors no-underline"
//                     style={{ textDecoration: 'none' }}
//                     title="Call Easy Homes"
//                   >
//                     +91 8988896666
//                   </a>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-4">
//                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Mail className="text-white" size={20} />
//                 </div>
//                 <div>
//                   <p className="font-medium font-['Poppins']">Email Us</p>
//                   <a
//                     href="mailto:contact@easyhomess.com"
//                     className="opacity-90 font-['Inter'] hover:text-emerald-400 transition-colors no-underline"
//                     style={{ textDecoration: 'none' }}
//                     title="Email Easy Homes"
//                   >
//                     contact@easyhomess.com
//                   </a>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-4">
//                 <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                   {/* MapPin icon as inline SVG for consistency */}
//                   <svg xmlns="http://www.w3.org/2000/svg" className="text-white" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21c-4.418 0-8-5.373-8-10A8 8 0 0 1 20 11c0 4.627-3.582 10-8 10Zm0 0V11"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
//                 </div>
//                 <div>
//                   <p className="font-medium font-['Poppins']">Visit Us</p>
//                   <a
//                     href="https://www.google.com/maps/place/Easy+Homes/@16.553755,80.568644,17z/data=!4m6!3m5!1s0x3a35efa10202d185:0x6a994082397967aa!8m2!3d16.553755!4d80.570832!16s%2Fg%2F11t4w2w7qg?entry=ttu"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="opacity-90 font-['Inter'] hover:text-emerald-400 transition-colors no-underline"
//                     style={{ textDecoration: 'none' }}
//                     title="Open Easy Homes in Google Maps"
//                   >
//                     4th Floor, adjacent to GIG International School, Gollapudi, Vijayawada, Andhra Pradesh 521225
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form */}
//           <div className="bg-white rounded-2xl p-8 shadow-2xl">
//             <h3 className="text-2xl font-semibold text-gray-900 mb-6 font-['Poppins']">
//               Get a Call Back
//             </h3>

//             {message.text && (
//               <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
//                 {message.text}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
//                   Full Name
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg font-['Inter']"
//                     placeholder="Enter your full name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
//                   Phone Number
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="tel"
//                     id="phone"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg font-['Inter']"
//                     placeholder="+91 8988896666"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
//                   Requirements
//                 </label>
//                 <textarea
//                   id="requirements"
//                   name="requirements"
//                   value={formData.requirements}
//                   onChange={handleChange}
//                   rows={4}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Inter']"
//                   placeholder="Tell us about your plot requirements..."
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className={`w-full py-3 rounded-lg font-medium font-['Poppins'] transition-colors shadow-lg hover:shadow-xl ${submitting
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-[#3868B2] hover:bg-[#38689F] text-white'
//                   }`}
//               >
//                 {submitting ? 'Submitting...' : 'Request Call Back'}
//               </button>
//             </form>

//             <p className="text-sm text-gray-500 mt-4 text-center font-['Inter']">
//               We'll call you within 24 hours to discuss your requirements
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CallToAction;


import React, { useState } from "react";
import { Phone, Mail, User } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    requirements: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ✅ EmailJS credentials
  const SERVICE_ID = "service_ni83ich";
  const TEMPLATE_ID = "template_yib5p3b";
  const PUBLIC_KEY = "27Dng4yZGt6H6Y-tl";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚫 Prevent double submit
    if (submitting) return;

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    const templateParams = {
      name: formData.name,
      phone: formData.phone,
      requirements: formData.requirements,
    };

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );

      // ✅ Reset form
      setFormData({
        name: "",
        phone: "",
        requirements: "",
      });

      // ✅ Redirect to Thank You page
      navigate("/thank-you");

    } catch (error) {
      console.error("EmailJS Error:", error);
      setMessage({
        type: "error",
        text: "Failed to submit. Please try again.",
      });
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

   return (
    <section
      id="contact"
      className="py-20 bg-cover bg-center relative overflow-hidden"
    >
      {/* Google Maps Background - Street View with Neighborhoods */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <iframe
          title="Easy Homes Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15297.806891133698!2d80.56864385236149!3d16.55375480291117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35efa10202d185%3A0x6a994082397967aa!2sEasy%20Homes!5e0!3m2!1sen!2sin!4v1766740166376!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />

      </div>
      {/* Gradient Overlay - Protect left content, fade right for form */}
      <div
        className="absolute inset-0 z-5 pointer-events-none"
        style={{
          background: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)`,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content Left */}
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 font-['Poppins']">
              Let’s Help You Move Forward
            </h2>
            <p className="text-xl mb-8 font-['Inter'] leading-relaxed opacity-90">
              Reach out for project details, walkthroughs, or a site visit—no pressure, just clarity.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Phone className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium font-['Poppins']">Call Us Now</p>
                  <a
                    href="tel:+918988896666"
                    className="opacity-90 font-['Inter'] hover:text-emerald-400 transition-colors no-underline"
                    style={{ textDecoration: 'none' }}
                    title="Call Easy Homes"
                  >
                    +91 8988896666
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Mail className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium font-['Poppins']">Email Us</p>
                  <a
                    href="mailto:contact@easyhomess.com"
                    className="opacity-90 font-['Inter'] hover:text-emerald-400 transition-colors no-underline"
                    style={{ textDecoration: 'none' }}
                    title="Email Easy Homes"
                  >
                    contact@easyhomess.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  {/* MapPin icon as inline SVG for consistency */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-white" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21c-4.418 0-8-5.373-8-10A8 8 0 0 1 20 11c0 4.627-3.582 10-8 10Zm0 0V11"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                </div>
                <div>
                  <p className="font-medium font-['Poppins']">Visit Us</p>
                  <a
                    href="https://www.google.com/maps/place/Easy+Homes/@16.553755,80.568644,17z/data=!4m6!3m5!1s0x3a35efa10202d185:0x6a994082397967aa!8m2!3d16.553755!4d80.570832!16s%2Fg%2F11t4w2w7qg?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-90 font-['Inter'] hover:text-emerald-400 transition-colors no-underline"
                    style={{ textDecoration: 'none' }}
                    title="Open Easy Homes in Google Maps"
                  >
                    4th Floor, adjacent to GIG International School, Gollapudi, Vijayawada, Andhra Pradesh 521225
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 font-['Poppins']">
              Get a Call Back
            </h3>

            {message.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg font-['Inter']"
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg font-['Inter']"
                    placeholder="+91 8988896666"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Inter']"
                  placeholder="Tell us about your plot requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-lg font-medium font-['Poppins'] transition-colors shadow-lg hover:shadow-xl ${submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#3868B2] hover:bg-[#38689F] text-white'
                  }`}
              >
                {submitting ? 'Submitting...' : 'Request Call Back'}
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