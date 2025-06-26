// client/src/components/PropertyCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/PropertyCard.css";

const PropertyCard = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const nextImage = () => {
    setCurrentImageIndex(i =>
      i === property.media.images.length - 1 ? 0 : i + 1
    );
  };
  const prevImage = () => {
    setCurrentImageIndex(i =>
      i === 0 ? property.media.images.length - 1 : i - 1
    );
  };
  const goToImage = i => setCurrentImageIndex(i);

  // ← Pass `property` as location state
  const handleClick = () =>
    navigate("/PropertyDetails", { state: { property } });

  return (
    <div className="property-card">
      <div className="pc-image-section">
        <img
          src={property.media.images[currentImageIndex] || "/placeholder.svg"}
          alt={property.name}
          className="pc-image"
        />

        {property.media.images.length > 1 && (
          <>
            <button className="pc-arrow pc-arrow-left" onClick={prevImage}>
              ‹
            </button>
            <button className="pc-arrow pc-arrow-right" onClick={nextImage}>
              ›
            </button>
            <div className="pc-dots">
              {property.media.images.map((_, i) => (
                <button
                  key={i}
                  className={"pc-dot" + (i === currentImageIndex ? " active" : "")}
                  onClick={() => goToImage(i)}
                />
              ))}
            </div>
          </>
        )}

        <div className="pc-badge">{property.status}</div>
      </div>

      <div className="pc-content" onClick={handleClick}>
        <h3 className="pc-title">{property.name}</h3>
        <p className="pc-location">{property.location}</p>
        <p className="pc-details">
          {property.areaRange} | {property.propertyType} |{" "}
          {property.basicInformation.homeType}
        </p>
        <p className="pc-price">{property.priceRange}</p>

        <div className="pc-features">
          {property.keyFeatures.slice(0, 3).map((feat, i) => (
            <span key={i} className="pc-feature">{feat}</span>
          ))}
        </div>

        {property.ownerAgent && (
          <div className="pc-agent">
            <p className="agent-name">{property.ownerAgent.name}</p>
            <p className="agent-phone">{property.ownerAgent.phone}</p>
          </div>
        )}

        <button className="pc-button" onClick={handleClick}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;


