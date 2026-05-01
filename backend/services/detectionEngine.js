/**
 * Secure Node — Rule-Based Detection Engine
 * Pure algorithmic fraud detection. NO AI / NO ML.
 * Cases: 1 (Overspend), 4 (Duplicate Claims), 5 (Shell Entity)
 */

/* ─── CASE 1: NGO Phantom Project / Overspend Detection ─── */
function analyzeCase1(tx, allTxns) {
  let score = 0;
  const reasons = [];

  // Get historical amounts for this NGO
  const ngoTxns = allTxns.filter(t => t.ngoName === tx.ngoName && t.txId !== tx.txId && !t.flagged);
  const amounts = ngoTxns.map(t => t.amount);

  if (amounts.length > 0) {
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance) || 1;
    const zScore = (tx.amount - mean) / stdDev;
    const overspendRatio = tx.amount / mean;

    if (zScore > 2.5 && overspendRatio > 3) {
      score += 40;
      reasons.push(`Overspend ${overspendRatio.toFixed(1)}x avg budget (z-score: ${zScore.toFixed(1)})`);
    } else if (zScore > 2.0 && overspendRatio > 2) {
      score += 30;
      reasons.push(`Elevated spend ${overspendRatio.toFixed(1)}x avg (z-score: ${zScore.toFixed(1)})`);
    } else if (overspendRatio > 1.5) {
      score += 15;
      reasons.push(`Spend ${overspendRatio.toFixed(1)}x above average`);
    }
  } else if (tx.amount > 10000) {
    score += 25;
    reasons.push('Large transaction with no historical baseline');
  }

  // Milestone check
  if (tx.milestoneApproved === false) {
    score += 20;
    reasons.push('No milestone approval on record');
  }

  // Vendor repeat check
  if (tx.vendorRepeatPct && tx.vendorRepeatPct > 80) {
    score += 10;
    reasons.push(`Vendor repeat rate ${tx.vendorRepeatPct}% (threshold: 80%)`);
  }

  return { case: 'case1', score, reasons, triggered: score >= 40 };
}

/* ─── CASE 4: Donor Fake Repeated Claims ─── */
function analyzeCase4(tx, allTxns) {
  let score = 0;
  const reasons = [];

  // Check duplicate claims from same wallet
  if (tx.claimsFromWallet > 1) {
    score += 35;
    reasons.push(`${tx.claimsFromWallet} claims from same wallet (limit: 1 per event)`);
  }
  if (tx.claimsFromWallet > 3) {
    score += 15;
    reasons.push('Serial fraud pattern — professional-level repeat claiming');
  }

  // Pre-event check
  if (tx.daysSinceEvent < 0) {
    score += 40;
    reasons.push(`Claim submitted ${Math.abs(tx.daysSinceEvent)} days BEFORE event`);
  }

  // Cross-event check
  const walletTxns = allTxns.filter(t => t.claimantWallet === tx.claimantWallet && t.txId !== tx.txId);
  const uniqueEvents = new Set(walletTxns.map(t => t.eventName));
  if (uniqueEvents.size > 1) {
    score += 15;
    reasons.push(`Claims across ${uniqueEvents.size + 1} different events`);
  }

  // Velocity check
  if (tx.claimsFromWallet > 2 && tx.claimWindowDays <= 30) {
    score += 10;
    reasons.push('High velocity claiming within 30-day window');
  }

  return { case: 'case4', score, reasons, triggered: score >= 40 };
}

/* ─── CASE 5: NGO Shell Entity Transfers ─── */
function analyzeCase5(tx, allTxns) {
  let score = 0;
  const reasons = [];

  // New recipient percentage check
  if (tx.newRecipientPct > 0.5) {
    score += 30;
    reasons.push(`${(tx.newRecipientPct * 100).toFixed(0)}% funds to new recipients in 7 days (threshold: 50%)`);
  }

  // Circular flow check
  if (tx.circularFlowRatio > 0.8) {
    score += 30;
    reasons.push(`Circular flow ratio ${(tx.circularFlowRatio * 100).toFixed(0)}% (threshold: 80%)`);
  } else if (tx.circularFlowRatio > 0.6) {
    score += 15;
    reasons.push(`Elevated circular flow ${(tx.circularFlowRatio * 100).toFixed(0)}%`);
  }

  // Whitelist check
  if (tx.vendorWhitelisted === false) {
    score += 20;
    reasons.push('Vendor not in approved whitelist');
  }

  // New vendor + large amount
  if (tx.vendorAge < 7 && tx.amount > 10000) {
    score += 15;
    reasons.push(`Large transfer (₹${tx.amount.toLocaleString()}) to ${tx.vendorAge}-day-old vendor`);
  }

  // Zero history
  if (tx.vendorTxnCount === 0) {
    score += 10;
    reasons.push('Vendor has zero prior transaction history');
  }

  return { case: 'case5', score, reasons, triggered: score >= 40 };
}

/* ─── COMBINED RISK SCORING ─── */
function getRiskLevel(score) {
  if (score >= 70) return { level: 'critical', label: 'High Risk 🚨' };
  if (score >= 40) return { level: 'medium', label: 'Flagged ⚠️' };
  return { level: 'low', label: 'Legit ✅' };
}

function analyzeTransaction(tx, allTxns, caseType) {
  let result;
  switch (caseType) {
    case 'case1': result = analyzeCase1(tx, allTxns); break;
    case 'case4': result = analyzeCase4(tx, allTxns); break;
    case 'case5': result = analyzeCase5(tx, allTxns); break;
    default: return { riskScore: 0, riskLevel: 'low', flagReasons: [] };
  }

  const { level, label } = getRiskLevel(result.score);
  return {
    riskScore: result.score,
    riskLevel: level,
    riskLabel: label,
    flagReasons: result.reasons,
    triggered: result.triggered,
    caseType
  };
}

module.exports = { analyzeTransaction, analyzeCase1, analyzeCase4, analyzeCase5, getRiskLevel };
