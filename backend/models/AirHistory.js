const mongoose = require('mongoose');

const airHistorySchema = new mongoose.Schema({
  city:      { type: String, required: true, index: true },
  aqi:       Number,
  pm25:      Number,
  pm10:      Number,
  co:        Number,
  no2:       Number,
  o3:        Number,
  so2:       Number,
  timestamp: { type: Date, default: Date.now },
});

// Auto-delete documents older than 7 days
airHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('AirHistory', airHistorySchema);
