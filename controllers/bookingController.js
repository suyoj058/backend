const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const fs = require('fs');
const path = require('path');

// =========================
// Create Booking (with dynamic pricing)
// =========================
exports.createBooking = async (req, res) => {
  try {
    const {
      vehicleName,
      fullName,
      email,
      phone,
      bookingLocation,
      address,
      fromDate,
      toDate,
      latitude,
      longitude,
      pickupLatitude,
      pickupLongitude,
      dropoffLatitude,
      dropoffLongitude,
    } = req.body;

    const citizenshipFile = req.files?.citizenshipFile?.[0]?.filename || '';
    const licenseFile = req.files?.licenseFile?.[0]?.filename || '';

    // Fetch vehicle price
    const vehicle = await Vehicle.findOne({ name: vehicleName });
    const baseRate = vehicle ? vehicle.price : 2000; // fallback price

    if (isNaN(baseRate)) {
      return res.status(400).json({ message: 'Invalid vehicle base rate.' });
    }

    // Dates and day calculations
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.ceil((end - start) / msPerDay) || 1;

    // Weekend and holiday surcharges
    const weekendSurcharge = 300;
    const holidaySurcharge = 500;
    const holidays = [
      '2025-01-01',
      '2025-08-15',
      '2025-12-25',
    ];

    const isHoliday = (date) => {
      const iso = new Date(date).toISOString().slice(0, 10);
      return holidays.includes(iso);
    };

    let totalBase = 0;

    for (let i = 0; i < totalDays; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      let dayRate = baseRate;

      const dayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dayRate += weekendSurcharge;
      }

      if (isHoliday(day)) {
        dayRate += holidaySurcharge;
      }

      totalBase += dayRate;
    }

    const locationSurcharge = (pickupLatitude && dropoffLatitude) ? 500 : 0;
    const longBookingDiscount = totalDays >= 3 ? 0.1 : 0;

    const basePrice = totalBase + locationSurcharge;
    const finalPrice = basePrice * (1 - longBookingDiscount);

    const newBooking = new Booking({
      vehicleName,
      fullName,
      email,
      phone,
      bookingLocation,
      address,
      fromDate,
      toDate,
      citizenshipFile,
      licenseFile,
      latitude,
      longitude,
      pickupLatitude,
      pickupLongitude,
      dropoffLatitude,
      dropoffLongitude,
      status: 'pending',
      basePrice,
      finalPrice,
    });

    await newBooking.save();

    res.status(201).json({
      message: 'Booking created successfully with dynamic pricing',
      booking: newBooking,
    });

  } catch (error) {
    console.error('❌ Booking creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// =========================
// Get All Bookings
// =========================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// =========================
// Delete Booking
// =========================
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    [booking.citizenshipFile, booking.licenseFile].forEach(file => {
      if (file) {
        const filePath = path.join(__dirname, '..', 'uploads', file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('❌ Delete booking error:', err);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
};

// =========================
// Approve Booking
// =========================
exports.approveBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'approved';
    await booking.save();
    res.json({ message: 'Booking approved successfully', booking });
  } catch (err) {
    console.error('❌ Approve booking error:', err);
    res.status(500).json({ message: 'Failed to approve booking' });
  }
};

// =========================
// Reject Booking
// =========================
exports.rejectBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'rejected';
    await booking.save();
    res.json({ message: 'Booking rejected successfully', booking });
  } catch (err) {
    console.error('❌ Reject booking error:', err);
    res.status(500).json({ message: 'Failed to reject booking' });
  }
};
