// client/src/components/FavouriteCard.jsx
import React from 'react';

export default function FavouriteCard({ property, isSelected, onToggle, onRemove }) {
  return (
    <div className="fav-card">
      <img src={property.image} alt={property.title} />
      <div className="fav-info">
        <div className="fav-header">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="compare-checkbox"
          />
          <h3>{property.title}</h3>
        </div>
        <p>{property.size} sq.ft • ₹{property.price}</p>
        <div className="fav-actions">
          <a href={`/property/${property.id}`} className="view-btn">View Details</a>
          <button className="remove-btn" onClick={onRemove}>Remove</button>
        </div>
      </div>
    </div>
  );
}
