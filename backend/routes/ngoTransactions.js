const express = require('express');
const router = express.Router();
const NgoTransaction = require('../models/NgoTransaction');
const crypto = require('crypto');

/* ── fraud detection rules ─────────────────────────────── */
function detectFraud(data) {
  const reasons = [];
  const { amount, avgMonthlyBudget, vendorRepeatPct, milestoneApproved, description, paymentTxId } = data;

  const overspendRatio = avgMonthlyBudget > 0 ? amount / avgMonthlyBudget : 0;

  // Rule 1: Overspend — amount > 3× average monthly budget
  if (overspendRatio >= 3) {
    reasons.push(`Spend ${overspendRatio.toFixed(1)}x avg monthly budget (threshold: 3x)`);
  }

  // Rule 2: No milestone approval
  if (!milestoneApproved) {
    reasons.push('No milestone approval on record');
  }

  // Rule 3: Vendor concentration — same vendor used in >80% of NGO transactions
  if (vendorRepeatPct > 80) {
    reasons.push(`Vendor repeat rate ${vendorRepeatPct}% (threshold: 80%)`);
  }

  // Rule 4: Round-number suspicious amount (exact multiples of 10000 above 50000)
  if (amount >= 50000 && amount % 10000 === 0) {
    reasons.push(`Suspicious round-number amount ₹${Number(amount).toLocaleString('en-IN')} — common in phantom transactions`);
  }

  // Rule 5: Vague description (too short or generic keywords)
  const vagueKeywords = ['misc', 'miscellaneous', 'other', 'general', 'various', 'expenses', 'payment'];
  const descLower = (description || '').toLowerCase().trim();
  if (descLower.length < 15) {
    reasons.push('Description too vague — insufficient detail for audit trail');
  } else if (vagueKeywords.some(k => descLower === k || descLower.startsWith(k + ' '))) {
    reasons.push(`Vague description "${description}" — does not describe specific deliverables`);
  }

  // Rule 6: Missing payment reference
  if (!paymentTxId || paymentTxId.trim().length < 4) {
    reasons.push('Missing or invalid payment transaction reference');
  }

  return { flagged: reasons.length > 0, flagReasons: reasons, overspendRatio };
}

/* ── GET /api/ngo-transactions — all transactions ── */
router.get('/', async (req, res) => {
  try {
    const transactions = await NgoTransaction.find().sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching NGO transactions' });
  }
});

/* ── GET /api/ngo-transactions/legit — non-flagged only (for NGO Spend page) ── */
router.get('/legit', async (req, res) => {
  try {
    const transactions = await NgoTransaction.find({ flagged: false }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/ngo-transactions — create milestone transaction ── */
router.post('/', async (req, res) => {
  try {
    const {
      projectName, ngoName,
      vendorName,
      amount, avgMonthlyBudget,
      category, description,
      milestoneApproved,
      paymentTxId,
      proofFiles,
    } = req.body;

    // 1. Auto-compute vendorRepeatPct from existing DB records for this NGO
    const totalTxns  = await NgoTransaction.countDocuments({ ngoName });
    const vendorTxns = totalTxns > 0
      ? await NgoTransaction.countDocuments({ ngoName, vendorName })
      : 0;
    const vendorRepeatPct = totalTxns > 0
      ? Math.round((vendorTxns / totalTxns) * 100)
      : 0;

    // 2. Generate unique txId
    const txId = 'TX-' + Date.now().toString(36).toUpperCase();

    // 3. Generate SHA-256 block hash from core fields
    const hashInput = JSON.stringify({
      txId, projectName, ngoName, vendorName,
      paymentTxId, amount, category, description,
      timestamp: Math.floor(Date.now() / 1000),
    });
    const blockHash = '0x' + crypto.createHash('sha256').update(hashInput).digest('hex');

    // 4. Run fraud detection
    const { flagged, flagReasons, overspendRatio } = detectFraud({
      amount: Number(amount),
      avgMonthlyBudget: Number(avgMonthlyBudget),
      vendorRepeatPct: Number(vendorRepeatPct || 0),
      milestoneApproved: Boolean(milestoneApproved),
      description: description || '',
      paymentTxId: paymentTxId || '',
    });

    // 5. Build and save document
    const doc = new NgoTransaction({
      txId,
      projectName,
      ngoName,
      vendorName,
      vendorAddress: '0x0000000000000000000000000000000000000000',
      amount: Number(amount),
      avgMonthlyBudget: Number(avgMonthlyBudget),
      category,
      description,
      timestamp: Math.floor(Date.now() / 1000),
      milestoneApproved: Boolean(milestoneApproved),
      vendorRepeatPct,
      overspendRatio: Math.round(overspendRatio * 100) / 100,
      flagged,
      flagReasons,
      blockHash,
      paymentTxId: paymentTxId || '',
    });

    await doc.save();

    res.status(201).json({
      success: true,
      txId,
      blockHash,
      flagged,
      flagReasons,
      overspendRatio,
      milestoneApproved: Boolean(milestoneApproved),
      message: flagged
        ? `Transaction saved but FLAGGED (${flagReasons.length} rule${flagReasons.length > 1 ? 's' : ''} triggered)`
        : 'Transaction saved — Legit. Will appear in NGO Spend.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
