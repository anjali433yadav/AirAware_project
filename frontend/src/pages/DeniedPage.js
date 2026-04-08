import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DeniedPage.module.css';

export default function DeniedPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/city/${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <span>📍</span>
        <p>Location access denied. Search for any city to check its air quality.</p>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          className={styles.input}
          placeholder="Enter city name (e.g. Mumbai, Delhi, London)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className={styles.btn}>🔍 Search</button>
      </form>

      <div className={styles.actions}>
        <button className={styles.favBtn} onClick={() => navigate('/favorites')}>
          ⭐ View Favorite Cities
        </button>
      </div>
    </div>
  );
}
