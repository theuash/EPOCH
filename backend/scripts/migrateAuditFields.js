/**
 * migrateAuditFields.js
 * Adds auditStatus, auditNote, auditedBy, auditedAt, and inquiries
 * to all existing NgoTransaction documents that are missing them.
 *
 * Run: node backend/scripts/migrateAuditFields.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const NgoTransaction = require('../models/NgoTransaction');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  MongoDB connected');

  const r1 = await NgoTransaction.updateMany(
    { auditStatus: { $exists: false } },
    { $set: { auditStatus: 'pending', auditNote: '', auditedBy: '', auditedAt: null } }
  );
  console.log(`✅  auditStatus patched: ${r1.modifiedCount} documents`);

  const r2 = await NgoTransaction.updateMany(
    { inquiries: { $exists: false } },
    { $set: { inquiries: [] } }
  );
  console.log(`✅  inquiries patched:   ${r2.modifiedCount} documents`);

  const sample = await NgoTransaction.findOne().lean();
  console.log('\nVerification on sample doc:');
  console.log('  auditStatus:', sample.auditStatus);
  console.log('  inquiries:  ', Array.isArray(sample.inquiries) ? `[] (${sample.inquiries.length} items)` : 'MISSING');

  await mongoose.disconnect();
  console.log('\n🔌  Disconnected — migration complete');
}

migrate().catch(err => { console.error('❌', err.message); process.exit(1); });
