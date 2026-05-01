import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Users,
  FileWarning,
  ChevronDown,
  ChevronUp,
  XCircle,
  Ban,
  Flame,
  DollarSign,
} from 'lucide-react';
import ngoTransactions from '../data/ngo_transactions.json';
import disasterTransactions from '../data/disaster_relief_transactions.json';

/* ─── Category Configurations ─── */
const CATEGORIES = [
  {
    id: 'overspend',
    label: 'Overspend',
    icon: TrendingUp,
    description: 'Spend >3× avg monthly budget without milestone approval or vendor repeat >80%',
    color: 'rose',
    dataset: ngoTransactions,
    statsBuilder: (txns) => {
      const flagged = txns.filter((tx) => tx.flagged);
      return [
        { label: 'Flagged Txns', value: flagged.length, sub: `out of ${txns.length} total`, icon: AlertTriangle },
        { label: 'Total at Risk', value: `₹${flagged.reduce((s, tx) => s + tx.amount, 0).toLocaleString()}`, sub: 'aggregate flagged spend', icon: Ban },
        { label: 'Avg Overspend', value: `${flagged.length ? (flagged.reduce((s, tx) => s + tx.overspendRatio, 0) / flagged.length).toFixed(1) : 0}x`, sub: 'vs monthly budget', icon: TrendingUp },
        { label: 'Vendor Lock-in', value: flagged.filter((tx) => tx.vendorRepeatPct > 80).length, sub: 'vendor repeat >80%', icon: Users },
      ];
    },
    rules: [
      { color: 'bg-rose-500', label: 'Overspend', desc: 'Amount > 3× avg monthly budget' },
      { color: 'bg-amber-500', label: 'Milestone', desc: 'No approval on record' },
      { color: 'bg-orange-500', label: 'Vendor Lock', desc: 'Same vendor > 80% of txns' },
    ],
    columns: [
      { key: 'severity', label: 'Severity', sortable: false },
      { key: 'timestamp', label: 'Date', sortable: true },
      { key: 'projectName', label: 'Project / NGO', sortable: false },
      { key: 'vendorName', label: 'Vendor', sortable: false },
      { key: 'category', label: 'Category', sortable: false },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'overspendRatio', label: 'Overspend', sortable: true, align: 'right' },
      { key: 'details', label: 'Details', sortable: false, align: 'center' },
    ],
    getSeverity: (tx) => {
      if (tx.overspendRatio >= 10) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
      if (tx.overspendRatio >= 5) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
      return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
    },
    renderRow: (tx) => ({
      col1: null, // severity — handled generically
      project: { name: tx.projectName, sub: tx.ngoName },
      vendor: { name: tx.vendorName, address: tx.vendorAddress },
      category: tx.category,
      amount: `₹${tx.amount.toLocaleString()}`,
      metric: { value: `${tx.overspendRatio}x`, sub: `budget: ₹${tx.avgMonthlyBudget.toLocaleString()}` },
    }),
    renderExpanded: (tx) => ({
      meta: [
        { label: 'TX ID', value: tx.txId },
        { label: 'Block Hash', value: tx.blockHash, mono: true },
        { label: 'Description', value: tx.description },
        { label: 'Milestone Approved', value: tx.milestoneApproved ? 'Yes' : 'No ✕', danger: !tx.milestoneApproved },
        { label: 'Vendor Repeat Rate', value: `${tx.vendorRepeatPct}%`, danger: tx.vendorRepeatPct > 80 },
      ],
    }),
    searchFields: ['projectName', 'ngoName', 'vendorName', 'category'],
    defaultSort: 'overspendRatio',
  },
  {
    id: 'unauthorized',
    label: 'Unauthorized Spend',
    icon: Flame,
    description: 'Admin costs >20% during disaster phase or category mismatch in relief funds',
    color: 'orange',
    dataset: disasterTransactions,
    statsBuilder: (txns) => {
      const flagged = txns.filter((tx) => tx.flagged);
      const avgAdmin = flagged.length
        ? (flagged.reduce((s, tx) => s + tx.adminRatio, 0) / flagged.length * 100).toFixed(0)
        : 0;
      return [
        { label: 'Flagged Txns', value: flagged.length, sub: `out of ${txns.length} total`, icon: AlertTriangle },
        { label: 'Total Diverted', value: `₹${flagged.reduce((s, tx) => s + tx.amount, 0).toLocaleString()}`, sub: 'funds misallocated', icon: Ban },
        { label: 'Avg Admin %', value: `${avgAdmin}%`, sub: 'threshold: 20%', icon: TrendingUp },
        { label: 'Category Mismatches', value: flagged.filter((tx) => tx.categoryMismatch).length, sub: 'purpose vs actual', icon: Flame },
      ];
    },
    rules: [
      { color: 'bg-rose-500', label: 'Admin Overhead', desc: 'Admin costs > 20% during disaster relief' },
      { color: 'bg-amber-500', label: 'Category Lock', desc: 'Funds used outside declared purpose' },
      { color: 'bg-orange-500', label: 'Diversion', desc: 'Relief funds shifted to luxury/personal' },
    ],
    columns: [
      { key: 'severity', label: 'Severity', sortable: false },
      { key: 'timestamp', label: 'Date', sortable: true },
      { key: 'projectName', label: 'Project / NGO', sortable: false },
      { key: 'vendorName', label: 'Vendor', sortable: false },
      { key: 'mismatch', label: 'Mismatch', sortable: false },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'adminRatio', label: 'Admin %', sortable: true, align: 'right' },
      { key: 'details', label: 'Details', sortable: false, align: 'center' },
    ],
    getSeverity: (tx) => {
      if (tx.adminRatio >= 0.4) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
      if (tx.adminRatio >= 0.25) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
      return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
    },
    renderRow: (tx) => ({
      project: { name: tx.projectName, sub: tx.ngoName },
      vendor: { name: tx.vendorName, address: tx.vendorAddress },
      mismatch: { declared: tx.declaredPurpose, actual: tx.actualCategory },
      amount: `₹${tx.amount.toLocaleString()}`,
      metric: { value: `${(tx.adminRatio * 100).toFixed(0)}%`, sub: `of ₹${tx.totalBudget.toLocaleString()} budget` },
    }),
    renderExpanded: (tx) => ({
      meta: [
        { label: 'TX ID', value: tx.txId },
        { label: 'Block Hash', value: tx.blockHash, mono: true },
        { label: 'Description', value: tx.description },
        { label: 'Declared Purpose', value: tx.declaredPurpose },
        { label: 'Actual Category', value: tx.actualCategory, danger: tx.categoryMismatch },
        { label: 'Admin Cost', value: `₹${tx.adminCost.toLocaleString()}`, danger: tx.adminRatio > 0.2 },
        { label: 'Disaster Phase', value: tx.disasterPhase ? 'Active' : 'Post', danger: tx.disasterPhase && tx.adminRatio > 0.2 },
      ],
    }),
    searchFields: ['projectName', 'ngoName', 'vendorName', 'declaredPurpose', 'actualCategory'],
    defaultSort: 'adminRatio',
  },
];

