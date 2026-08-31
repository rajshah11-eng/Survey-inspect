const mongoose = require('mongoose');

const DeviceLocationSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  timestamp: { type: Date, default: Date.now }
});

// CRITICAL: 2dsphere index for geospatial queries
DeviceLocationSchema.index({ location: '2dsphere' });
DeviceLocationSchema.index({ timestamp: -1 });

module.exports = mongoose.model('DeviceLocation', DeviceLocationSchema);
