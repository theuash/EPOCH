const express = require('express');
const router = express.Router();
const NgoTransaction = require('../models/NgoTransaction');
const crypto = require('crypto');

/* ── fraud detection rules ─────────────────────────────── */
function detectFraud(data) {
  const reasons = [];
  const { amount, avgMonthlyBudget, vendorRepeatPct, milestoneApproved } = data;

  const overspendRatio = avgMonthlyBudget > 0 ? amount / avgMonthlyBudget : 0;

  // Rule 1: Overspend — amount > 3× average monthly budget
  if (overspendRatio >= 3) {
    reasons.push(`Spend ${overspendRatio.toFixed(1)}x avg monthly budget (threshold: 3x)`);
  }

  // Rule 2: No milestone approval (only flag when combined with a risk signal)
  const milestoneOk =
    milestoneApproved === true ||
    milestoneApproved === 'true' ||
    milestoneApproved === 1;

  if (!milestoneOk && (overspendRatio >= 1.5 || vendorRepeatPct > 50 || amount > 10000)) {
    reasons.push('No milestone approval on record');
  }

  // Rule 3: Vendor concentration — same vendor used in >80% of NGO transactions
  if (vendorRepeatPct > 80) {
    reasons.push(`Vendor repeat rate ${vendorRepeatPct}% (threshold: 80%)`);
  }

  // Rule 4: Round-number suspicious amount (exact multiples of 10000 above 25000)
  if (amount > 25000 && amount % 10000 === 0) {
    reasons.push(`Suspicious round-number transfer of ₹${Number(amount).toLocaleString('en-IN')} (>₹25,000 and divisible by ₹10,000)`);
  }

  // Rule 5: Phantom project (high-value + no milestone)
  if (overspendRatio >= 5 && !milestoneOk) {
    reasons.push('Phantom project suspected — high-value spend with no milestone approval or on-ground proof');
  }

  return {
    flagged: reasons.length > 0,
    flagReasons: reasons,
    overspendRatio: Math.round(overspendRatio * 100) / 100,
  };
}

/* ── GET /api/ngo-transactions — all transactions ── */
router.get('/', async (req, res) => {
  try {
    const transactions = await NgoTransaction.find().sort({ timestamp: -1 });
    // Ensure every document has the auditor fields — guards against docs
    // seeded before those fields were added to the schema.
    const safe = transactions.map(tx => {
      const obj = tx.toObject();
      if (!obj.auditStatus) obj.auditStatus = 'pending';
      if (!obj.auditNote)   obj.auditNote   = '';
      if (!obj.auditedBy)   obj.auditedBy   = '';
      if (!Array.isArray(obj.inquiries)) obj.inquiries = [];
      return obj;
    });
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching NGO transactions' });
  }
});

/* ── GET /api/ngo-transactions/legit ── */
router.get('/legit', async (req, res) => {
  try {
    const transactions = await NgoTransaction.find({ flagged: false }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/ngo-transactions/:txId/audit — approve or reject milestone ── */
router.patch('/:txId/audit', async (req, res) => {
  try {
    const { action, note, auditorName } = req.body; // action: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'action must be "approved" or "rejected"' });
    }
    const doc = await NgoTransaction.findOneAndUpdate(
      { txId: req.params.txId },
      {
        auditStatus: action,
        auditNote: note || '',
        auditedAt: new Date(),
        auditedBy: auditorName || 'Auditor',
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, auditStatus: doc.auditStatus, auditNote: doc.auditNote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/ngo-transactions/:txId/inquire — auditor raises a question to NGO ── */
router.post('/:txId/inquire', async (req, res) => {
  try {
    const { question, askedBy } = req.body;
    if (!question || question.trim().length < 5) {
      return res.status(400).json({ error: 'Question must be at least 5 characters' });
    }
    const doc = await NgoTransaction.findOneAndUpdate(
      { txId: req.params.txId },
      {
        $push: {
          inquiries: {
            question: question.trim(),
            askedBy: askedBy || 'Auditor',
            askedAt: new Date(),
            status: 'open',
          },
        },
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, inquiries: doc.inquiries });
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
      milestoneApproved,
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