/* ─── Component ─── */
const FlaggedTransactions = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('overspend');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('desc');

  const cat = CATEGORIES.find((c) => c.id === activeCategory);

  // Reset state on category switch
  const switchCategory = (id) => {
    setActiveCategory(id);
    setSearchTerm('');
    setExpandedRow(null);
    const newCat = CATEGORIES.find((c) => c.id === id);
    setSortField(newCat.defaultSort);
    setSortDir('desc');
  };

  // Initialize sort field on first render
  React.useEffect(() => {
    if (!sortField) setSortField(cat.defaultSort);
  }, []);

  const flaggedTxns = useMemo(() => {
    let txns = cat.dataset.filter((tx) => tx.flagged);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      txns = txns.filter((tx) =>
        cat.searchFields.some((f) => String(tx[f]).toLowerCase().includes(q))
      );
    }
    const sf = sortField || cat.defaultSort;
    txns.sort((a, b) => {
      const aVal = a[sf];
      const bVal = b[sf];
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return txns;
  }, [activeCategory, searchTerm, sortField, sortDir, cat]);

  const stats = cat.statsBuilder(cat.dataset);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const totalFlagged = CATEGORIES.reduce(
    (sum, c) => sum + c.dataset.filter((tx) => tx.flagged).length,
    0
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 border-b border-zinc-200 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-600 flex items-center justify-center">
                <ShieldAlert size={22} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tighter">
                {t('flagged.title')}
              </h1>
            </div>
            <p className="text-zinc-600 font-light max-w-xl">
              {t('flagged.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-200 text-rose-800">
            <AlertTriangle size={20} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                Total Active Alerts
              </div>
              <div className="text-xl font-bold">{totalFlagged}</div>
            </div>
          </div>
        </div>

        {/* ─── Category Tabs ─── */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = c.dataset.filter((tx) => tx.flagged).length;
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => switchCategory(c.id)}
                className={`
                  flex items-center gap-3 px-6 py-4 border transition-all duration-200 min-w-[220px]
                  ${isActive
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-rose-400' : 'text-zinc-400'} />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase tracking-widest">{c.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>
                    {count} flagged
                  </div>
                </div>
                {/* Badge */}
                <div className={`ml-auto text-xs font-bold px-2 py-0.5 ${
                  isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'
                }`}>
                  {count}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} className="bg-white p-8 border border-zinc-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {stat.label}
                  </span>
                  <StatIcon size={18} className="text-rose-400" />
                </div>
                <div className="text-3xl font-bold text-rose-600">{stat.value}</div>
                <div className="text-xs text-zinc-400 mt-1">{stat.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Detection Rules Banner */}
        <div className="bg-zinc-900 text-white p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <FileWarning size={28} className="text-rose-400 shrink-0" />
          <div className="flex-grow">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Smart Contract Detection Rules — {cat.label}
            </div>
            <div className="flex flex-col md:flex-row gap-4 text-sm">
              {cat.rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 ${rule.color} rounded-full`}></div>
                  <span>
                    <strong>{rule.label}:</strong> {rule.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              className="input-premium pl-12"
              placeholder="Search by project, NGO, vendor, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-premium btn-premium-outline flex items-center gap-3">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-50 border-b border-rose-200">
                  {cat.columns.map((col) => (
                    <th
                      key={col.key}
                      className={`p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                      } ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <span className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                        {col.label} {col.sortable && <SortIcon field={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flaggedTxns.map((tx) => {
                  const severity = cat.getSeverity(tx);
                  const row = cat.renderRow(tx);
                  const isExpanded = expandedRow === tx.txId;
                  return (
                    <React.Fragment key={tx.txId}>
                      <tr
                        className={`border-b border-zinc-100 hover:bg-rose-50/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-rose-50/60' : ''
                        }`}
                        onClick={() => setExpandedRow(isExpanded ? null : tx.txId)}
                      >
                        {/* Severity */}
                        <td className="p-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${severity.color}`}
                          >
                            <XCircle size={12} /> {severity.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <Clock size={14} className="text-zinc-400" />
                            <span className="text-sm text-zinc-600">
                              {new Date(tx.timestamp * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        {/* Project / NGO */}
                        <td className="p-6">
                          <div className="font-medium text-black text-sm">{row.project.name}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{row.project.sub}</div>
                        </td>

                        {/* Vendor */}
                        <td className="p-6">
                          <div className="text-sm text-black">{row.vendor.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            {row.vendor.address.slice(0, 8)}...{row.vendor.address.slice(-6)}
                          </div>
                        </td>

                        {/* Category or Mismatch column */}
                        <td className="p-6">
                          {row.mismatch ? (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest border border-emerald-200">
                                  {row.mismatch.declared}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400">→</span>
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-widest border border-rose-200">
                                  {row.mismatch.actual}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest border border-zinc-200">
                              {row.category}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="p-6 font-mono text-black text-right text-base font-bold">
                          {row.amount}
                        </td>

                        {/* Metric (Overspend or Admin %) */}
                        <td className="p-6 text-right">
                          <span className="font-mono font-bold text-rose-600 text-base">
                            {row.metric.value}
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            {row.metric.sub}
                          </div>
                        </td>

                        {/* Expand */}
                        <td className="p-6 text-center">
                          <button className="p-2 border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-300 transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ArrowUpRight size={16} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="bg-rose-50/40">
                          <td colSpan={cat.columns.length} className="p-0">
                            <div className="px-8 py-6 border-t border-rose-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Flag Reasons */}
                                <div className="md:col-span-2">
                                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] mb-3">
                                    Flag Reasons (Smart Contract Events)
                                  </div>
                                  <div className="space-y-2">
                                    {tx.flagReasons.map((reason, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-3 px-4 py-3 bg-white border border-rose-200"
                                      >
                                        <AlertTriangle
                                          size={14}
                                          className="text-rose-500 shrink-0 mt-0.5"
                                        />
                                        <span className="text-sm text-rose-800">{reason}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Transaction Meta */}
                                <div>
                                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                                    On-Chain Record
                                  </div>
                                  <div className="space-y-3 text-sm">
                                    {cat.renderExpanded(tx).meta.map((item, idx) => (
                                      <div key={idx}>
                                        <span className="text-zinc-400 text-xs">{item.label}</span>
                                        <div
                                          className={`${item.mono ? 'font-mono text-xs' : ''} ${
                                            item.danger ? 'font-bold text-rose-600' : 'text-black'
                                          }`}
                                        >
                                          {item.value}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {flaggedTxns.length === 0 && (
            <div className="py-24 text-center">
              <div className="mb-6 text-zinc-300 flex justify-center">
                <ShieldAlert size={48} strokeWidth={1} />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No Flagged Transactions</h3>
              <p className="text-zinc-500 text-sm font-light">
                All transactions are within compliance thresholds.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-8 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-rose-500"></div>
            Smart Contract Auto-Flagging Active
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-black"></div>
            Immutable Ledger — Tamper-Proof
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlaggedTransactions;
