import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../context/Web3Context';
import { AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import transactionsData from '../data/transactions.json';
import '../styles/JudgesDashboard.css';

const JudgesDashboard = () => {
  const { t } = useTranslation();
  const { flags, flagSummary, contracts } = useWeb3();
  const [transactions, setTransactions] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);

  useEffect(() => {
    // Load synthetic transaction data and match with flagged transactions
    setTransactions(transactionsData);
    // Mark transactions as flagged based on Web3 monitoring
    const flaggedTxIds = new Set(flags.map(f => f.txId));
    const flaggedTransactions = transactionsData.map(tx => ({
      ...tx,
      isFlaggedByChain: flaggedTxIds.has(tx.txId.toString())
    }));
    setTransactions(flaggedTransactions);
  }, [flags]);

  useEffect(() => {
    // Filter transactions that are flagged
    const flagged = transactions.filter(tx => tx.flagged || tx.isFlaggedByChain);
    setFilteredFlags(flagged);
  }, [transactions]);

  const getFlagColor = (overspendRatio) => {
    if (overspendRatio > 3.5) return 'badge-critical';
    if (overspendRatio > 3.0) return 'badge-high';
    return 'badge-medium';
  };

  const getStatusIcon = (tx) => {
    if (tx.isFlaggedByChain) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (tx.flagged) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            Judges Dashboard
          </h1>
          <p className="text-slate-400 text-lg">Real-time transaction monitoring & Etherscan-like analysis</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-dark p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">TOTAL TRANSACTIONS</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-4xl font-bold text-white">{transactions.length}</div>
          </div>

          <div className="glass-dark p-6 rounded-2xl border border-red-900 bg-red-950/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-400 text-sm font-semibold">FLAGGED (OVERSPEND)</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-4xl font-bold text-red-400">{filteredFlags.length}</div>
            <div className="text-red-300 text-xs mt-2">{((filteredFlags.length / transactions.length) * 100).toFixed(1)}% of total</div>
          </div>

          <div className="glass-dark p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">AVG OVERSPEND RATIO</span>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-4xl font-bold text-yellow-400">
              {filteredFlags.length > 0
                ? (filteredFlags.reduce((sum, tx) => sum + tx.overspendRatio, 0) / filteredFlags.length).toFixed(2)
                : '0.00'}
              x
            </div>
          </div>

          <div className="glass-dark p-6 rounded-2xl border border-green-900 bg-green-950/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-400 text-sm font-semibold">COMPLIANT TXS</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-4xl font-bold text-green-400">{transactions.length - filteredFlags.length}</div>
          </div>
        </div>

        {/* Flagged Transactions Table - Etherscan Style */}
        <div className="glass-dark rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Flagged Transactions (Overspend Violations)
            </h2>
            <p className="text-slate-400 text-sm mt-2">Spend exceeding Budget × 3.0 threshold</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">TX ID</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">RECEIVER</th>
                  <th className="px-6 py-4 text-right text-slate-300 font-semibold">BUDGET</th>
                  <th className="px-6 py-4 text-right text-slate-300 font-semibold">SPEND</th>
                  <th className="px-6 py-4 text-right text-slate-300 font-semibold">RATIO</th>
                  <th className="px-6 py-4 text-center text-slate-300 font-semibold">STATUS</th>
                  <th className="px-6 py-4 text-center text-slate-300 font-semibold">FLAG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredFlags.length > 0 ? (
                  filteredFlags.map((tx) => (
                    <tr
                      key={tx.txId}
                      className="hover:bg-slate-800/50 transition-colors border-b border-slate-700 bg-red-950/10"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-cyan-400 font-bold">#{tx.txId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{tx.receiverName}</div>
                        <div className="text-xs text-slate-400 font-mono">{tx.receiverAddress.slice(0, 10)}...{tx.receiverAddress.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-semibold">₹{tx.budget.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-red-400 font-semibold">₹{tx.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${tx.overspendRatio > 3.5 ? 'text-red-500' : 'text-orange-400'}`}>
                          {tx.overspendRatio.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusIcon(tx)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`badge ${getFlagColor(tx.overspendRatio)} text-xs font-bold px-3 py-1 rounded-full`}>
                          🚨 OVERSPEND
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <span className="font-semibold">All transactions are compliant</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Transactions Summary */}
        <div className="mt-12 glass-dark rounded-2xl border border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            All Transactions Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">TX ID</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">RECEIVER</th>
                  <th className="px-6 py-4 text-right text-slate-300 font-semibold">BUDGET</th>
                  <th className="px-6 py-4 text-right text-slate-300 font-semibold">SPEND</th>
                  <th className="px-6 py-4 text-right text-slate-300 font-semibold">RATIO</th>
                  <th className="px-6 py-4 text-center text-slate-300 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {transactions.map((tx) => (
                  <tr
                    key={tx.txId}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      tx.flagged || tx.isFlaggedByChain ? 'bg-red-950/10' : 'bg-green-950/5'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-cyan-400 font-bold">#{tx.txId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{tx.receiverName}</div>
                      <div className="text-xs text-slate-400 font-mono">{tx.receiverAddress.slice(0, 10)}...{tx.receiverAddress.slice(-8)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-white font-semibold">₹{tx.budget.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={tx.flagged || tx.isFlaggedByChain ? 'text-red-400' : 'text-green-400'}>
                        ₹{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-bold ${
                          tx.overspendRatio > 3
                            ? 'text-red-500'
                            : tx.overspendRatio > 1
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}
                      >
                        {tx.overspendRatio.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusIcon(tx)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 glass-dark rounded-xl border border-slate-700 p-4 text-sm text-slate-300">
          <div className="font-semibold text-white mb-3">Legend</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Overspend Ratio &gt; 3.5x (Critical)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span>Overspend Ratio 3.0-3.5x (High)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Within Budget × 3.0 (Compliant)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgesDashboard;
