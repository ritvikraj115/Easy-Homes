import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PropCard = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(i =>
      i === property.media.images.length - 1 ? 0 : i + 1
    );
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(i =>
      i === 0 ? property.media.images.length - 1 : i - 1
    );
  };
  const goToImage = (i, e) => {
    e.stopPropagation();
    setCurrentImageIndex(i);
  };

  const handleClick = () =>
    navigate("/PropertyDetails", { state: { property } });

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg w-full max-w-xs mx-auto"
      onClick={handleClick}
    >
      <div className="relative h-40 md:h-48">
        <img
          src={property.media.images[currentImageIndex] || "/placeholder.svg"}
          alt={property.name}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        {property.media.images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
              onClick={prevImage}
              aria-label="Previous image"
            >‹</button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
              onClick={nextImage}
              aria-label="Next image"
            >›</button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {property.media.images.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentImageIndex ? "bg-blue-500" : "bg-white border border-blue-200"}`}
                  onClick={(e) => goToImage(i, e)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          {property.status}
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{property.name}</h3>
        <p className="text-sm text-gray-500 mb-1">{property.location}</p>
        <p className="text-xs text-gray-400 mb-1 truncate">{property.areaRange} | {property.propertyType} | {property.basicInformation.homeType}</p>
        <p className="text-base font-bold text-blue-700 mb-2">{property.priceRange}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {property.keyFeatures.slice(0, 3).map((feat, i) => (
            <span key={i} className="bg-blue-50 text-blue-700 text-xs rounded px-2 py-0.5">{feat}</span>
          ))}
        </div>
        {property.ownerAgent && (
          <div className="border-t pt-2 mt-auto">
            <p className="text-xs font-semibold text-gray-700">{property.ownerAgent.name}</p>
            <p className="text-xs text-gray-400">{property.ownerAgent.phone}</p>
          </div>
        )}
        <button
          className="mt-3 w-full bg-blue-600 text-white text-sm font-semibold rounded py-2 hover:bg-blue-700 transition"
          onClick={e => { e.stopPropagation(); handleClick(); }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropCard;
