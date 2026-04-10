import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './Favorites.module.css';

export default function Favorites() {
  const BASE_URL = "https://airaware-project.onrender.com";
  const { token } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${BASE_URL}/api/favorites`, { headers })
      .then(res => setFavorites(res.data))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFav = async (id) => {
    await axios.delete(`${BASE_URL}/api/favorites/${id}`, { headers });
    setFavorites(prev => prev.filter(f => f._id !== id));
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>⭐ Favorite Cities</h1>
      {loading && <div className={styles.loading}>Loading favorites...</div>}
      {!loading && favorites.length === 0 && (
        <div className={styles.empty}>
          <p>No favorite cities yet.</p>
          <p>Search for a city and click the ☆ Favorite button to save it here.</p>
          <button className={styles.searchBtn} onClick={() => navigate('/denied')}>
            🔍 Search Cities
          </button>
        </div>
      )}
      <div className={styles.grid}>
        {favorites.map(fav => (
          <div key={fav._id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3>{fav.city}</h3>
              <span className={styles.threshold}>Threshold: AQI {fav.threshold}</span>
            </div>
            <div className={styles.cardActions}>
              <button className={styles.viewBtn} onClick={() => navigate(`/city/${encodeURIComponent(fav.city)}`)}>
                🌍 View Air Data
              </button>
              <button className={styles.histBtn} onClick={() => navigate(`/city/${encodeURIComponent(fav.city)}?history=1`)}>
                📊 History
              </button>
              <button className={styles.removeBtn} onClick={() => removeFav(fav._id)}>
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
