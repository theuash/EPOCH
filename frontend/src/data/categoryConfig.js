import { TrendingUp, Users, Flame, Wallet, Building2, AlertTriangle, Ban } from 'lucide-react';
import ngoTransactions from './ngo_transactions.json';
import disasterTransactions from './disaster_relief_transactions.json';
import mlTransactions from './money_laundering_transactions.json';
import claimTransactions from './duplicate_claims_transactions.json';
import shellTransactions from './shell_entity_transactions.json';

const CATEGORIES = [
  {
    id: 'overspend', label: 'Overspend', icon: TrendingUp, mode: 'live',
    description: 'Spend >3× avg monthly budget without milestone approval',
    dataset: ngoTransactions, defaultSort: 'overspendRatio',
    searchFields: ['projectName', 'ngoName', 'vendorName', 'category'],
    rules: [
      { color: 'bg-rose-500', label: 'Overspend', desc: 'Amount > 3× avg monthly budget' },
      { color: 'bg-amber-500', label: 'Milestone', desc: 'No approval on record' },
      { color: 'bg-orange-500', label: 'Vendor Lock', desc: 'Same vendor > 80% of txns' },
    ],
    columns: [
      { key: 'severity', label: 'Severity' },
      { key: 'timestamp', label: 'Date', sortable: true },
      { key: 'projectName', label: 'Project / NGO' },
      { key: 'vendorName', label: 'Vendor' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'overspendRatio', label: 'Overspend', sortable: true, align: 'right' },
      { key: 'details', label: 'Details', align: 'center' },
    ],
    getSeverity: (tx) => {
      if (tx.overspendRatio >= 10) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
      if (tx.overspendRatio >= 5) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
      return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
    },
    statsBuilder: (txns) => {
      const f = txns.filter(tx => tx.flagged);
      return [
        { label: 'Flagged Txns', value: f.length, sub: `out of ${txns.length} total`, icon: AlertTriangle },
        { label: 'Total at Risk', value: `₹${f.reduce((s, t) => s + t.amount, 0).toLocaleString()}`, sub: 'aggregate flagged spend', icon: Ban },
        { label: 'Avg Overspend', value: `${f.length ? (f.reduce((s, t) => s + t.overspendRatio, 0) / f.length).toFixed(1) : 0}x`, sub: 'vs monthly budget', icon: TrendingUp },
        { label: 'Vendor Lock-in', value: f.filter(t => t.vendorRepeatPct > 80).length, sub: 'vendor repeat >80%', icon: Users },
      ];
    },
    renderRow: (tx) => ({
      project: { name: tx.projectName, sub: tx.ngoName },
      vendor: { name: tx.vendorName, address: tx.vendorAddress },
      category: tx.category,
      amount: `₹${tx.amount.toLocaleString()}`,
      metric: { value: `${tx.overspendRatio}x`, sub: `budget: ₹${tx.avgMonthlyBudget.toLocaleString()}` },
    }),
    renderExpanded: (tx) => [
      { label: 'TX ID', value: tx.txId },
      { label: 'Block Hash', value: tx.blockHash, mono: true },
      { label: 'Description', value: tx.description },
      { label: 'Milestone Approved', value: tx.milestoneApproved ? 'Yes' : 'No ✕', danger: !tx.milestoneApproved },
      { label: 'Vendor Repeat Rate', value: `${tx.vendorRepeatPct}%`, danger: tx.vendorRepeatPct > 80 },
    ],
  },
  {
    id: 'unauthorized', label: 'Unauthorized Spend', icon: Flame, mode: 'simulation',
    description: 'Admin costs >20% during disaster phase or category mismatch',
    dataset: disasterTransactions, defaultSort: 'adminRatio',
    searchFields: ['projectName', 'ngoName', 'vendorName', 'declaredPurpose', 'actualCategory'],
    rules: [
      { color: 'bg-rose-500', label: 'Admin Overhead', desc: 'Admin costs > 20% during disaster relief' },
      { color: 'bg-amber-500', label: 'Category Lock', desc: 'Funds used outside declared purpose' },
      { color: 'bg-orange-500', label: 'Diversion', desc: 'Relief funds shifted to luxury/personal' },
    ],
    columns: [
      { key: 'severity', label: 'Severity' },
      { key: 'timestamp', label: 'Date', sortable: true },
      { key: 'projectName', label: 'Project / NGO' },
      { key: 'vendorName', label: 'Vendor' },
      { key: 'mismatch', label: 'Mismatch' },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'adminRatio', label: 'Admin %', sortable: true, align: 'right' },
      { key: 'details', label: 'Details', align: 'center' },
    ],
    getSeverity: (tx) => {
      if (tx.adminRatio >= 0.4) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
      if (tx.adminRatio >= 0.25) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
      return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
    },
    statsBuilder: (txns) => {
      const f = txns.filter(tx => tx.flagged);
      const avgAdmin = f.length ? (f.reduce((s, t) => s + t.adminRatio, 0) / f.length * 100).toFixed(0) : 0;
      return [
        { label: 'Flagged Txns', value: f.length, sub: `out of ${txns.length} total`, icon: AlertTriangle },
        { label: 'Total Diverted', value: `₹${f.reduce((s, t) => s + t.amount, 0).toLocaleString()}`, sub: 'funds misallocated', icon: Ban },
        { label: 'Avg Admin %', value: `${avgAdmin}%`, sub: 'threshold: 20%', icon: TrendingUp },
        { label: 'Category Mismatches', value: f.filter(t => t.categoryMismatch).length, sub: 'purpose vs actual', icon: Flame },
      ];
    },
    renderRow: (tx) => ({
      project: { name: tx.projectName, sub: tx.ngoName },
      vendor: { name: tx.vendorName, address: tx.vendorAddress },
      mismatch: { declared: tx.declaredPurpose, actual: tx.actualCategory },
      amount: `₹${tx.amount.toLocaleString()}`,
      metric: { value: `${(tx.adminRatio * 100).toFixed(0)}%`, sub: `of ₹${tx.totalBudget.toLocaleString()} budget` },
    }),
    renderExpanded: (tx) => [
      { label: 'TX ID', value: tx.txId },
      { label: 'Block Hash', value: tx.blockHash, mono: true },
      { label: 'Description', value: tx.description },
      { label: 'Declared Purpose', value: tx.declaredPurpose },
      { label: 'Actual Category', value: tx.actualCategory, danger: tx.categoryMismatch },
      { label: 'Admin Cost', value: `₹${tx.adminCost.toLocaleString()}`, danger: tx.adminRatio > 0.2 },
    ],
  },
  {
    id: 'laundering', label: 'Money Laundering', icon: Wallet, mode: 'simulation',
    description: 'Donor avg txn jumps >5× or >₹1k without KYC',
    dataset: mlTransactions, defaultSort: 'donationJumpRatio',
    searchFields: ['donorName', 'ngoName', 'category', 'donorWallet'],
    rules: [
      { color: 'bg-rose-500', label: 'Jump Ratio', desc: 'Donation >5× donor average' },
      { color: 'bg-amber-500', label: 'KYC Missing', desc: '>₹1,000 without identity verification' },
      { color: 'bg-orange-500', label: 'Velocity', desc: 'Multiple donations from new wallet in days' },
    ],
    columns: [
      { key: 'severity', label: 'Severity' },
      { key: 'timestamp', label: 'Date', sortable: true },
      { key: 'donorName', label: 'Donor' },
      { key: 'ngoName', label: 'NGO' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'donationJumpRatio', label: 'Jump Ratio', sortable: true, align: 'right' },
      { key: 'details', label: 'Details', align: 'center' },
    ],
    getSeverity: (tx) => {
      if (tx.donationJumpRatio >= 100) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
      if (tx.donationJumpRatio >= 10) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
      return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
    },
    statsBuilder: (txns) => {
      const f = txns.filter(tx => tx.flagged);
      return [
        { label: 'Flagged Donors', value: f.length, sub: `out of ${txns.length} total`, icon: AlertTriangle },
        { label: 'Suspicious Volume', value: `₹${f.reduce((s, t) => s + t.amount, 0).toLocaleString()}`, sub: 'flagged donations', icon: Ban },
        { label: 'Unverified KYC', value: f.filter(t => !t.kycVerified).length, sub: 'no identity proof', icon: Wallet },
        { label: 'New Wallets', value: f.filter(t => t.donorAge < 7).length, sub: 'created <7 days ago', icon: AlertTriangle },
      ];
    },
    renderRow: (tx) => ({
      project: { name: tx.donorName, sub: tx.donorWallet?.slice(0, 10) + '...' },
      vendor: { name: tx.ngoName, address: tx.donorWallet },
      category: tx.category,
      amount: `₹${tx.amount.toLocaleString()}`,
      metric: { value: tx.donationJumpRatio >= 999 ? '∞' : `${tx.donationJumpRatio}x`, sub: `avg: ₹${tx.avgDonation.toLocaleString()}` },
    }),
    renderExpanded: (tx) => [
      { label: 'TX ID', value: tx.txId },
      { label: 'Block Hash', value: tx.blockHash, mono: true },
      { label: 'Description', value: tx.description },
      { label: 'KYC Verified', value: tx.kycVerified ? 'Yes' : 'No ✕', danger: !tx.kycVerified },
      { label: 'Wallet Age', value: `${tx.donorAge} days`, danger: tx.donorAge < 7 },
      { label: 'Donations (30d)', value: tx.donationsLast30Days, danger: tx.donationsLast30Days > 2 },
    ],
  },
  {
    id: 'duplicateClaims', label: 'Duplicate Claims', icon: Users, mode: 'live',
    description: 'Same wallet claims aid >1 time per event or before event date',
    dataset: claimTransactions, defaultSort: 'claimsFromWallet',
    searchFields: ['claimantName', 'eventName', 'claimType', 'claimantWallet'],
    rules: [
      { color: 'bg-rose-500', label: 'Repeat Claim', desc: '>1 claim per wallet per event' },
      { color: 'bg-amber-500', label: 'Pre-Event', desc: 'Claim timestamp before disaster date' },
      { color: 'bg-orange-500', label: 'Cross-Event', desc: 'Same wallet across multiple events' },
    ],
    columns: [
      { key: 'severity', label: 'Severity' },
      { key: 'timestamp', label: 'Date', sortable: true },
      { key: 'claimantName', label: 'Claimant' },
      { key: 'eventName', label: 'Event' },
      { key: 'claimType', label: 'Claim Type' },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'claimsFromWallet', label: 'Claims', sortable: true, align: 'right' },
      { key: 'details', label: 'Details', align: 'center' },
    ],
    getSeverity: (tx) => {
      if (tx.claimsFromWallet >= 5 || tx.daysSinceEvent < 0) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
      if (tx.claimsFromWallet >= 3) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
      return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
    },
    statsBuilder: (txns) => {
      const f = txns.filter(tx => tx.flagged);
      return [
        { label: 'Flagged Claims', value: f.length, sub: `out of ${txns.length} total`, icon: AlertTriangle },
        { label: 'Total Extracted', value: `₹${f.reduce((s, t) => s + t.amount, 0).toLocaleString()}`, sub: 'fraudulent claims', icon: Ban },
        { label: 'Pre-Event', value: f.filter(t => t.daysSinceEvent < 0).length, sub: 'before disaster date', icon: Users },
        { label: 'Serial Fraud', value: f.filter(t => t.claimsFromWallet >= 3).length, sub: '3+ claims same wallet', icon: AlertTriangle },
      ];
    },
    renderRow: (tx) => ({
      project: { name: tx.claimantName, sub: tx.claimantWallet?.slice(0, 10) + '...' },
      vendor: { name: tx.eventName, address: tx.claimantWallet },
      category: tx.claimType,
      amount: `₹${tx.amount.toLocaleString()}`,
      metric: { value: `${tx.claimsFromWallet}`, sub: tx.daysSinceEvent < 0 ? `⚠️ ${Math.abs(tx.daysSinceEvent)}d before event` : `${tx.daysSinceEvent}d after event` },
    }),
    renderExpanded: (tx) => [
      { label: 'TX ID', value: tx.txId },
      { label: 'Block Hash', value: tx.blockHash, mono: true },
      { label: 'Event', value: tx.eventName },
      { label: 'Claim Type', value: tx.claimType },
      { label: 'Claims from Wallet', value: tx.claimsFromWallet, danger: tx.claimsFromWallet > 1 },
      { label: 'Days Since Event', value: tx.daysSinceEvent, danger: tx.daysSinceEvent < 0 },
    ],
  },
  {
    id: 'shellEntity', label: 'Shell Entity', icon: Building2, mode: 'live',
    description: '>50% funds to new recipients in <7 days or circular flow >80%',
    dataset: shellTransactions, defaultSort: 'circularFlowRatio',
    searchFields: ['ngoName', 'vendorName', 'category', 'vendorAddress'],
    rules: [
      { color: 'bg-rose-500', label: 'New Recipients', desc: '>50% funds to new entities in 7 days' },
      { color: 'bg-amber-500', label: 'Circular Flow', desc: 'Out >80% of recent inflows' },
      { color: 'bg-orange-500', label: 'Whitelist', desc: 'Vendor not in approved list' },
    ],
    columns: [
      { key: 'severity', label: 'Severity' },
      { key: 'timestamp', label: 'Date', sortable: true },
      { key: 'ngoName', label: 'NGO' },
      { key: 'vendorName', label: 'Vendor' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'circularFlowRatio', label: 'Circular %', sortable: true, align: 'right' },
      { key: 'details', label: 'Details', align: 'center' },
    ],
    getSeverity: (tx) => {
      if (tx.circularFlowRatio >= 0.85) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
      if (tx.circularFlowRatio >= 0.7) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
      return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
    },
    statsBuilder: (txns) => {
      const f = txns.filter(tx => tx.flagged);
      return [
        { label: 'Shell Transfers', value: f.length, sub: `out of ${txns.length} total`, icon: AlertTriangle },
        { label: 'Total Siphoned', value: `₹${f.reduce((s, t) => s + t.amount, 0).toLocaleString()}`, sub: 'to unverified entities', icon: Ban },
        { label: 'Unwhitelisted', value: f.filter(t => !t.vendorWhitelisted).length, sub: 'not approved', icon: Building2 },
        { label: 'New Vendors', value: f.filter(t => t.vendorAge < 7).length, sub: 'created <7 days', icon: AlertTriangle },
      ];
    },
    renderRow: (tx) => ({
      project: { name: tx.ngoName, sub: '' },
      vendor: { name: tx.vendorName, address: tx.vendorAddress },
      category: tx.category,
      amount: `₹${tx.amount.toLocaleString()}`,
      metric: { value: `${(tx.circularFlowRatio * 100).toFixed(0)}%`, sub: `new: ${(tx.newRecipientPct * 100).toFixed(0)}%` },
    }),
    renderExpanded: (tx) => [
      { label: 'TX ID', value: tx.txId },
      { label: 'Block Hash', value: tx.blockHash, mono: true },
      { label: 'Description', value: tx.description },
      { label: 'Whitelisted', value: tx.vendorWhitelisted ? 'Yes' : 'No ✕', danger: !tx.vendorWhitelisted },
      { label: 'Vendor Age', value: `${tx.vendorAge} days`, danger: tx.vendorAge < 7 },
      { label: 'Vendor Txn Count', value: tx.vendorTxnCount, danger: tx.vendorTxnCount === 0 },
    ],
  },
];

export default CATEGORIES;
