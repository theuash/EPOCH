const express = require('express');
const router = express.Router();
const NgoTransaction = require('../models/NgoTransaction');

// GET /api/ngo-transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await NgoTransaction.find().sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching NGO transactions' });
  }
});

module.exports = router;
