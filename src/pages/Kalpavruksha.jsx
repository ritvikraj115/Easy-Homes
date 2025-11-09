import React, { useState } from 'react';
import {
  Download,
  MapPin,
  MessageCircle,
  Phone,
  Heart,
  Trees,
  Building,
  Waves,
  Car,
  Shield,
  Zap,
  CheckCircle,
  Users,
  TreePine,
  Menu,
  X,
  Star
} from 'lucide-react';
import heropc from '../assets/img/kalpPcImg.png'
import heroph from '../assets/img/kalpPhImg.png'
import card, { CardContent } from '../components/card';
import vd from '../assets/hero-3.mp4'
import Navbar from '../components/Navbar'

const KalpavrukshaPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "Fully Approved. Carefully Maintained.",
      description: "CRDA-approved and backed by 5 years of developer maintenance.",
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: "Closer to Everything That Matters",
      description:
        "7 km from Vijayawada • 12.5 km from Amaravati's Startup Village & BITS • Adjacent to Vijayawada–Nagpur Greenfield Highway",
    },
    {
      icon: <Car className="w-6 h-6 text-purple-600" />,
      title: "Roads That Respect Space and Flow",
      description: "60', 40', and 33' wide internal CC roads, walkways, avenue plantations, and stormwater drains.",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Seamless Systems Beneath the Surface",
      description: "Underground networks for power, water, fiber, and sewage — silent, secure, and future-ready.",
    },
    {
      icon: <Waves className="w-6 h-6 text-cyan-600" />,
      title: "Water That Works, Landscapes That Live",
      description: "Overhead tank with underground supply, STP-connected drainage, and drip irrigation.",
    },
    {
      icon: <Building className="w-6 h-6 text-indigo-600" />,
      title: "A Clubhouse That Feels Like a Second Home",
      description: "Infinity pool, yoga room, gym, party lawn, convention hall, private theatre, and guest rooms.",
    },
    {
      icon: <Users className="w-6 h-6 text-pink-600" />,
      title: "Play Isn't Just for Kids — It's for Community",
      description: "Basketball, net cricket, multi-purpose court, children's play zone, and indoor games.",
    },
    {
      icon: <Trees className="w-6 h-6 text-green-500" />,
      title: "Where Nature is Always Within Reach",
      description: "Central rivulet garden beside the creek, landscaped arrival court, and edge gardens.",
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "Protected. Peaceful. Prepared.",
      description: "8' compound wall with 2' solar fencing, 24x7 gated entry with CCTV, and solar lighting.",
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-600" />,
      title: "Designed Not Just to Last — But to Mean Something",
      description: "More than a layout — a vision grounded in values for your family's legacy.",
    },
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Vijayawada",
      text: "Kalpavruksha exceeded our expectations. The location is perfect and the amenities are world-class.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      location: "Amaravati",
      text: "We found our dream home here. The community feel and green spaces make it truly special.",
      rating: 5
    },
    {
      name: "Amit Patel",
      location: "Guntur",
      text: "Outstanding project with excellent connectivity. The developer's commitment to quality is evident.",
      rating: 5
    }
  ];

  const CTAButton = ({ icon, text, primary = false, onClick = () => { } }) => (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold 
        transition-all duration-300 transform hover:scale-105 hover:shadow-lg
        ${primary
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
          : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      <span>{text}</span>
    </button>
  );

  //All codes related to img glary 
  const demoImg = [
    { title: "Grand Entrance", image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { title: "Clubhouse", image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { title: "Landscaped Gardens", image: "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { title: "Kids Play Area", image: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { title: "Internal Roads", image: "https://images.pexels.com/photos/1166473/pexels-photo-1166473.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { title: "Master Layout", image: "https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=600" }
  ]
  const [selectedImage, setSelectedImage] = useState(null);
  const openModal = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };
  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav optional */}
      {/* <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TreePine className="w-8 h-8 text-emerald-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Kalpavruksha</span>
              <span className="ml-2 text-sm text-gray-500">by Easy Homes</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <CTAButton 
                icon={<Phone className="w-4 h-4" />} 
                text="Call Now" 
              />
              <CTAButton 
                icon={<MessageCircle className="w-4 h-4" />} 
                text="WhatsApp" 
                primary 
              />
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav> */}

      {/* Mobile Menu */}
      {/* {isMenuOpen && (
        <div className="fixed top-16 w-full bg-white z-40 border-b border-gray-200 md:hidden">
          <div className="px-4 py-4 space-y-3">
            <CTAButton 
              icon={<Phone className="w-4 h-4" />} 
              text="Call Now" 
            />
            <CTAButton 
              icon={<MessageCircle className="w-4 h-4" />} 
              text="WhatsApp" 
              primary 
            />
          </div>
        </div>
      )} */}

      {/* Section 1: Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b3b26]/80 via-[#295638]/60  to-transparent"></div>
        <picture className="absolute inset-0 w-full h-full z-0 block">
          <source media="(min-width: 768px)" srcSet={heropc} type="image/png" />
          <source media="(max-width: 767px)" srcSet={heroph} type="image/png" />
          <img
            src={heropc}
            alt="Kalpavruksha Hero"
            className="w-full h-full object-cover opacity-80"
            loading="eager"
            decoding="async"
            width="1920"
            height="1080"
          />
        </picture>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className='rounded-full shadow  px-3 md:px-4 py-0 max-h-fit bg-[#dbba5733] max-w-fit mx-auto border border-[#f2e5c0] mb-4 lg:mb-12'>
            <p className="text-sm md:text-base text-[#f2e5c0]  font-medium tracking-wide ">
              CRDA-Approved Open Plots in Vijayawada
            </p>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-[#fbfaf9] mb-6 leading-tight">
            Where You Don't Just <br />
            Arrive — <span className='text-[#f2e5c0]'>You Belong</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            It's not just the feeling of arriving somewhere new — but somewhere<br />
            right, where your heart belongs. Just 12 mins from Amaravati.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="/mainBrouche.pdf"
              download
              className="inline-flex items-center h-fit w-fit  text-white rounded-full transition duration-200"
            >
              <CTAButton
                icon={<Download className="w-5 h-5" />}
                text="Get Brochure"
                primary
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900"
              /></a>
            <CTAButton
              icon={<MapPin className="w-5 h-5" />}
              text="Schedule Site Visit"
              className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
            />
            <CTAButton
              icon={<MessageCircle className="w-5 h-5" />}
              text="Talk to Us on WhatsApp"
              className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
            />
          </div>

          <CTAButton
            icon={<Phone className="w-5 h-5" />}
            text="Request a Callback"
            className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
          />
        </div>
      </section>

      {/* Section 2: From Longing to Belonging */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
            From Longing to <span className="text-emerald-600">Belonging</span>
          </h2>

          <div className="prose prose-lg md:prose-xl mx-auto text-gray-700 leading-relaxed">
            <p className="mb-6">
              Some journeys don't begin with a destination. They begin with a feeling —
              and some places bring a stillness so true, your heart remembers it.
            </p>

            <p className="mb-6">
              Kalpavruksha was shaped by that search. Not just to be seen, but to be felt.
              And when you stand here — with hills behind you and the creek beside you —
              something in you softens.
            </p>

            <p className="text-xl font-semibold text-emerald-600">
              This isn't just arrival. It's belonging.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Video Walkthrough */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 ">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              A Glimpse of What <span className="text-emerald-400">Belonging</span> Looks Like
            </h2>
            <p className="text-xl text-gray-300">
              Let Kalpavruksha reveal itself — in motion, in flow, in feeling.
            </p>
            <p className="text-gray-400 mt-2">
              Watch the vision unfold before your visit
            </p>
          </div>

          <div className="relative aspect-video bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              className="w-full aspect-video"
              src="https://www.youtube.com/embed/mt-G29uakpQ?autoplay=1&mute=1&loop=1&playlist=mt-G29uakpQ"
              title="YouTube video player"
              frameBorder="0"
              allow="autoplay; fullscreen"
            ></iframe>
            <div className="absolute bottom-4 left-4 right-4 hidden md:block">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white font-medium">Project Walkthrough Video</p>
                <p className="text-gray-300 text-sm">Experience Kalpavruksha before you visit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Project Renderings Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Picture the Life That <span className="text-emerald-600">Awaits</span>
            </h2>
            <p className="text-xl text-gray-600">
              Every space rendered with care — so you can feel it before it's real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoImg.map((item, index) => (
              <div key={index}
                onClick={() => openModal(item)}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
            >
              <X size={24} />
            </button>

            {/* Large image */}
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg cursor-pointer"
              onClick={closeModal}
            />

            {/* Title */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <h3 className="text-white font-semibold text-xl bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                {selectedImage.title}
              </h3>
            </div>
          </div>
        </div>)}

      {/* Section 5: What Sets Kalpavruksha Apart */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              What Sets <span className="text-emerald-600">Kalpavruksha</span> Apart
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Some places are where you stay — but some places stay with you.
              Kalpavruksha is built with quiet assurances that go beyond the sale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {index + 1}. {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Community Details */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              A Community Drawn with <span className="text-emerald-600">Intention</span>
            </h2>
            <p className="text-xl text-gray-600">
              From plot sizes to pathways, everything at Kalpavruksha has been shaped
              to bring balance, beauty, and belonging.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Project Snapshot</h3>

              <div className="space-y-6">
                {[
                  { label: "Total Area", value: "9 Acres" },
                  { label: "Number of Plots", value: "101 Plots" },
                  { label: "Plot Size Range", value: "162 to 525 Sq Yards" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="text-xl font-bold text-emerald-600">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <a
                  href="/pdfLayOut.pdf"
                  download
                  className="inline-flex items-center h-fit w-fit  text-white rounded-full transition duration-200"
                >
                  <CTAButton
                    icon={<Download className="w-5 h-5" />}
                    text="Download Layout PDF"
                    primary
                  /></a>
                <div className="flex flex-col sm:flex-row gap-4">
                  <CTAButton
                    icon={<MapPin className="w-5 h-5" />}
                    text="Book a Site Visit"
                  />
                  <CTAButton
                    icon={<MessageCircle className="w-5 h-5" />}
                    text="Chat on WhatsApp"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
                  Master Plan Layout
                </h4>
                <p className="text-gray-600 mb-6">
                  Every plot and pathway — drawn with care, not just to optimize space,
                  but to cultivate a lifestyle.
                </p>

                <div className="aspect-square bg-white rounded-lg shadow-inner">
                  <div className="w-full h-full rounded-lg flex items-center justify-center">
                    <img src={heroph} alt="" className='h-full w-full rounded-lg' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Location */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Moments from the City. <br />
            <span className="text-emerald-300">Miles from the Noise.</span>
          </h2>
          <p className="text-xl text-emerald-100">
            Between Vijayawada's pulse and Amaravati's promise,
            Kalpavruksha finds the perfect pause.
          </p>
        </div>
      </section>

      {/* Section 8: Journey Home */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Journey Home <span className="text-emerald-600">Begins Here</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Every lasting story begins with one step. Let's take it together.
          </p>

          <div className="space-y-6">
            <CTAButton
              icon={<MapPin className="w-5 h-5" />}
              text="Schedule a Site Visit"
              primary
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton
                icon={<MessageCircle className="w-5 h-5" />}
                text="Talk to Us on WhatsApp"
              />
              <CTAButton
                icon={<Phone className="w-5 h-5" />}
                text="Request a Callback"
              />
              <a
                href="/mainBrouche.pdf"
                download
                className="inline-flex items-center h-fit w-fit  text-white rounded-full transition duration-200"
              >
                <CTAButton
                  icon={<Download className="w-5 h-5" />}
                  text="Download Project Brochure"
                /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Voices That Speak for <span className="text-emerald-600">Kalpavruksha</span>
            </h2>
            <p className="text-xl text-gray-600">
              Stories from those who came searching for land — and found a place that felt like home. <br />
              Real words. Real warmth. Real trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className=" rounded-2xl p-8 text-center  min-h-[600px] sm:min-h-[550px]">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              <span className='text-blue-500'>G</span>
              <span className='text-red-500'>o</span>
              <span className='text-yellow-500'>o</span>
              <span className='text-blue-500'>g</span>
              <span className='text-green-500'>l</span>
              <span className='text-red-500'>e</span>
              <span className='text-red-500'>{'  '}</span>
              Reviews</h3>

            <p className="text-gray-600">
              See what our customers are saying on Google Reviews
            </p>
            <div className='mt-6'>
              {/* <!-- Elfsight Google Reviews | Untitled Google Reviews --> */}
              <!-- Elfsight Google Reviews | Untitled Google Reviews -->
                <script src="https://elfsightcdn.com/platform.js" async></script>
                <div class="elfsight-app-60cbc103-358f-491e-9cd9-e210af3e21a9" data-elfsight-app-lazy></div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TreePine className="w-8 h-8 text-emerald-400" />
                <span className="ml-2 text-xl font-bold">Kalpavruksha</span>
              </div>
              <p className="text-gray-400">
                by Easy Homes - Creating communities where hearts belong
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Project</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Location</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Amenities</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Gallery</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <div className="flex gap-4">
                <div className=''>
                  <CTAButton
                    icon={<Phone className="w-4 h-4 " />}
                    text="Call Now"

                  />
                </div>
                <div>
                  <CTAButton
                    icon={<MessageCircle className="w-4 h-4" />}
                    text="WhatsApp"
                    primary
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Kalpavruksha by Easy Homes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default KalpavrukshaPage;
