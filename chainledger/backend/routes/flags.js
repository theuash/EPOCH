const express = require('express');
const router = express.Router();
const { flagEngine, auditTrail } = require('../services/blockchainService');
const TransactionMeta = require('../models/TransactionMeta');
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');

// Get unresolved flags (Auditor only)
router.get('/', authJWT, roleGuard(['auditor']), async (req, res) => {
  try {
    const nextFlagId = Number(await flagEngine.nextFlagId());
    const flags = [];

    for (let i = 0; i < nextFlagId; i++) {
      const flag = await flagEngine.flags(i);
      if (!flag.resolvedByAuditor) {
        const txMeta = await TransactionMeta.findOne({ txId: Number(flag.txId) });
        flags.push({
          flagId: i,
          txId: Number(flag.txId),
          ruleTriggered: flag.ruleTriggered,
          timestamp: Number(flag.timestamp) * 1000,
          receiverName: txMeta ? txMeta.receiverName : 'Unknown'
        });
      }
    }
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve flag
router.post('/:id/resolve', authJWT, roleGuard(['auditor']), async (req, res) => {
  try {
    const { notes } = req.body;
    // Note: In a real app, the auditor wallet from MetaMask would call this directly.
    // For this demo, we'll assume the auditor signs a message and backend submits,
    // but the prompt says "Auditor only. Calls AuditTrail.sol resolveFlag()".
    // I'll make the backend use the auditor's key for simplicity if it's in .env,
    // or just let the frontend call the contract.
    // Requirement says: "POST /api/flags/:id/resolve — Auditor only. Calls AuditTrail.sol resolveFlag() with notes. Updates MongoDB."
    
    const { ethers } = require('ethers');
    const auditorWallet = new ethers.Wallet(process.env.AUDITOR_PRIVATE_KEY, auditTrail.runner.provider);
    const auditTrailWithAuditor = auditTrail.connect(auditorWallet);

    const tx = await auditTrailWithAuditor.resolveFlag(req.params.id, notes);
    await tx.wait();

    // Update MongoDB status
    const flag = await flagEngine.flags(req.params.id);
    await TransactionMeta.findOneAndUpdate({ txId: Number(flag.txId) }, { status: 'resolved' });

    res.json({ message: 'Flag resolved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
