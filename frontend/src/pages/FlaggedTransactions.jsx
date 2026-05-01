<<<<<<< HEAD
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ExternalLink, Filter, Search } from 'lucide-react';

export default function FlaggedTransactions() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data representing flagged transactions, particularly focusing on Phantom Projects
  const flaggedTxns = [
    {
      id: 'TX-9928-A',
      date: '2026-05-01 14:30',
      project: 'Project Water Wells',
      amount: '₹15,00,000',
      receiver: '0x94B...3F1 (Unverified)',
      reason: 'Phantom Project / Sudden large outflow (>3x avg budget)',
      severity: 'Critical',
      status: 'Frozen'
    },
    {
      id: 'TX-8834-B',
      date: '2026-04-28 09:15',
      project: 'School Supplies Init.',
      amount: '₹12,50,000',
      receiver: '0x1A2...9B4 (New Entity)',
      reason: 'Phantom Project / Vendor unwhitelisted',
      severity: 'High',
      status: 'Pending Audit'
    },
    {
      id: 'TX-7711-C',
      date: '2026-04-25 16:45',
      project: 'Disaster Relief Fund',
      amount: '₹8,00,000',
      receiver: 'Travel & Co.',
      reason: 'Category Mismatch (Admin cost during relief phase)',
      severity: 'High',
      status: 'Reverted'
    },
    {
      id: 'TX-6629-D',
      date: '2026-04-20 11:20',
      project: 'Community Center',
      amount: '₹25,00,000',
      receiver: '0x4F8...7C2',
      reason: 'Suspicious round number / Potential Shell Transfer',
      severity: 'Critical',
      status: 'Frozen'
    }
  ];

  const filteredTxns = flaggedTxns.filter(tx => 
    tx.project.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold mb-3 border border-red-100">
              <ShieldAlert size={14} /> Active Alerts
            </motion.div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-black tracking-tight text-zinc-900">
              Flagged Transactions Ledger
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-sm mt-1">
              Monitoring smart contract reverts and suspicious outflows across all NGO wallets.
            </motion.p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search alerts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-red-400 transition-colors shadow-sm"
              />
            </div>
            <button className="btn-premium btn-premium-outline px-3 py-2 flex items-center gap-2">
              <Filter size={16} /> <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tx ID / Date</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Receiver</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Flag Reason</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTxns.length > 0 ? (
                  filteredTxns.map((tx, idx) => (
                    <motion.tr 
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-red-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-zinc-900">{tx.id}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{tx.date}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{tx.project}</td>
                      <td className="px-6 py-4 font-mono text-xs">{tx.receiver}</td>
                      <td className="px-6 py-4 font-bold text-zinc-900">{tx.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-red-600">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span className="truncate max-w-[250px]" title={tx.reason}>{tx.reason}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                          tx.status === 'Frozen' ? 'bg-red-100 text-red-700 border-red-200' : 
                          tx.status === 'Reverted' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                          'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 ml-auto">
                          Audit <ExternalLink size={12} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-zinc-400">
                      No flagged transactions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
=======
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
} from 'lucide-react';
import ngoTransactions from '../data/ngo_transactions.json';

const FlaggedTransactions = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField, setSortField] = useState('overspendRatio');
  const [sortDir, setSortDir] = useState('desc');

  // Filter only flagged transactions
  const flaggedTxns = useMemo(() => {
    let txns = ngoTransactions.filter((tx) => tx.flagged);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      txns = txns.filter(
        (tx) =>
          tx.projectName.toLowerCase().includes(q) ||
          tx.ngoName.toLowerCase().includes(q) ||
          tx.vendorName.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }
    txns.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return txns;
  }, [searchTerm, sortField, sortDir]);

  const totalFlagged = flaggedTxns.length;
  const totalFlaggedAmount = flaggedTxns.reduce((s, tx) => s + tx.amount, 0);
  const avgOverspend = totalFlagged
    ? (flaggedTxns.reduce((s, tx) => s + tx.overspendRatio, 0) / totalFlagged).toFixed(1)
    : 0;
  const vendorLockCount = flaggedTxns.filter((tx) => tx.vendorRepeatPct > 80).length;

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

  const getSeverity = (ratio) => {
    if (ratio >= 10) return { label: 'CRITICAL', color: 'bg-red-600 text-white' };
    if (ratio >= 5) return { label: 'HIGH', color: 'bg-rose-500 text-white' };
    return { label: 'MEDIUM', color: 'bg-amber-500 text-white' };
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-zinc-200 pb-8">
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
                Active Alerts
              </div>
              <div className="text-xl font-bold">{totalFlagged}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Flagged Txns
              </span>
              <AlertTriangle size={18} className="text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-600">{totalFlagged}</div>
            <div className="text-xs text-zinc-400 mt-1">out of {ngoTransactions.length} total</div>
          </div>

          <div className="bg-white p-8 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Total at Risk
              </span>
              <Ban size={18} className="text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-600">
              ₹{totalFlaggedAmount.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400 mt-1">aggregate flagged spend</div>
          </div>

          <div className="bg-white p-8 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Avg Overspend
              </span>
              <TrendingUp size={18} className="text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-600">{avgOverspend}x</div>
            <div className="text-xs text-zinc-400 mt-1">vs monthly budget</div>
          </div>

          <div className="bg-white p-8 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Vendor Lock-in
              </span>
              <Users size={18} className="text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-600">{vendorLockCount}</div>
            <div className="text-xs text-zinc-400 mt-1">vendor repeat &gt;80%</div>
          </div>
        </div>

        {/* Detection Rules Banner */}
        <div className="bg-zinc-900 text-white p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <FileWarning size={28} className="text-rose-400 shrink-0" />
          <div className="flex-grow">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Smart Contract Detection Rules
            </div>
            <div className="flex flex-col md:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                <span>
                  <strong>Overspend:</strong> Amount &gt; 3× avg monthly budget
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                <span>
                  <strong>Milestone:</strong> No approval on record
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                <span>
                  <strong>Vendor Lock:</strong> Same vendor &gt; 80% of txns
                </span>
              </div>
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

        {/* Flagged Table */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-50 border-b border-rose-200">
                  <th className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                    Severity
                  </th>
                  <th
                    className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest cursor-pointer select-none"
                    onClick={() => handleSort('timestamp')}
                  >
                    <span className="flex items-center gap-1">
                      {t('table.date')} <SortIcon field="timestamp" />
                    </span>
                  </th>
                  <th className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                    Project / NGO
                  </th>
                  <th className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                    Vendor
                  </th>
                  <th className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                    {t('table.category')}
                  </th>
                  <th
                    className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest text-right cursor-pointer select-none"
                    onClick={() => handleSort('amount')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      {t('table.amount')} <SortIcon field="amount" />
                    </span>
                  </th>
                  <th
                    className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest text-right cursor-pointer select-none"
                    onClick={() => handleSort('overspendRatio')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Overspend <SortIcon field="overspendRatio" />
                    </span>
                  </th>
                  <th className="p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest text-center">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {flaggedTxns.map((tx) => {
                  const severity = getSeverity(tx.overspendRatio);
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
                          <div className="font-medium text-black text-sm">{tx.projectName}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{tx.ngoName}</div>
                        </td>

                        {/* Vendor */}
                        <td className="p-6">
                          <div className="text-sm text-black">{tx.vendorName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            {tx.vendorAddress.slice(0, 8)}...{tx.vendorAddress.slice(-6)}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-6">
                          <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest border border-zinc-200">
                            {tx.category}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="p-6 font-mono text-black text-right text-base font-bold">
                          ₹{tx.amount.toLocaleString()}
                        </td>

                        {/* Overspend Ratio */}
                        <td className="p-6 text-right">
                          <span className="font-mono font-bold text-rose-600 text-base">
                            {tx.overspendRatio}x
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            budget: ₹{tx.avgMonthlyBudget.toLocaleString()}
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
                          <td colSpan={8} className="p-0">
                            <div className="px-8 py-6 border-t border-rose-200 animate-in">
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
                                    <div>
                                      <span className="text-zinc-400 text-xs">TX ID</span>
                                      <div className="font-mono text-black">{tx.txId}</div>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 text-xs">Block Hash</span>
                                      <div className="font-mono text-black text-xs">
                                        {tx.blockHash}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 text-xs">Description</span>
                                      <div className="text-black">{tx.description}</div>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 text-xs">Milestone Approved</span>
                                      <div
                                        className={`font-bold ${
                                          tx.milestoneApproved ? 'text-emerald-600' : 'text-rose-600'
                                        }`}
                                      >
                                        {tx.milestoneApproved ? 'Yes' : 'No ✕'}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 text-xs">
                                        Vendor Repeat Rate
                                      </span>
                                      <div
                                        className={`font-bold ${
                                          tx.vendorRepeatPct > 80 ? 'text-rose-600' : 'text-black'
                                        }`}
                                      >
                                        {tx.vendorRepeatPct}%
                                      </div>
                                    </div>
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
>>>>>>> 32100bc595bb5df9a4a09056077dc1c7be9ca185
