/**
 * seedAll.js — wipes and reseeds ALL collections used by the Public View
 *
 * Collections seeded:
 *   1. ngotransactions     ← ngo_transactions.json  (NgoTransaction model)
 *   2. disastertransactions ← disaster_relief_transactions.json (DisasterTransaction model)
 *
 * Run from project root:
 *   node backend/scripts/seedAll.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const NgoTransaction      = require('../models/NgoTransaction');
const DisasterTransaction = require('../models/DisasterTransaction');

const ngoData      = require('../../frontend/src/data/ngo_transactions.json');
const disasterData = require('../../frontend/src/data/disaster_relief_transactions.json');

/* ─── fraud detection — same rules as the API route ─── */
function detectFraud(data) {
  const reasons          = [];
  const amount           = Number(data.amount)           || 0;
  const avgMonthlyBudget = Number(data.avgMonthlyBudget) || 0;
  const vendorRepeatPct  = Number(data.vendorRepeatPct)  || 0;
  const milestoneApproved =
    data.milestoneApproved === true ||
    data.milestoneApproved === 'true' ||
    data.milestoneApproved === 1;

  const overspendRatio = avgMonthlyBudget > 0 ? amount / avgMonthlyBudget : 0;

  if (overspendRatio >= 3)
    reasons.push(`Spend ${overspendRatio.toFixed(1)}x avg monthly budget (threshold: 3x)`);

  if (amount > 25000 && amount % 10000 === 0)
    reasons.push(`Suspicious round-number transfer of ₹${amount.toLocaleString('en-IN')} (>₹25,000 and divisible by ₹10,000)`);

  if (vendorRepeatPct > 80)
    reasons.push(`Vendor repeat rate ${vendorRepeatPct}% exceeds 80% threshold — possible vendor lock-in`);

  if (!milestoneApproved && (overspendRatio >= 1.5 || vendorRepeatPct > 50 || amount > 10000))
    reasons.push('No milestone approval on record');

  if (overspendRatio >= 5 && !milestoneApproved)
    reasons.push('Phantom project suspected — high-value spend with no milestone approval or on-ground proof');

  return {
    flagged:        reasons.length > 0,
    flagReasons:    reasons,
    overspendRatio: Math.round(overspendRatio * 100) / 100,
  };
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  MongoDB connected');

    /* ── 1. NGO Transactions ── */
    await NgoTransaction.deleteMany({});
    console.log('🗑   Cleared ngotransactions');

    const ngoToInsert = ngoData.map(tx => {
      const { flagged, flagReasons, overspendRatio } = detectFraud(tx);
      return {
        txId:              tx.txId,
        projectName:       tx.projectName,
        ngoName:           tx.ngoName,
        vendorName:        tx.vendorName,
        vendorAddress:     tx.vendorAddress,
        amount:            tx.amount,
        avgMonthlyBudget:  tx.avgMonthlyBudget,
        category:          tx.category,
        description:       tx.description,
        timestamp:         tx.timestamp,
        milestoneApproved: tx.milestoneApproved === true || tx.milestoneApproved === 'true',
        vendorRepeatPct:   tx.vendorRepeatPct,
        overspendRatio,
        flagged,
        // Keep hand-written reasons from JSON if they're richer than computed ones
        flagReasons:       flagReasons.length > 0 ? flagReasons : (tx.flagReasons || []),
        blockHash:         tx.blockHash,
        paymentTxId:       tx.paymentTxId || '',
      };
    });

    const ngoResult = await NgoTransaction.insertMany(ngoToInsert);
    const ngoFlagged = ngoToInsert.filter(t => t.flagged).length;
    const ngoClean   = ngoToInsert.length - ngoFlagged;
    console.log(`✅  Inserted ${ngoResult.length} NGO transactions  (${ngoClean} legit · ${ngoFlagged} flagged)`);

    /* ── 2. Disaster Relief Transactions ── */
    await DisasterTransaction.deleteMany({});
    console.log('🗑   Cleared disastertransactions');

    const disasterToInsert = disasterData.map(tx => ({
      txId:              tx.txId,
      projectName:       tx.projectName,
      ngoName:           tx.ngoName,
      vendorName:        tx.vendorName,
      vendorAddress:     tx.vendorAddress,
      amount:            tx.amount,
      totalBudget:       tx.totalBudget,
      adminCost:         tx.adminCost,
      adminRatio:        tx.adminRatio,
      declaredPurpose:   tx.declaredPurpose,
      actualCategory:    tx.actualCategory,
      categoryMismatch:  tx.categoryMismatch,
      disasterPhase:     tx.disasterPhase !== false,
      description:       tx.description,
      timestamp:         tx.timestamp,
      milestoneApproved: tx.milestoneApproved === true || tx.milestoneApproved === 'true',
      flagged:           tx.flagged,
      flagReasons:       tx.flagReasons || [],
      blockHash:         tx.blockHash,
    }));

    const disasterResult = await DisasterTransaction.insertMany(disasterToInsert);
    const drFlagged = disasterToInsert.filter(t => t.flagged).length;
    const drClean   = disasterToInsert.length - drFlagged;
    console.log(`✅  Inserted ${disasterResult.length} disaster transactions  (${drClean} legit · ${drFlagged} flagged)`);

    /* ── Summary ── */
    console.log('\n📊  Seed Summary');
    console.log('─'.repeat(40));
    console.log(`   NGO Transactions:      ${ngoResult.length}`);
    console.log(`   Disaster Transactions: ${disasterResult.length}`);
    console.log(`   Total:                 ${ngoResult.length + disasterResult.length}`);
    console.log('─'.repeat(40));

  } catch (err) {
    console.error('❌  Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected');
  }
}

seed();
