require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({
  origin:"air-aware-project-lcfm.vercel.app",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.send({
    "message": "SERVER IS OK",
    "timestamp": Date.now()
  })
})

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/air', require('./routes/air'));
app.use('/api/favorites', require('./routes/favorites'));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // Remove stale records saved with old OWM 1-5 AQI scale
    const AirHistory = require('./models/AirHistory');
    const deleted = await AirHistory.deleteMany({ aqi: { $lte: 5 } });
    if (deleted.deletedCount > 0)
      console.log(`Cleaned ${deleted.deletedCount} stale AQI records (old 1-5 scale)`);

    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('DB connection error:', err));
