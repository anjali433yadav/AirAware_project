import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AirCard from '../components/AirCard';
import Spinner from '../components/Spinner';
import BASE_URL from '../config';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const lat = sessionStorage.getItem('lat');
    const lon = sessionStorage.getItem('lon');
    if (!lat || !lon) { navigate('/location'); return; }

    axios.get(`${BASE_URL}/api/air/bylocation`, {
      params: { lat, lon },
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setAirData(res.data);
        sessionStorage.setItem('cityName', res.data.city);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch air data'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/city/${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>🌍 Your City Air Quality</h1>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input className={styles.searchInput} placeholder="Search another city..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </div>

      {loading && <Spinner message="Fetching your city's air quality..." />}
      {error && <div className={styles.error}>{error}</div>}
      {airData && (
        <>
          <AirCard data={airData} />
          <div className={styles.actions}>
            <button className={styles.histBtn} onClick={() => navigate(`/city/${encodeURIComponent(airData.city)}?history=1`)}>
              📊 View 7-Day History
            </button>
            <button className={styles.favBtn} onClick={() => navigate('/favorites')}>
              ⭐ My Favorites
            </button>
          </div>
        </>
      )}
    </div>
  );
}
