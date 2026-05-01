const mongoose = require('mongoose');

const FlagSchema = new mongoose.Schema({
  txId: { type: Number, index: true },
  caseType: { type: String, enum: ['case1', 'case2', 'case3', 'case4', 'case5'], required: true },
  ruleTriggered: String,
  severity: { type: String, enum: ['medium', 'high', 'critical'], default: 'medium' },
  riskScore: { type: Number, default: 0 },
  reasons: [String],
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionNotes: String,
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

FlagSchema.index({ caseType: 1, createdAt: -1 });

module.exports = mongoose.model('Flag', FlagSchema);
