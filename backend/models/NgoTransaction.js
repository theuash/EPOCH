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
  // Auditor review fields
  auditStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  auditNote: { type: String, default: '' },
  auditedAt: { type: Date, default: null },
  auditedBy: { type: String, default: '' },
  // NGO questioning / inquiry thread
  inquiries: [{
    question: { type: String, required: true },
    askedBy: { type: String, default: 'Auditor' },
    askedAt: { type: Date, default: Date.now },
    answer: { type: String, default: '' },
    answeredAt: { type: Date, default: null },
    status: { type: String, enum: ['open', 'answered'], default: 'open' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('NgoTransaction', NgoTransactionSchema);
