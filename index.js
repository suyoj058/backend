require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Test route
app.post('/test', (req, res) => {
  console.log('✅ Test POST body:', req.body);
  res.json({ received: req.body });
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes); // <- fixed route mounting

// Server + DB Setup
const PORT = process.env.PORT || 5000;
console.log('🌐 Connecting to MongoDB at:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('❌ Error listing collections:', err);
      } else {
        console.log('📂 Collections in DB:', collections.map(c => c.name));
      }
    });

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });
