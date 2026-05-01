const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { analyzeTransaction } = require('../services/detectionEngine');
const Flag = require('../models/Flag');

// Load datasets
const dataDir = path.join(__dirname, '../../frontend/src/data');
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8')); }
  catch { return []; }
}

// GET /api/detection/run — Run detection engine on all datasets, return results
router.get('/run', async (req, res) => {
  try {
    const ngoTxns = loadJSON('ngo_transactions.json');
    const claimTxns = loadJSON('duplicate_claims_transactions.json');
    const shellTxns = loadJSON('shell_entity_transactions.json');

    const results = { case1: [], case4: [], case5: [], stats: {} };

    // Case 1: Overspend
    ngoTxns.forEach(tx => {
      const analysis = analyzeTransaction(tx, ngoTxns, 'case1');
      results.case1.push({ ...tx, detection: analysis });
    });

    // Case 4: Duplicate Claims
    claimTxns.forEach(tx => {
      const analysis = analyzeTransaction(tx, claimTxns, 'case4');
      results.case4.push({ ...tx, detection: analysis });
    });

    // Case 5: Shell Entity
    shellTxns.forEach(tx => {
      const analysis = analyzeTransaction(tx, shellTxns, 'case5');
      results.case5.push({ ...tx, detection: analysis });
    });

    // Stats
    const allFlagged = [
      ...results.case1.filter(t => t.detection.triggered),
      ...results.case4.filter(t => t.detection.triggered),
      ...results.case5.filter(t => t.detection.triggered),
    ];
    const allLegit = [
      ...results.case1.filter(t => !t.detection.triggered),
      ...results.case4.filter(t => !t.detection.triggered),
      ...results.case5.filter(t => !t.detection.triggered),
    ];

    results.stats = {
      totalTransactions: ngoTxns.length + claimTxns.length + shellTxns.length,
      totalFlagged: allFlagged.length,
      totalLegit: allLegit.length,
      totalAtRisk: allFlagged.reduce((s, t) => s + (t.amount || 0), 0),
      byCase: {
        case1: { flagged: results.case1.filter(t => t.detection.triggered).length, total: ngoTxns.length },
        case4: { flagged: results.case4.filter(t => t.detection.triggered).length, total: claimTxns.length },
        case5: { flagged: results.case5.filter(t => t.detection.triggered).length, total: shellTxns.length },
      }
    };

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/detection/flagged — Only flagged transactions across all live cases
router.get('/flagged', async (req, res) => {
  try {
    const ngoTxns = loadJSON('ngo_transactions.json');
    const claimTxns = loadJSON('duplicate_claims_transactions.json');
    const shellTxns = loadJSON('shell_entity_transactions.json');

    const flagged = [];

    ngoTxns.forEach(tx => {
      const a = analyzeTransaction(tx, ngoTxns, 'case1');
      if (a.triggered) flagged.push({ ...tx, detection: a });
    });
    claimTxns.forEach(tx => {
      const a = analyzeTransaction(tx, claimTxns, 'case4');
      if (a.triggered) flagged.push({ ...tx, detection: a });
    });
    shellTxns.forEach(tx => {
      const a = analyzeTransaction(tx, shellTxns, 'case5');
      if (a.triggered) flagged.push({ ...tx, detection: a });
    });

    res.json(flagged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/detection/stats — Dashboard aggregate statistics
router.get('/stats', async (req, res) => {
  try {
    const ngoTxns = loadJSON('ngo_transactions.json');
    const claimTxns = loadJSON('duplicate_claims_transactions.json');
    const shellTxns = loadJSON('shell_entity_transactions.json');
    const disasterTxns = loadJSON('disaster_relief_transactions.json');
    const mlTxns = loadJSON('money_laundering_transactions.json');

    const allDatasets = [...ngoTxns, ...claimTxns, ...shellTxns, ...disasterTxns, ...mlTxns];
    const totalFlagged = allDatasets.filter(t => t.flagged).length;
    const totalLegit = allDatasets.filter(t => !t.flagged).length;
    const totalAtRisk = allDatasets.filter(t => t.flagged).reduce((s, t) => s + (t.amount || 0), 0);

    // Fund Health Score: 100 - (flaggedRatio * 100)
    const healthScore = Math.round(100 - (totalFlagged / allDatasets.length * 100));

    res.json({
      totalTransactions: allDatasets.length,
      totalFlagged,
      totalLegit,
      totalAtRisk,
      fundHealthScore: healthScore,
      donationsThisWeek: totalLegit,
      donationValue: allDatasets.filter(t => !t.flagged).reduce((s, t) => s + (t.amount || 0), 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
