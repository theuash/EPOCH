const mongoose = require('mongoose');

const TransactionMetaSchema = new mongoose.Schema({
  txId: { type: Number, unique: true },
  receiverName: String,
  description: String,
  documentHash: String,
  fileName: String,
  status: { type: String, enum: ['pending_approval', 'committed', 'flagged', 'resolved'], default: 'pending_approval' },
  concerns: [{
    user: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('TransactionMeta', TransactionMetaSchema);
