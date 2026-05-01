const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txId: String,
  date: Date,
  projectName: String,
  ngoName: String,
  vendor: String,
  category: String,
  amount: Number,
  budgetUtilization: Number,
  milestone: String,
  blockHash: String,
  isFlagged: Boolean,
}, { timestamps: true, collection: 'transactions' });

module.exports = mongoose.model('Transaction', transactionSchema);