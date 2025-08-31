const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vehicleName: String,
  fullName: String,
  email: String,
  phone: String,
  bookingLocation: String,
  address: String,
  fromDate: Date,
  toDate: Date,
  citizenshipFile: String,
  licenseFile: String,
  latitude: Number,
  longitude: Number,
  pickupLatitude: Number,
  pickupLongitude: Number,
  dropoffLatitude: Number,
  dropoffLongitude: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },

  // 💰 Pricing fields
  basePrice: Number,     // Before discount
  finalPrice: Number     // After surcharge/discount
});

module.exports = mongoose.model('Booking', bookingSchema);
