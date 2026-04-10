import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import AirCard from '../components/AirCard';
import Spinner from '../components/Spinner';
import styles from './CityDetail.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function CityDetail() {
  const BASE_URL = "https://airaware-project.onrender.com";
  const { cityName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [airData, setAirData] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState(null);
  const [threshold, setThreshold] = useState(150);
  const [showThresholdInput, setShowThresholdInput] = useState(false);
  const [thresholdAlert, setThresholdAlert] = useState(false);
  const [setFavorites] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      const storedCity = sessionStorage.getItem('cityName');
      const lat = sessionStorage.getItem('lat');
      const lon = sessionStorage.getItem('lon');

      // If this city matches the live location city, use bylocation (avoids geocode failure)
      if (lat && lon && storedCity && storedCity.toLowerCase() === decodeURIComponent(cityName).toLowerCase()) {
        res = await axios.get(`${BASE_URL}/api/air/bylocation`, { params: { lat, lon }, headers });
      } else {
        res = await axios.get(`${BASE_URL}/api/air/current`, { params: { city: decodeURIComponent(cityName) }, headers });
      }
      setAirData(res.data);

      // Check favorites
      const favRes = await axios.get('/api/favorites', { headers });
      setFavorites(favRes.data);
      const existing = favRes.data.find(f => f.city.toLowerCase() === res.data.city.toLowerCase());
      if (existing) {
        setIsFav(true);
        setFavId(existing._id);
        setThreshold(existing.threshold);
        if (res.data.aqi >= existing.threshold) setThresholdAlert(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-fetch history if ?history=1 is in URL, but only after airData is loaded
  useEffect(() => {
    if (airData && searchParams.get('history') === '1' && history.length === 0) {
      fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airData]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const cityQuery = airData?.city || decodeURIComponent(cityName);
      const res = await axios.get(`${BASE_URL}/api/air/history`, { params: { city: cityQuery }, headers });
      setHistory(res.data);
      setShowHistory(true);
    } catch {}
    finally { setHistoryLoading(false); }
  };


  const toggleFavorite = async () => {
    if (isFav) {
      await axios.delete(`${BASE_URL}/api/favorites/${favId}`, { headers });
      setIsFav(false); setFavId(null);
    } else {
      const res = await axios.post(`${BASE_URL}/api/favorites`, { city: airData.city, threshold }, { headers });
      setIsFav(true); setFavId(res.data._id);
    }
  };

  const updateThreshold = async (val) => {
    setThreshold(val);
    if (favId) {
      await axios.put(`${BASE_URL}/api/favorites/${favId}`, { threshold: val }, { headers });
    }
    if (airData && airData.aqi >= val) setThresholdAlert(true);
    else setThresholdAlert(false);
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    },
  };

  const makeChartData = (data, labelKey, valueKey, color) => ({
    labels: data.map(d => d[labelKey]),
    datasets: [{
      label: valueKey.toUpperCase(),
      data: data.map(d => d[valueKey]),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 2,
    }],
  });

  return (
    <div className={styles.page}>
      {thresholdAlert && (
        <div className={styles.alertPopup}>
          <span>⚠️</span>
          <div>
            <strong>AQI Alert for {airData?.city}!</strong>
            <p>Current AQI ({airData?.aqi}) has exceeded your threshold ({threshold}).</p>
          </div>
          <button onClick={() => setThresholdAlert(false)}>✕</button>
        </div>
      )}

      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.heading}>🏙️ {airData?.city || decodeURIComponent(cityName)}</h1>
        <div className={styles.topActions}>
          {airData && (
            <>
              <button className={isFav ? styles.favActive : styles.favBtn} onClick={toggleFavorite}>
                {isFav ? '⭐ Saved' : '☆ Favorite'}
              </button>
              <button className={styles.histBtn} onClick={showHistory ? () => setShowHistory(false) : fetchHistory}>
                📊 {showHistory ? 'Hide' : 'Show'} 7-Day History
              </button>
            </>
          )}
        </div>
      </div>

      {isFav && (
        <div className={styles.thresholdBar}>
          <span>AQI Alert Threshold: <strong>{threshold}</strong></span>
          <button className={styles.editThreshBtn} onClick={() => setShowThresholdInput(!showThresholdInput)}>
            ✏️ Edit
          </button>
          {showThresholdInput && (
            <div className={styles.thresholdInput}>
              <input
                type="number"
                value={threshold}
                min={1} max={500}
                onChange={e => updateThreshold(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      )}

      {loading && <Spinner message="Loading air quality data..." />}
      {error && <div className={styles.error}>{error}</div>}
      {airData && <AirCard data={airData} />}

      {historyLoading && <Spinner message="Loading 7-day history..." />}

      {showHistory && history.length > 0 && (
        <div className={styles.chartSection}>
          <h3>📈 7-Day AQI History (Daily Average)</h3>
          <Bar data={makeChartData(history, 'date', 'aqi', 'rgba(56,189,248,0.7)')} options={chartOptions} />
          <div className={styles.multiCharts}>
            <div className={styles.chartBox}>
              <h4>PM2.5</h4>
              <Bar data={makeChartData(history, 'date', 'pm25', 'rgba(167,139,250,0.7)')} options={chartOptions} />
            </div>
            <div className={styles.chartBox}>
              <h4>PM10</h4>
              <Bar data={makeChartData(history, 'date', 'pm10', 'rgba(251,191,36,0.7)')} options={chartOptions} />
            </div>
            <div className={styles.chartBox}>
              <h4>CO</h4>
              <Bar data={makeChartData(history, 'date', 'co', 'rgba(248,113,113,0.7)')} options={chartOptions} />
            </div>
            <div className={styles.chartBox}>
              <h4>NO₂</h4>
              <Bar data={makeChartData(history, 'date', 'no2', 'rgba(52,211,153,0.7)')} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
      {showHistory && history.length === 0 && (
        <div className={styles.noData}>No history data yet for <strong>{airData?.city || cityName}</strong>. Visit this city a few times and data will appear here.</div>
      )}

    </div>
  );
}
