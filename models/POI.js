const mongoose = require('mongoose');

const POISchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // e.g., 'Masjid', 'Shop', 'Park'
  iconUnicode: { type: String, default: '📍' }, // Added icon Unicode/Emoji
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  radiusMeters: { type: Number, default: 50 } // The radius to check if a device "visited" this POI
});

POISchema.index({ location: '2dsphere' });
module.exports = mongoose.model('POI', POISchema);
