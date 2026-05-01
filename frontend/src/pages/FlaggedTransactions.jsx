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
