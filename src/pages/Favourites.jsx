// client/src/pages/Favourites.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import '../assets/favourites.css';
import FavouriteCard from '../components/FavouriteCard';
import useProperties from '../hooks/useProperties';

export default function Favourites() {
  const { properties, loading: propertiesLoading } = useProperties();
  const [favourites, setFavourites] = useState([]); // holds full property objects
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    // Read token _inside_ the effect at the moment we need it
    const token = localStorage.getItem('token');
    if (!token) {
      setFavourites([]);
      return;
    }
    if (propertiesLoading) return;

    apiClient
      .get('/api/favourites')
      .then(res => {
        const savedIds = res.data; // ['AMR2024001', ...]
        const fullProps = properties.filter(p =>
          savedIds.includes(p.mlsNumber)
        );
        setFavourites(fullProps);
      })
      .catch(err => {
        console.error('Error loading favourites', err);
        setFavourites([]);
      });
  }, [properties, propertiesLoading]);  // run when properties are loaded
  const toggleSelect = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const removeFavourite = id => {
    // Optimistic UI remove
    setFavourites(prev => prev.filter(p => p.mlsNumber !== id));
    setSelected(prev => prev.filter(x => x !== id));
    apiClient.delete(`/api/favourites/${id}`).catch(console.error);
  };

  const startCompare = () => {
    if (selected.length < 2 || selected.length > 5) {
      alert('Select between 2 and 5 properties to compare.');
      return;
    }
    navigate(`/compare?ids=${selected.join(',')}`);
  };

  return (
    <div className="favourites-page container">
      <h2>Saved homes</h2>

      {favourites.length === 0 ? (
        <div className="favourites-empty">
          <p>You haven’t saved any properties yet.</p>
        </div>
      ) : (
        <div className="favourites-grid">
          {favourites.map(property => (
            <FavouriteCard
              key={property.mlsNumber}
              property={property}
              isSelected={selected.includes(property.mlsNumber)}
              onToggle={() => toggleSelect(property.mlsNumber)}
              onRemove={() => removeFavourite(property.mlsNumber)}
            />
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="compare-bar">
          <p>
            {selected.length} selected for comparison
          </p>
          <button onClick={startCompare}>
            Compare {selected.length}
          </button>
        </div>
      )}
    </div>
  );
}


