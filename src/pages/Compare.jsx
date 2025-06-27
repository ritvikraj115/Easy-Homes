// client/src/pages/Compare.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockProperties } from '../data/mockdata';
import '../assets/compare.css';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'interior', label: 'Interior' },
  { key: 'property', label: 'Property' },
  { key: 'hoa', label: 'HOA & Financial' },
  { key: 'community', label: 'Community & Neighborhood' },
];

export default function Compare() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const ids = new URLSearchParams(search).get('ids')?.split(',') || [];

  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (ids.length < 2) return navigate('/favourites');
    setProperties(mockProperties.filter(p => ids.includes(p.mlsNumber)));
  }, [navigate]);

  if (properties.length === 0) {
    return <div className="compare-loading">Loading comparison…</div>;
  }

  const rows = {
    overview: [
      ['Status', p => p.status],
      ['List price', p => p.priceRange],
      ['Bedrooms', p => p.basicInformation.beds],
      ['Bathrooms', p => p.basicInformation.baths],
      ['Area', p => p.basicInformation.lotSize],
    ],
    interior: [
      ['Key features', p => p.keyFeatures.join(', ')],
      ['Monthly estimate', p => p.basicInformation.monthlyCoastEstimate],
    ],
    property: [
      ['Type', p => p.propertyType],
      ['Facing', p => p.propertyInformation?.facing],
      ['Soil type', p => p.propertyInformation?.soilType],
    ],
    hoa: [
      ['Amenities', p => p.additionalInfo?.amenities.join(', ')],
      ['Financing', p => p.additionalInfo?.financing],
    ],
    community: [
      ['Neighborhood', p => p.neighborhoodDetails?.area],
      ['Landmarks', p => p.neighborhoodDetails?.nearbyLandmarks.join(', ')],
    ],
  };

  return (
    <div className="compare-page container">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Back to saved homes
      </button>
      <h2 className="compare-title">Compare homes</h2>

      <nav className="compare-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={tab.key === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="label-col" />
              {properties.map(p => (
                <th key={p.mlsNumber}>
                  <img src={p.media.images[0]} alt={p.name} />
                  <div className="prop-name">{p.name}</div>
                  <div className="prop-loc">{p.location}</div>
                  <div className="prop-price">{p.priceRange}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows[activeTab].map(([label, fn]) => (
              <tr key={label}>
                <td className="label-col">{label}</td>
                {properties.map(p => (
                  <td key={p.mlsNumber}>
                    {fn(p) ?? <span className="na">Not available</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

