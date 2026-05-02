const mongoose = require('mongoose');

const DisasterTransactionSchema = new mongoose.Schema({
  txId:              { type: String, required: true, unique: true },
  projectName:       { type: String, required: true },
  ngoName:           { type: String, required: true },
  vendorName:        { type: String, required: true },
  vendorAddress:     { type: String, required: true },
  amount:            { type: Number, required: true },
  totalBudget:       { type: Number, required: true },
  adminCost:         { type: Number, required: true },
  adminRatio:        { type: Number, required: true },
  declaredPurpose:   { type: String, required: true },
  actualCategory:    { type: String, required: true },
  categoryMismatch:  { type: Boolean, required: true },
  disasterPhase:     { type: Boolean, default: true },
  description:       { type: String, required: true },
  timestamp:         { type: Number, required: true },
  milestoneApproved: { type: Boolean, required: true },
  flagged:           { type: Boolean, required: true },
  flagReasons:       { type: [String], default: [] },
  blockHash:         { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DisasterTransaction', DisasterTransactionSchema);
