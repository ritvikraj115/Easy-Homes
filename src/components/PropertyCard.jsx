// client/src/components/PropertyCard.jsx
import React from 'react';

export default function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <img src={property.image} alt={property.title} />
      <div className="property-info">
        <h3>{property.title}</h3>
        <p className="price">₹{property.price}</p>
        <p>{property.size} sq.ft</p>
        <a href={`/property/${property.id}`} className="view-details">
          View Details
        </a>
      </div>
    </div>
  );
}




