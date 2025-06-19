import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [loc, setLoc] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onSearch(loc);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter city, neighborhood…"
        value={loc}
        onChange={e => setLoc(e.target.value)}
        style={{ width: '70%', padding: '8px', borderRadius: 'var(--radius)', border: '1px solid #ccc' }}
      />
      <button className="primary" type="submit" style={{ marginLeft: '8px' }}>Search</button>
    </form>
  );
}

