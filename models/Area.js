const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  boundary: {
    type: { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true }
  }
});

AreaSchema.index({ boundary: '2dsphere' });
module.exports = mongoose.model('Area', AreaSchema);
