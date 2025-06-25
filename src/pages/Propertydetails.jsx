import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Heart,
  Share2,
  Camera,
  Video,
  FileText,
  MapPin,
  Square,
  Home,
  Phone,
  Mail,
  TrendingUp,
  School,
  Car,
  ShoppingCart,
  Trees,
  Calendar,
  CheckCircle,
} from "lucide-react"
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import logo from '../assets/logo.png';
import { useNavigate } from "react-router-dom";


// Mock data
const propertyData = {
  name: "Amaravati Heights",
  location: "Nelpadu, Amaravati",
  areaRange: "200–500 sq.yds",
  priceRange: "₹15–35 Lakhs",
  status: "Available",
  propertyType: "Residential Plot",
  mlsNumber: "AMR2024001",

  media: {
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    ],
    videoTours: ["https://yourcdn.com/videos/property1-tour.mp4"],
    floorPlans: [
      "https://yourcdn.com/floorplans/property1-plan1.jpg",
      "https://yourcdn.com/floorplans/property1-plan2.jpg",
    ],
  },

  basicInformation: {
    lotSize: "200–500 sq.yds",
    homeType: "Residential Plot",
    monthlyCoastEstimate: "₹8,000 - ₹12,000",
  },

  propertyDescription:
    "A premium gated community project in the heart of Amaravati offering spacious plots with park-facing views and 24/7 security. Perfect for building your dream home in a well-planned community.",

  keyFeatures: [
    "Prime location in Amaravati",
    "Gated community with security",
    "Park-facing plots available",
    "Ready for construction",
    "Clear title documents",
  ],

  exteriorFeatures: ["Boundary wall", "Street lighting", "Paved roads", "Landscaping"],

  propertyInformation: {
    facing: "East/North",
    soilType: "Red soil",
    waterSource: "Bore well + Municipal supply",
  },

  constructionDetails: {
    approvals: "RERA approved",
    permissions: "Building permission ready",
    restrictions: "Residential use only",
  },

  marketValue: {
    currentValue: "₹25 Lakhs",
    estimatedValue: "₹28 Lakhs",
    pricePerSqYd: "₹500 - ₹700",
  },

  neighborhoodDetails: {
    area: "Nelpadu",
    district: "Amaravati",
    state: "Andhra Pradesh",
    pincode: "522020",
    nearbyLandmarks: [
      "Amaravati Government Complex - 2 km",
      "Buddha Park - 1.5 km",
      "International School - 3 km",
      "Shopping Mall - 2.5 km",
    ],
  },

  utilities: {
    electricity: "Available",
    water: "Municipal + Bore well",
    sewage: "Underground drainage",
    internet: "Fiber optic ready",
    gasConnection: "Pipeline gas available",
  },

  ownerAgent: {
    name: "Rajesh Kumar",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    phone: "+91 9876543210",
    email: "rajesh@amaravatiproperties.com",
    company: "Amaravati Properties",
    experience: "8 years",
    specialization: "Residential plots and villas",
  },

  additionalInfo: {
    ageOfProperty: "New Development",
    possession: "Immediate",
    financing: "Bank loan available",
    registration: "Ready for registration",
    amenities: ["Children's play area", "Community hall", "Jogging track", "Security cabin", "Visitor parking"],
  },
}

