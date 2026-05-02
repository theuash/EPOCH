/**
 * seed.js — populates MongoDB with TransactionMeta documents
 * so that GET /api/transactions returns real data.
 *
 * Run:  node backend/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const TransactionMeta = require('./models/TransactionMeta');

// ── Sample transactions matching ngo_transactions.json ──────────────────────
const SEED_DATA = [
  // ── CLEAN transactions ──────────────────────────────────────────────────
  { txId: 1,  receiverName: 'Fresh Harvest Supplies',   description: 'Weekly food packet distribution — Batch #12',                  documentHash: '0xabc1d4e5f6a7b8c9', status: 'committed' },
  { txId: 2,  receiverName: 'AquaPure Systems',          description: 'Water purifier installation — Village Kamalapura',             documentHash: '0xdef2a7b8c9d0e1f2', status: 'committed' },
  { txId: 3,  receiverName: 'Craft Materials Co.',       description: 'Sewing machine consumables — April batch',                     documentHash: '0x1234f9c0d1e2f3a4', status: 'committed' },
  { txId: 4,  receiverName: 'Green Valley Farms',        description: 'Mid-day meal supplies for 3 schools',                          documentHash: '0x5678b2d1c3e4f5a6', status: 'committed' },
  { txId: 5,  receiverName: 'MedSupply India',           description: 'Medical supplies for free health camp — Mandya',               documentHash: '0x9abce3f4d5a6b7c8', status: 'committed' },
  { txId: 6,  receiverName: 'CompuWorld Solutions',      description: 'Refurbished laptops — 10 units for rural school',              documentHash: '0xdef56789a0b1c2d3', status: 'committed' },
  { txId: 7,  receiverName: 'Wellness Pharma',           description: 'Monthly medicine kit distribution — 50 beneficiaries',         documentHash: '0x0abcd1e2f3a4b5c6', status: 'committed' },
  { txId: 8,  receiverName: 'Karnataka Nursery',         description: '500 saplings for highway plantation — Phase 2',                documentHash: '0x2345f6a7b8c9d0e1', status: 'committed' },
  { txId: 9,  receiverName: 'Relief Logistics Pvt Ltd',  description: 'Emergency tarpaulin + ration kits — 200 families',             documentHash: '0x6789c0d1e2f3a4b5', status: 'committed' },
  { txId: 10, receiverName: 'VetCare Supplies',          description: 'Monthly veterinary medicines + dog food',                      documentHash: '0xabcd2345e6f7a8b9', status: 'committed' },
  { txId: 11, receiverName: 'State Bank Transfer',       description: 'Quarterly scholarship to 15 students — Semester 2',           documentHash: '0xef016789b0c1d2e3', status: 'committed' },
  { txId: 12, receiverName: 'HygienePro Services',       description: 'Toilet construction materials — Phase 3, Ward 12',             documentHash: '0x2468ace0f1b2c3d4', status: 'committed' },
  { txId: 13, receiverName: 'Natural Dye Traders',       description: 'Natural dyes and canvas for tribal art workshop',              documentHash: '0x13579bdf2c3d4e5f', status: 'committed' },
  { txId: 14, receiverName: 'SunTech Solar Pvt Ltd',     description: '100 solar lamps for off-grid hamlet — Raichur dist.',          documentHash: '0xbcdef0123a4b5c6d', status: 'committed' },
  { txId: 15, receiverName: 'Karnataka Law Press',       description: 'Printing awareness pamphlets + paralegal stipends',            documentHash: '0x34567890e1f2a3b4', status: 'committed' },

  // ── FLAGGED transactions ────────────────────────────────────────────────
  { txId: 16, receiverName: 'RK Constructions',          description: 'Bulk payment to contractor — no milestone documentation',      documentHash: '0xFLAG00010001aaaa', status: 'flagged' },
  { txId: 17, receiverName: 'Global Consultants LLC',    description: 'Consulting fees — vague scope, no deliverables listed',        documentHash: '0xFLAG00020002bbbb', status: 'flagged' },
  { txId: 18, receiverName: 'Bharat BuildTech',          description: 'Toilet construction — same vendor, repeated billing anomaly',  documentHash: '0xFLAG00030003cccc', status: 'flagged' },
  { txId: 19, receiverName: 'MedLink Traders',           description: 'Medical equipment — no camp schedule, no beneficiary list',   documentHash: '0xFLAG00040004dddd', status: 'flagged' },
  { txId: 20, receiverName: 'InfoSys Peripherals',       description: 'Laptop procurement — inflated unit pricing, vendor lock-in',  documentHash: '0xFLAG00050005eeee', status: 'flagged' },

  // ── THIS WEEK (Apr 27 – May 3 2026) ────────────────────────────────────
  { txId: 21, receiverName: 'Green Valley Farms',        description: 'Weekly meal supplies for 6 government schools — Batch #18',   documentHash: '0xw001a1b2c3d4e5f6', status: 'committed' },
  { txId: 22, receiverName: 'MedSupply India',           description: 'Fuel + medicines for mobile health van — Week 18',            documentHash: '0xw002c3d4e5f6a7b8', status: 'committed' },
  { txId: 23, receiverName: 'SunTech Solar Pvt Ltd',     description: 'Solar panel installation — 12 households, Bidar dist.',       documentHash: '0xw003e5f6a7b8c9d0', status: 'committed' },
  { txId: 24, receiverName: 'Apex Contractors Pvt Ltd',  description: 'Road construction payment — no site inspection report',       documentHash: '0xFLAGW004ffffaaaa', status: 'flagged'   },
  { txId: 25, receiverName: 'CompuWorld Solutions',      description: 'Smart board + projector installation — 4 classrooms',         documentHash: '0xw005g7h8i9j0k1l2', status: 'committed' },
  { txId: 26, receiverName: 'State Bank Transfer',       description: 'Seed capital disbursement — 11 SHG members, Tumkur',          documentHash: '0xw006i9j0k1l2m3n4', status: 'committed' },
  { txId: 27, receiverName: 'Global Consultants LLC',    description: 'Skill training — claimed 500 beneficiaries, verified 120',    documentHash: '0xFLAGW007bbbbcccc', status: 'flagged'   },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Wipe existing TransactionMeta docs
    const deleted = await TransactionMeta.deleteMany({});
    console.log(`🗑  Cleared ${deleted.deletedCount} existing TransactionMeta documents`);

    // Insert fresh seed data
    const inserted = await TransactionMeta.insertMany(SEED_DATA);
    console.log(`✅ Inserted ${inserted.length} TransactionMeta documents`);

    // Summary
    const flagged = SEED_DATA.filter(d => d.status === 'flagged').length;
    const clean   = SEED_DATA.filter(d => d.status === 'committed').length;
    console.log(`   ${clean} committed (clean)  |  ${flagged} flagged`);

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

seed();
