const express = require('express');
const router = express.Router();
const { fundTransfer, auditTrail } = require('../services/blockchainService');
const TransactionMeta = require('../models/TransactionMeta');
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');

// Submit Transaction (Admin only)
router.post('/', authJWT, roleGuard(['admin']), async (req, res) => {
  try {
    const { receiverName, receiverAddress, amount, category, description, documentHash } = req.body;
    
    // Convert category string to enum index if needed
    const categories = ['Salary', 'Infrastructure', 'Medical', 'Education', 'Other'];
    const catIndex = categories.indexOf(category);

    // Call smart contract (Admin 1 signature from backend)
    const tx = await fundTransfer.submitTransaction(
      receiverName,
      receiverAddress,
      amount,
      catIndex,
      documentHash,
      description
    );
    const receipt = await tx.wait();
    
    // Find txId from event
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === 'TransactionSubmitted');
    const txId = Number(event.args[0]);

    // Save metadata to MongoDB
    const meta = new TransactionMeta({
      txId,
      receiverName,
      description,
      documentHash,
      status: 'pending_approval'
    });
    await meta.save();

    res.json({ message: 'Transaction submitted, pending second admin signature', txId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions (Public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // For demo, we combine blockchain data and mongo data
    // In real app, we'd sync blockchain events to Mongo
    const metas = await TransactionMeta.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const results = await Promise.all(metas.map(async (meta) => {
      try {
        const txData = await fundTransfer.getTransaction(meta.txId);
        return {
          txId: meta.txId,
          receiverName: meta.receiverName,
          receiverAddress: txData.receiverAddress,
          amount: Number(txData.amountInRupees),
          category: ['Salary', 'Infrastructure', 'Medical', 'Education', 'Other'][Number(txData.category)],
          timestamp: Number(txData.timestamp) * 1000,
          documentHash: meta.documentHash,
          isApproved: txData.isApproved,
          status: meta.status
        };
      } catch (e) {
        return null;
      }
    }));

    res.json(results.filter(r => r !== null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single transaction detail
router.get('/:id', async (req, res) => {
  try {
    const meta = await TransactionMeta.findOne({ txId: req.params.id });
    if (!meta) return res.status(404).json({ error: 'Not found' });
    
    const txData = await fundTransfer.getTransaction(req.params.id);
    const chainIntact = await auditTrail.verifyChain();

    res.json({
      ...meta.toObject(),
      blockchain: {
        receiverAddress: txData.receiverAddress,
        amount: Number(txData.amountInRupees),
        timestamp: Number(txData.timestamp) * 1000,
        isApproved: txData.isApproved,
        chainIntact
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
