const router = require('express').Router();
const axios  = require('axios');
const AirHistory = require('../models/AirHistory');
const auth   = require('../middleware/auth');

const WAQI_BASE   = 'https://api.waqi.info/feed';
const WAQI_SEARCH = 'https://api.waqi.info/search/';
const TOKEN       = () => process.env.WAQI_TOKEN;

// Parse WAQI feed response — raw values, no conversion
function parseWAQI(data) {
  const iaqi = data.iaqi || {};
  const aqi  = typeof data.aqi === 'number' ? data.aqi : parseInt(data.aqi);
  return {
    city:      data.city?.name || 'Unknown',
    aqi,
    pm25:      iaqi.pm25?.v ?? null,
    pm10:      iaqi.pm10?.v ?? null,
    co:        iaqi.co?.v   ?? null,
    no2:       iaqi.no2?.v  ?? null,
    o3:        iaqi.o3?.v   ?? null,
    so2:       iaqi.so2?.v  ?? null,
    timestamp: data.time?.s  || null,
  };
}

// Try city name → fallback to search API → fetch full data by @uid
async function fetchByCity(city) {
  // 1. Try direct city name
  const direct = await axios.get(`${WAQI_BASE}/${encodeURIComponent(city)}/`, {
    params: { token: TOKEN() }
  });
  if (direct.data.status === 'ok') return parseWAQI(direct.data.data);

  // 2. Fallback: search for nearest monitoring station
  const search = await axios.get(WAQI_SEARCH, {
    params: { token: TOKEN(), keyword: city }
  });
  if (search.data.status !== 'ok' || !search.data.data.length)
    throw new Error('No air quality data found for this city');

  // First result is most relevant/closest
  const uid = search.data.data[0].uid;

  // 3. Fetch full pollutant data for that station
  const station = await axios.get(`${WAQI_BASE}/@${uid}/`, {
    params: { token: TOKEN() }
  });
  if (station.data.status !== 'ok')
    throw new Error('Failed to fetch station data');

  return parseWAQI(station.data.data);
}

// GET /api/air/current?city=Mumbai
router.get('/current', auth, async (req, res) => {
  try {
    const data = await fetchByCity(req.query.city);
    await AirHistory.create({
      city: data.city, aqi: data.aqi,
      pm25: data.pm25, pm10: data.pm10,
      co: data.co, no2: data.no2, o3: data.o3, so2: data.so2,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/air/bylocation?lat=&lon=
router.get('/bylocation', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const r = await axios.get(`${WAQI_BASE}/geo:${lat};${lon}/`, {
      params: { token: TOKEN() }
    });
    if (r.data.status !== 'ok')
      return res.status(404).json({ message: 'No station found near your location' });
    const data = parseWAQI(r.data.data);
    await AirHistory.create({
      city: data.city, aqi: data.aqi,
      pm25: data.pm25, pm10: data.pm10,
      co: data.co, no2: data.no2, o3: data.o3, so2: data.so2,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/air/history?city=  — 7-day daily averages from DB
router.get('/history', auth, async (req, res) => {
  try {
    const { city } = req.query;
    const allRecords = await AirHistory.find({
      city: { $regex: new RegExp(city, 'i') }
    }).sort({ timestamp: -1 });

    if (!allRecords.length) return res.json([]);

    const grouped = {};
    allRecords.forEach(r => {
      const day = r.timestamp.toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = { aqi: [], pm25: [], pm10: [], co: [], no2: [] };
      grouped[day].aqi.push(r.aqi);
      if (r.pm25 != null) grouped[day].pm25.push(r.pm25);
      if (r.pm10 != null) grouped[day].pm10.push(r.pm10);
      if (r.co   != null) grouped[day].co.push(r.co);
      if (r.no2  != null) grouped[day].no2.push(r.no2);
    });

    const avg = arr => arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

    const result = Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, vals]) => ({
        date,
        aqi:  avg(vals.aqi),
        pm25: avg(vals.pm25),
        pm10: avg(vals.pm10),
        co:   avg(vals.co),
        no2:  avg(vals.no2),
      }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
