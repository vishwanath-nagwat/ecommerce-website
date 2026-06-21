const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const isValidEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  const atIndex = email.indexOf('@');
  const lastDotIndex = email.lastIndexOf('.');
  return atIndex > 0 && lastDotIndex > atIndex + 1 && lastDotIndex < email.length - 1;
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_change_me', {
    expiresIn: '1d',
  });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin =
      process.env.ADMIN_REGISTER_CODE && adminCode === process.env.ADMIN_REGISTER_CODE;

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isAdmin,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  return res.json(req.user);
});

module.exports = router;
