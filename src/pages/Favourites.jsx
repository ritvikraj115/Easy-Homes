// client/src/pages/Favourites.jsx
import React, { useEffect, useState } from 'react';
import '../assets/favourites.css';
import FavouriteCard from '../components/FavouriteCard';

export default function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    // TODO: Fetch from /api/favourites
    // setFavourites(response.data);
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeFavourite = (id) => {
    setFavourites((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => prev.filter((x) => x !== id));
    // Optionally: call API DELETE /api/favourites/:id
  };

  const startCompare = () => {
    if (selected.length < 2) {
      alert('Select at least 2 properties to compare.');
      return;
    }
    // Navigate to compare page or pass selected IDs
    window.location.href = `/compare?ids=${selected.join(',')}`;
  };

  return (
    <div className="favourites-page container">
      <h2>Your Favourites</h2>

      {favourites.length === 0 ? (
        <div className="favourites-empty">
          <p>You haven’t saved any properties yet.</p>
        </div>
      ) : (
        <div className="favourites-grid">
          {favourites.map((property) => (
            <FavouriteCard
              key={property.id}
              property={property}
              isSelected={selected.includes(property.id)}
              onToggle={() => toggleSelect(property.id)}
              onRemove={() => removeFavourite(property.id)}
            />
          ))}
        </div>
      )}

      {/* Sticky Bottom Bar */}
      {selected.length > 0 && (
        <div className="compare-bar">
          <p>{selected.length} selected for comparison</p>
          <button onClick={startCompare}>Start Compare</button>
        </div>
      )}
    </div>
  );
}
