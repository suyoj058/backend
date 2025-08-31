const express = require('express');
const router = express.Router();
const multer = require('multer');
const bookingController = require('../controllers/bookingController');

// =========================
// Multer config for file uploads
// =========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// =========================
// Routes
// =========================

// Create booking
router.post(
  '/',
  upload.fields([
    { name: 'citizenshipFile', maxCount: 1 },
    { name: 'licenseFile', maxCount: 1 },
  ]),
  bookingController.createBooking
);

// Get all bookings
router.get('/', bookingController.getAllBookings);

// Delete booking
router.delete('/:id', bookingController.deleteBooking);

// Approve booking
router.put('/approve/:id', bookingController.approveBooking);

// Reject booking
router.put('/reject/:id', bookingController.rejectBooking);

module.exports = router;
