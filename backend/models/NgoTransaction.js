const mongoose = require('mongoose');

const NgoTransactionSchema = new mongoose.Schema({
  txId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  ngoName: { type: String, required: true },
  vendorName: { type: String, required: true },
  vendorAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  avgMonthlyBudget: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Number, required: true },
  milestoneApproved: { type: Boolean, required: true },
  vendorRepeatPct: { type: Number, required: true },
  overspendRatio: { type: Number, required: true },
  flagged: { type: Boolean, required: true },
  flagReasons: { type: [String], default: [] },
  blockHash: { type: String, required: true },
  paymentTxId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('NgoTransaction', NgoTransactionSchema);
