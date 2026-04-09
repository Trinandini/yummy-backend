const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Validation helpers ─────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (pwd) => pwd && pwd.length >= 6;
const isValidName = (name) => name && name.trim().length >= 2;

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Validate all fields properly
    if (!name || !isValidName(name))
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });
    if (!password || !isValidPassword(password))
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!role || !['customer','owner','delivery'].includes(role))
      return res.status(400).json({ message: 'Invalid role selected' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered. Please login.' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role,
      phone: phone || '',
      address: address || '',
      isActive: true
    });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs before touching the database
    if (!email || !isValidEmail(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });
    if (!password || password.length < 1)
      return res.status(400).json({ message: 'Please enter your password' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Use same message for wrong email OR wrong password (security best practice)
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block removed delivery persons
    if (user.role === 'delivery' && user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been removed. Contact the restaurant owner.' });
    }

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public: all visible users for login panel
router.get('/demo-users', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { role: { $in: ['customer', 'owner'] } },
        { role: 'delivery', isActive: { $ne: false } }
      ]
    })
      .select('name email role phone createdAt isActive')
      .sort({ role: 1, createdAt: 1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: remove a delivery person
router.put('/remove-delivery/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery')
      return res.status(404).json({ message: 'Delivery person not found' });
    user.isActive = false;
    user.isAvailable = false;
    await user.save();
    res.json({ message: `${user.name} removed from delivery team` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Owner: reinstate a delivery person
router.put('/reinstate-delivery/:id', protect, authorizeRoles('owner'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery')
      return res.status(404).json({ message: 'Delivery person not found' });
    user.isActive = true;
    user.isAvailable = true;
    await user.save();
    res.json({ message: `${user.name} reinstated` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
