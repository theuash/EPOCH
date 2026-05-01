const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  walletAddress: { type: String, unique: true, sparse: true },
  kycVerified: { type: Boolean, default: false },
  totalDonated: { type: Number, default: 0 },
  donations: [{
    amount: Number,
    purpose: String,
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
    txHash: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donor', DonorSchema);
