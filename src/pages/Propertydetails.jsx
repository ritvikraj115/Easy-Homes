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
import { useLocation, useNavigate } from "react-router-dom";
import PropertyLocationMap from "../components/PropertyLocationMap";
import apiClient from "../api";

export default function PropertyDetails() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const navigate = useNavigate();
  const { state } = useLocation();
  const { property } = state || {};
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsFavorited(false);
      return;
    }

    apiClient
      .get('/api/favourites')
      .then(res => {
        const favIds = res.data; // array of mlsNumbers
        setIsFavorited(favIds.includes(property.mlsNumber));
      })
      .catch(err => {
        console.error('Error fetching favourites', err);
        setIsFavorited(false);
      });
  }, [property.mlsNumber]);  // re-run if the property changes
  const toggleFav = () => {
    // flip UI first for snappy response
    setIsFavorited(fav => !fav);

    const call = isFavorited
      ? apiClient.delete(`/api/favourites/${property.mlsNumber}`)
      : apiClient.post(`/api/favourites/${property.mlsNumber}`);

    call.catch(err => {
      console.error(err);
      // revert UI if the call fails
      setIsFavorited(fav => !fav);
    });
  };


  const handleClick = () => {
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
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => handleClick()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Search</span>
            </Button>

            <div className="max-w-72">
              <img src={logo} alt="" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFav}
                className="p-2"
                aria-label={
                  isFavorited
                    ? "Remove from favourites"
                    : "Add to favourites"
                }
              >
                <Heart
                  className={`h-5 w-5 ${isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600"
                    }`}
                />
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
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
                  src={property.media.images[selectedImage] || "/placeholder.svg"}
                  alt="Property main view"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg" />
              </div>

              <div className="hidden lg:grid lg:col-span-2 grid-cols-2 gap-4">
                {property.media.images.slice(1, 5).map((image, index) => (
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
                See all photos ({property.media.images.length})
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location}</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-4">{property.priceRange}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Area</div>
                      <div className="font-semibold">{property.areaRange}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Home className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Type</div>
                      <div className="font-semibold">{property.propertyType}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-green-600">{property.status}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Possession</div>
                      <div className="font-semibold">{property.additionalInfo.possession}</div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Property Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{property.propertyDescription}</p>
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
                          <span className="font-semibold">{property.marketValue.currentValue}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Estimated Value</span>
                          <span className="font-semibold text-green-600">
                            {property.marketValue.estimatedValue}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Price per Sq.Yd</span>
                          <span className="font-semibold">{property.marketValue.pricePerSqYd}</span>
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
                        {property.keyFeatures.map((feature, index) => (
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
                          {property.exteriorFeatures.map((feature, index) => (
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
                            <span className="font-medium">{property.propertyInformation.facing}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Soil Type</span>
                            <span className="font-medium">{property.propertyInformation.soilType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Water Source</span>
                            <span className="font-medium">{property.propertyInformation.waterSource}</span>
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
                        {Object.entries(property.utilities).map(([key, value]) => (
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
                        <PropertyLocationMap address={property.location} />
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
                        <div className="text-2xl font-bold text-blue-600">{property.marketValue.currentValue}</div>
                        <div className="text-sm text-gray-600">Current Value</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {property.marketValue.estimatedValue}
                        </div>
                        <div className="text-sm text-gray-600">Estimated Value</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {property.marketValue.pricePerSqYd}
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
                        {property.neighborhoodDetails.nearbyLandmarks.map((landmark, index) => (
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
                            <span className="font-medium">{property.neighborhoodDetails.area}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">District</span>
                            <span className="font-medium">{property.neighborhoodDetails.district}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">State</span>
                            <span className="font-medium">{property.neighborhoodDetails.state}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pincode</span>
                            <span className="font-medium">{property.neighborhoodDetails.pincode}</span>
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
                          src={property.ownerAgent.photo || "/placeholder.svg"}
                          alt={property.ownerAgent.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2">{property.ownerAgent.name}</h3>
                        <p className="text-gray-600 mb-1">{property.ownerAgent.company}</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {property.ownerAgent.experience} experience • {property.ownerAgent.specialization}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {property.ownerAgent.phone}
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
                        <Button className="w-full bg-[#3868B2]  text-white">Send Message</Button>
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
                      {property.basicInformation.monthlyCoastEstimate}
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
                      {property.additionalInfo.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3 hidden lg:block">
                  <Button size="lg" className="w-full bg-[#3868B2]  text-white">
                    Request a Tour
                  </Button>
                  <Button size="lg" variant="outline" className="w-full bg-[#3868B2]  text-white">
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
          <Button size="lg" className="flex-1 bg-[#3868B2]  text-white">
            Request Tour
          </Button>
          <Button size="lg" variant="outline" className="flex-1 bg-[#3868B2]  text-white">
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
              {property.media.images.map((image, index) => (
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
