const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const User = require('../models/User');
require('dotenv').config();

const ADMIN_WALLETS = process.env.ADMIN_WALLETS.toLowerCase().split(',');
const AUDITOR_WALLETS = process.env.AUDITOR_WALLETS.toLowerCase().split(',');

// Public Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role: 'public' });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wallet Login (MetaMask)
router.post('/wallet-login', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    let role = 'public';
    if (ADMIN_WALLETS.includes(address.toLowerCase())) role = 'admin';
    else if (AUDITOR_WALLETS.includes(address.toLowerCase())) role = 'auditor';

    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      user = new User({ walletAddress: address.toLowerCase(), role });
      await user.save();
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role, address: address.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
