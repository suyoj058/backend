require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON body

// Test route to verify JSON body parsing works
app.post('/test', (req, res) => {
  console.log('Test POST body:', req.body);
  res.json({ received: req.body });
});

// Auth routes (signup, login)
app.use('/api/users', authRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB Connection error:', err);
    process.exit(1);
  });
