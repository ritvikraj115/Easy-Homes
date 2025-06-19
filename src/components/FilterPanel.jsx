import React, { useState, useRef, useEffect } from 'react';
import '../assets/filterPanel.css';

export default function FilterPanel({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const [openKey, setOpenKey] = useState(null);
  const containerRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenKey(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = key => setOpenKey(o => (o === key ? null : key));
  const typeOptions = ['Plot', 'Apartment'];

  return (
    <div className="filter-panel" ref={containerRef}>

      {/* Radius */}
      <div className="dropdown">
        <button
          className={`dropdown-header ${openKey === 'radius' ? 'open' : ''}`}
          onClick={() => toggle('radius')}
        >
          Radius (km): <span className="dropdown-value">{filters.radius} km</span>
          <span className={`arrow ${openKey === 'radius' ? 'open' : ''}`} />
        </button>
        <div className={`dropdown-menu ${openKey === 'radius' ? 'visible' : ''}`}>
          <div className="range-values">
            <span className="range-min">1 km</span>
            <span className="range-max">50 km</span>
          </div>
          <input
            className="slider"
            type="range"
            min="1"
            max="50"
            value={filters.radius}
            onChange={e => update('radius', +e.target.value)}
          />
        </div>
      </div>

      {/* Budget */}
      <div className="dropdown">
        <button
          className={`dropdown-header ${openKey === 'budget' ? 'open' : ''}`}
          onClick={() => toggle('budget')}
        >
          Budget (Lacs): <span className="dropdown-value">Up to {filters.budget[1]} L</span>
          <span className={`arrow ${openKey === 'budget' ? 'open' : ''}`} />
        </button>
        <div className={`dropdown-menu ${openKey === 'budget' ? 'visible' : ''}`}>
          <div className="range-values">
            <span className="range-min">0 L</span>
            <span className="range-max">100 L</span>
          </div>
          <input
            className="slider"
            type="range"
            min="0"
            max="100"
            value={filters.budget[1]}
            onChange={e => update('budget', [0, +e.target.value])}
          />
        </div>
      </div>

      {/* Type */}
      <div className="dropdown">
        <button
          className={`dropdown-header ${openKey === 'type' ? 'open' : ''}`}
          onClick={() => toggle('type')}
        >
          Type: <span className="dropdown-value">{filters.type}</span>
          <span className={`arrow ${openKey === 'type' ? 'open' : ''}`} />
        </button>
        <div className={`dropdown-menu ${openKey === 'type' ? 'visible' : ''}`}>
          {typeOptions.map(opt => (
            <button
              key={opt}
              className="dropdown-item centered"
              onClick={() => { update('type', opt); setOpenKey(null); }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="dropdown">
        <button
          className={`dropdown-header ${openKey === 'size' ? 'open' : ''}`}
          onClick={() => toggle('size')}
        >
          Size (sq.ft): <span className="dropdown-value">Up to {filters.size[1]} sq.ft</span>
          <span className={`arrow ${openKey === 'size' ? 'open' : ''}`} />
        </button>
        <div className={`dropdown-menu ${openKey === 'size' ? 'visible' : ''}`}>
          <div className="range-values">
            <span className="range-min">100 sq.ft</span>
            <span className="range-max">1000 sq.ft</span>
          </div>
          <input
            className="slider"
            type="range"
            min="100"
            max="1000"
            value={filters.size[1]}
            onChange={e => update('size', [filters.size[0], +e.target.value])}
          />
        </div>
      </div>

      {/* Gated Community (always visible tickbox) */}
      <div className="checkbox-filter">
        <label>
          <input
            type="checkbox"
            checked={filters.gated}
            onChange={e => update('gated', e.target.checked)}
          />
          <span>Gated Community</span>
        </label>
      </div>

    </div>
  );
}








