import { useState } from "react"
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const navigate = useNavigate();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === property.media.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? property.media.images.length - 1 : prev - 1))
  }

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  const handleClick = () => {
    navigate(`/PropertyDetails`);
  };
  return (
    <div 
    className="w-full max-w-[435px] my-2 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ">
      {/* Image Section with Swipe */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={property.media.images[currentImageIndex] || "/placeholder.svg"}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Navigation Arrows */}
        {property.media.images.length > 1 && (
          <>
            <button
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none w-8 h-8 rounded-full text-sm cursor-pointer flex items-center justify-center transition-colors duration-200 z-10"
              onClick={prevImage}
            >
              ‹
            </button>
            <button
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none w-8 h-8 rounded-full text-sm cursor-pointer flex items-center justify-center transition-colors duration-200 z-10"
              onClick={nextImage}
            >
              ›
            </button>
          </>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
          {property.status}
        </div>

        {/* Image Dots */}
        {property.media.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {property.media.images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full border-none cursor-pointer transition-colors duration-200 ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 cursor-pointer" 
          onClick={()=>handleClick()}
      >
        {/* Property Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">{property.name}</h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
          {property.location}
        </div>

        {/* Property Details */}
        <div className="text-gray-600 text-sm mb-2 leading-tight">
          {property.areaRange} | {property.propertyType} | {property.basicInformation.homeType}
        </div>

        {/* Price */}
        <div className="text-xl font-bold text-blue-600 mb-3">{property.priceRange}</div>

        {/* Key Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {property.keyFeatures.slice(0, 3).map((feature, index) => (
            <span key={index} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Contact Info (if available) */}
        {property.ownerAgent && (
          <div className="bg-gray-50 p-2 rounded-md mb-3">
            <div className="font-semibold text-gray-900 text-sm mb-1">{property.ownerAgent.name}</div>
            <div className="text-gray-600 text-xs">{property.ownerAgent.phone}</div>
          </div>
        )}

        {/* Action Button */}
        <button
        onClick={handleClick} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none py-2 px-4 rounded-md text-sm font-semibold cursor-pointer transition-colors duration-200">
          View Details
        </button>
      </div>
    </div>
  )
}

export default PropertyCard
