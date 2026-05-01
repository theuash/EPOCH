const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  walletAddress: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['admin', 'auditor', 'public'], default: 'public' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
