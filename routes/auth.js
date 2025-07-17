const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

// POST /api/users/signup
router.post('/signup', async (req, res) => {
  console.log('📥 Signup request received:', req.body);

  const { firstName, lastName, email, password, contact } = req.body;

  if (!firstName || !lastName || !email || !password || !contact) {
    console.warn('⚠️ Missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      contact,
      email,
      password: hashedPassword,
    });

    try {
      await newUser.save();
      console.log('✅ User saved to DB:', newUser);
    } catch (saveErr) {
      console.error('❌ Error saving user to DB:', saveErr);
      return res.status(500).json({ message: 'Failed to save user', error: saveErr.message });
    }

    return res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('❌ Signup Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login request:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('⚠️ User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('⚠️ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '1d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact,
      },
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
