import React from 'react';
import styles from './AirCard.module.css';

// Color is purely visual — AQI value itself is never modified
function aqiColor(aqi) {
  if (aqi <= 50)  return '#22c55e';
  if (aqi <= 100) return '#84cc16';
  if (aqi <= 150) return '#eab308';
  if (aqi <= 200) return '#f97316';
  if (aqi <= 300) return '#ef4444';
  return '#7c3aed';
}

function getAdvice(aqi) {
  let idx;
  if      (aqi <= 50)  idx = 0;
  else if (aqi <= 100) idx = 1;
  else if (aqi <= 150) idx = 2;
  else if (aqi <= 200) idx = 3;
  else                 idx = 4;

  const normal = [
    'Air quality is acceptable. Enjoy outdoor activities.',
    'Sensitive individuals should limit prolonged outdoor exertion.',
    'Reduce prolonged outdoor exertion. Wear a mask if needed.',
    'Avoid prolonged outdoor exertion. Stay indoors if possible.',
    'Avoid all outdoor activities. Keep windows closed.',
  ];
  const children = [
    'Safe for children to play outside.',
    'Unusually sensitive children should limit outdoor play.',
    'Children with asthma should limit outdoor activity.',
    'Children should avoid outdoor play. Keep them indoors.',
    'Children must stay indoors. Seek medical advice if breathing issues arise.',
  ];
  const elderly = [
    'Safe for elderly. Light outdoor walks are fine.',
    'Elderly with heart/lung conditions should limit exertion.',
    'Elderly should reduce outdoor activity and wear masks.',
    'Elderly should stay indoors and avoid physical exertion.',
    'Elderly must stay indoors. Seek immediate medical help if needed.',
  ];
  return { normal: normal[idx], children: children[idx], elderly: elderly[idx] };
}

export default function AirCard({ data }) {
  if (!data) return null;
  const color  = aqiColor(data.aqi);
  const advice = getAdvice(data.aqi);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.city}>{data.city}{data.country ? `, ${data.country}` : ''}</h2>
          {data.timestamp && (
            <span className={styles.timestamp}>🕐 Last updated: {data.timestamp}</span>
          )}
        </div>
        <span className={styles.aqiBadge} style={{ background: color }}>
          AQI {data.aqi}
        </span>
      </div>

      <div className={styles.metrics}>
        {[
          { label: 'PM2.5', value: data.pm25, unit: 'µg/m³' },
          { label: 'PM10',  value: data.pm10, unit: 'µg/m³' },
          { label: 'CO',    value: data.co,   unit: 'µg/m³' },
          { label: 'NO₂',   value: data.no2,  unit: 'µg/m³' },
          { label: 'O₃',    value: data.o3,   unit: 'µg/m³' },
          { label: 'SO₂',   value: data.so2,  unit: 'µg/m³' },
        ].map(m => (
          <div key={m.label} className={styles.metric}>
            <span className={styles.metricLabel}>{m.label}</span>
            <span className={styles.metricValue}>
              {m.value != null ? Number(m.value).toFixed(1) : '—'}
            </span>
            <span className={styles.metricUnit}>{m.unit}</span>
          </div>
        ))}
      </div>

      <div className={styles.adviceSection}>
        <h3>Advice & Precautions</h3>
        <div className={styles.adviceGrid}>
          <div className={styles.adviceCard}>
            <span>👤 General Public</span>
            <p>{advice.normal}</p>
          </div>
          <div className={styles.adviceCard}>
            <span>👶 Children</span>
            <p>{advice.children}</p>
          </div>
          <div className={styles.adviceCard}>
            <span>👴 Elderly</span>
            <p>{advice.elderly}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
