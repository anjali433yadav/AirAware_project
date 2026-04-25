import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <span className={styles.brand}>🌬️ AirAware</span>
        <div className={styles.navBtns}>
          <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
          <button className={styles.registerBtn} onClick={() => navigate('/register')}>Register</button>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Breathe <span>Easy.</span><br />Live <span>Better.</span>
        </h1>
        <p className={styles.heroSub}>
          Real-time air quality tracking, personalized health advice, and<br />
          smart alerts to keep you and your loved ones protected.
        </p>
      </section>

      {/* Feature Cards */}
      <section className={styles.features}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ color: '#22c55e' }}>🌿 Monitor</h3>
          <p>Track live AQI data, PM2.5, NO2 and more.</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ color: '#f59e0b' }}>🔔 Alert</h3>
          <p>Set custom thresholds for your favorited cities.</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ color: '#a855f7' }}>🛡️ Protect</h3>
          <p>Get actionable health advice based on exact data.</p>
        </div>
      </section>
    </div>
  );
}