export default function PropertyDetails() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const navigate = useNavigate() ;
  const handleClick = ()=>{
    navigate('/searchProperties')
  }

  const sectionRefs = {
    overview: useRef(null),
    facts: useRef(null),
    market: useRef(null),
    neighborhood: useRef(null),
    contact: useRef(null),
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          setActiveTab(sectionId)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [])

  const scrollToSection = (sectionId) => {
    const element = sectionRefs[sectionId]?.current
    if (element) {
      const offset = 120
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
    }
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "facts", label: "Facts & Features" },
    { id: "market", label: "Market Value" },
    { id: "neighborhood", label: "Neighbourhood" },
    { id: "contact", label: "Contact Info" },
  ]

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" className="flex items-center gap-2" onClick={()=>handleClick()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Search</span>
            </Button>

            <div className="max-w-72">
              <img src={logo} alt="" />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFavorited(!isFavorited)} className="p-2">
                <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {isScrolled && (
        <nav className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto no-scrollbar removeScorll">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      <div className="pt-16">
        {/* Media  */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-96 lg:h-[500px]">
              <div className="lg:col-span-2 relative group cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                <img
                  src={propertyData.media.images[selectedImage] || "/placeholder.svg"}
                  alt="Property main view"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg" />
              </div>

              <div className="hidden lg:grid lg:col-span-2 grid-cols-2 gap-4">
                {propertyData.media.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Property view ${index + 2}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowAllPhotos(true)}>
                <Camera className="h-4 w-4" />
                See all photos ({propertyData.media.images.length})
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                360° tour
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Floor plans
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Section */}
              <section id="overview" ref={sectionRefs.overview} className="scroll-mt-32">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{propertyData.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{propertyData.location}</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-4">{propertyData.priceRange}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Area</div>
                      <div className="font-semibold">{propertyData.areaRange}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Home className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Type</div>
                      <div className="font-semibold">{propertyData.propertyType}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-green-600">{propertyData.status}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Possession</div>
                      <div className="font-semibold">{propertyData.additionalInfo.possession}</div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Property Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{propertyData.propertyDescription}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Price History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Current Price</span>
                          <span className="font-semibold">{propertyData.marketValue.currentValue}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Estimated Value</span>
                          <span className="font-semibold text-green-600">
                            {propertyData.marketValue.estimatedValue}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Price per Sq.Yd</span>
                          <span className="font-semibold">{propertyData.marketValue.pricePerSqYd}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/*  Features Section */}
              <section id="facts" ref={sectionRefs.facts} className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Facts & Features</h2>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {propertyData.keyFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Exterior Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {propertyData.exteriorFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Property Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Facing</span>
                            <span className="font-medium">{propertyData.propertyInformation.facing}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Soil Type</span>
                            <span className="font-medium">{propertyData.propertyInformation.soilType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Water Source</span>
                            <span className="font-medium">{propertyData.propertyInformation.waterSource}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Utilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(propertyData.utilities).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Location Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.6427168935!2d80.37739!3d16.5449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDMyJzQxLjYiTiA4MMKwMjInMzguNiJF!5e0!3m2!1sen!2sin!4v1234567890"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Market Value Section */}
              <section id="market" ref={sectionRefs.market} className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Value</h2>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Property Valuation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{propertyData.marketValue.currentValue}</div>
                        <div className="text-sm text-gray-600">Current Value</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {propertyData.marketValue.estimatedValue}
                        </div>
                        <div className="text-sm text-gray-600">Estimated Value</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {propertyData.marketValue.pricePerSqYd}
                        </div>
                        <div className="text-sm text-gray-600">Price per Sq.Yd</div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Market Analysis</h4>
                      <p className="text-sm text-gray-600">
                        This property is priced competitively in the Amaravati market. The estimated value shows
                        potential for appreciation, making it a good investment opportunity.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Neighborhood Section */}
              <section id="neighborhood" ref={sectionRefs.neighborhood} className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Neighbourhood Insights</h2>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nearby Landmarks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {propertyData.neighborhoodDetails.nearbyLandmarks.map((landmark, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{landmark}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <School className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-semibold">Schools</div>
                      <div className="text-sm text-gray-600">Excellent</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Car className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="font-semibold">Transit</div>
                      <div className="text-sm text-gray-600">Good</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="font-semibold">Shopping</div>
                      <div className="text-sm text-gray-600">Very Good</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Trees className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="font-semibold">Parks</div>
                      <div className="text-sm text-gray-600">Excellent</div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Area Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Area</span>
                            <span className="font-medium">{propertyData.neighborhoodDetails.area}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">District</span>
                            <span className="font-medium">{propertyData.neighborhoodDetails.district}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">State</span>
                            <span className="font-medium">{propertyData.neighborhoodDetails.state}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pincode</span>
                            <span className="font-medium">{propertyData.neighborhoodDetails.pincode}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contact" ref={sectionRefs.contact} className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={propertyData.ownerAgent.photo || "/placeholder.svg"}
                          alt={propertyData.ownerAgent.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2">{propertyData.ownerAgent.name}</h3>
                        <p className="text-gray-600 mb-1">{propertyData.ownerAgent.company}</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {propertyData.ownerAgent.experience} experience • {propertyData.ownerAgent.specialization}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {propertyData.ownerAgent.phone}
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Agent
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-4">Send a Message</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input placeholder="Your Name" />
                          <Input placeholder="Your Email" type="email" />
                        </div>
                        <Textarea placeholder="Your Message" rows={4} />
                        <Button className="w-full bg-blue-600 text-white">Send Message</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Cost Estimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-4">
                      {propertyData.basicInformation.monthlyCoastEstimate}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Maintenance</span>
                        <span>₹2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Tax</span>
                        <span>₹1,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span>₹500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {propertyData.additionalInfo.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3 hidden lg:block">
                  <Button size="lg" className="w-full bg-blue-600 text-white">
                    Request a Tour
                  </Button>
                  <Button size="lg" variant="outline" className="w-full bg-blue-600 text-white">
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Contact Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex gap-3">
          <Button size="lg" className="flex-1 bg-blue-600 text-white">
            Request Tour
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-blue-600 text-white">
            Apply Now
          </Button>
        </div>
      </div>

      {/* Full Screen Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">Property Photos</h3>
              <Button
                variant="ghost"
                onClick={() => setShowAllPhotos(false)}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
              {propertyData.media.images.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Property view ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
