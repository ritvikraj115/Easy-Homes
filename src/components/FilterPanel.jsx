import React, { useState, useRef, useEffect } from 'react';
import '../assets/filterPanel.css';

export default function FilterPanel({ filters, onChange }) {
  const [openKey, setOpenKey]     = useState(null);
  const [showMobile, setShowMobile] = useState(false);
  const containerRef             = useRef();

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const toggle = key => setOpenKey(o => (o === key ? null : key));
  const typeOptions = ['Plot', 'Apartment', 'Villa'];

  // close any open dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenKey(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // pull out your filters into a function
  const renderDropdowns = () => (
    <>
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
            <span className="range-min">1 km</span>
            <span className="range-max">50 km</span>
          </div>
          <input
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
          Budget (Lacs): <span className="dropdown-value">Up to {filters.budget[1]} L</span>
          <span className={`arrow ${openKey === 'budget' ? 'open' : ''}`} />
        </button>
        <div className={`dropdown-menu ${openKey === 'budget' ? 'visible' : ''}`}>
          <div className="range-values">
            <span className="range-min">0 L</span>
            <span className="range-max">100 L</span>
          </div>
          <input
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
              className="dropdown-item"
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
          Size (sq.ft): <span className="dropdown-value">Up to {filters.size[1]} sq.ft</span>
          <span className={`arrow ${openKey === 'size' ? 'open' : ''}`} />
        </button>
        <div className={`dropdown-menu ${openKey === 'size' ? 'visible' : ''}`}>
          <div className="range-values">
            <span className="range-min">100 sq.ft</span>
            <span className="range-max">1000 sq.ft</span>
          </div>
          <input
            type="range"
            min="100"
            max="1000"
            value={filters.size[1]}
            onChange={e => update('size', [filters.size[0], +e.target.value])}
          />
        </div>
      </div>

      {/* Gated Community */}
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
    </>
  );

  return (
    <>
      {/* Inline panel (shown ≥ 930px) */}
      <div className="filter-panel" ref={containerRef}>
        {renderDropdowns()}
      </div>

      {/* Mobile bottom-sheet trigger & overlay (≤ 930px) */}
      <div className="mobile-filter-btn" onClick={() => setShowMobile(true)}>
        Filters
      </div>
      <div className={`mobile-filters-overlay ${showMobile ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setShowMobile(false)}>✕</button>
        <div className="filter-panel" ref={containerRef}>
          {renderDropdowns()}
        </div>
      </div>
    </>
  );
}





