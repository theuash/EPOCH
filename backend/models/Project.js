const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  description: String,
  budget: Number,
  milestones: [{
    name: String,
    targetDate: Date,
    completed: { type: Boolean, default: false },
    proofHash: String,
    proofImageUrl: String,
    geoTag: { lat: Number, lng: Number }
  }],
  receipts: [{ hash: String, fileName: String, uploadedAt: { type: Date, default: Date.now } }],
  invoices: [{ hash: String, fileName: String, uploadedAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
