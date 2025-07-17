// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  type: String,
  location: String,
  image: String,
  price: Number,
  availability: { type: Boolean, default: true },
  features: [String], // e.g., ["AC", "GPS", "Electric"]
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
