import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import styles from './LocationGate.module.css';

export default function LocationGate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleAccess = () => {
    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sessionStorage.setItem('lat', pos.coords.latitude);
        sessionStorage.setItem('lon', pos.coords.longitude);
        // loading stays true — spinner shows until dashboard loads
        navigate('/dashboard');
      },
      () => {
        sessionStorage.removeItem('lat');
        sessionStorage.removeItem('lon');
        sessionStorage.removeItem('cityName');
        setLoading(false);
        setError('Location access denied. Please search for a city manually.');
      }
    );
  };

  const handleDeny = () => {
    sessionStorage.removeItem('lat');
    sessionStorage.removeItem('lon');
    sessionStorage.removeItem('cityName');
    navigate('/denied');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Spinner message="Getting your location..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>📍</div>
        <h2>Location Access</h2>
        <p>AirAware needs your location to show real-time air quality data for your city.</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttons}>
          <button className={styles.allow} onClick={handleAccess}>
            ✅ Allow Location
          </button>
          <button className={styles.deny} onClick={handleDeny}>
            ❌ Deny Location
          </button>
        </div>
      </div>
    </div>
  );
}
