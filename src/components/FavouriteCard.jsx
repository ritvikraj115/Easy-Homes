// client/src/components/FavouriteCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'react-feather';
import '../assets/favourites.css';

export default function FavouriteCard({
  property,
  isSelected,
  onToggle,
  onRemove
}) {
  const navigate = useNavigate();
  const imgSrc = property.media?.images?.[0] || '/placeholder.svg';

  return (
    <div className="fav-card">
      <div className="fav-image-wrapper" onClick={() => navigate(`/property/${property.mlsNumber}`)}>
        <img src={imgSrc} alt={property.name} className="fav-image" loading="lazy"
  decoding="async" />
      </div>
      <div className="fav-body">
        <div className="fav-top">
          <label className="fav-checkbox">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggle}
            />
            <span />
          </label>
          <button className="fav-remove" onClick={onRemove} aria-label="Remove">
            <X size={16} />
          </button>
        </div>
        
        <h3 className="fav-title" onClick={() => navigate(`/PropertyDetails`, { state: { property } })}>
          {property.name}
        </h3>
        <p className="fav-location">{property.location}</p>

        <div className="fav-details">
          <span>{property.areaRange}</span>
          <span>•</span>
          <span>{property.propertyType}</span>
        </div>

        <p className="fav-price">{property.priceRange}</p>

        <button
          className="fav-view"
          onClick={() => navigate(`/property/${property.mlsNumber}`)}
        >
          View Details
        </button>
      </div>
    </div>
);
}

