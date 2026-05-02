const express = require('express');
const router  = express.Router();
const DisasterTransaction = require('../models/DisasterTransaction');

/* GET /api/disaster-transactions — all disaster relief transactions */
router.get('/', async (req, res) => {
  try {
    const txns = await DisasterTransaction.find().sort({ timestamp: -1 });
    res.json(txns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching disaster transactions' });
  }
});

/* GET /api/disaster-transactions/flagged */
router.get('/flagged', async (req, res) => {
  try {
    const txns = await DisasterTransaction.find({ flagged: true }).sort({ timestamp: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET /api/disaster-transactions/legit */
router.get('/legit', async (req, res) => {
  try {
    const txns = await DisasterTransaction.find({ flagged: false }).sort({ timestamp: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
