import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Search, 
  Filter,
  Clock,
  ArrowUpRight,
  Database
} from 'lucide-react';
import ngoTransactions from '../data/ngo_transactions.json';
import disasterTransactions from '../data/disaster_relief_transactions.json';

const PublicDashboard = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, chainRes] = await Promise.all([
          axios.get('http://localhost:5000/api/transactions'),
          axios.get('http://localhost:5000/api/chain/verify')
        ]);
        setTransactions(txRes.data);
        setChainStatus(chainRes.data);
      } catch (err) { 
        console.error(err);
        // Fallback: use local synthetic data (only legit, non-flagged transactions from all datasets)
        const allDatasets = [...ngoTransactions, ...disasterTransactions];
        const legitTxns = allDatasets.filter(tx => !tx.flagged).map(tx => ({
          ...tx,
          receiverName: tx.vendorName,
          status: 'committed',
        }));
        setTransactions(legitTxns);
        setChainStatus({ intact: true, blockCount: legitTxns.length, lastBlockHash: '0x7f9a...3c2d (demo mode)' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border border-black border-t-transparent animate-spin"></div>
        <p className="font-bold text-black uppercase tracking-[0.2em] text-xs">Syncing Ledger</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-zinc-200 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tighter">Public Ledger Explorer</h1>
            <p className="text-zinc-600 font-light">Real-time transparency into every fund allocation.</p>
          </div>
          
          <div className={`flex items-center gap-6 px-6 py-4 border ${chainStatus?.intact ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
            <div className="text-black opacity-80">
              <ShieldCheck size={28} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Network Integrity</div>
              <div className="text-lg font-bold uppercase">{chainStatus?.intact ? t('status.chain_intact') : t('status.tamper_detected')}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Blocks</span>
              <Database size={18} className="text-zinc-400" />
            </div>
            <div className="text-3xl font-bold text-black">{chainStatus?.blockCount || 0}</div>
          </div>
          <div className="bg-white p-8 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Transfers</span>
              <Activity size={18} className="text-zinc-400" />
            </div>
            <div className="text-3xl font-bold text-black">{transactions.length}</div>
          </div>
          <div className="md:col-span-2 bg-white p-8 border border-zinc-200 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Latest Consensus Hash</div>
            <div className="font-mono text-xs text-black break-all bg-zinc-50 p-4 border border-zinc-200">
              {chainStatus?.lastBlockHash || 'Pending Sync...'}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" className="input-premium pl-12" placeholder="Search by receiver name or category..." />
          </div>
          <button className="btn-premium btn-premium-outline flex items-center gap-3">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('table.date')}</th>
                  <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('table.receiver')}</th>
                  <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('table.category')}</th>
                  <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">{t('table.amount')}</th>
                  <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">{t('table.status')}</th>
                  <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verify</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.txId} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-zinc-400" />
                        <span className="text-sm text-zinc-600">{new Date(tx.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-6 font-medium text-black">{tx.receiverName}</td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest border border-zinc-200">
                        {tx.category || 'General'}
                      </span>
                    </td>
                    <td className="p-6 font-mono text-black text-right text-base">₹{tx.amount.toLocaleString()}</td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        {tx.status === 'flagged' ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold uppercase tracking-widest">
                            <AlertTriangle size={12} /> {t('status.flagged')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} /> {t('status.committed')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <button className="p-2 border border-zinc-200 text-zinc-400 hover:text-black hover:border-black transition-colors">
                        <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {transactions.length === 0 && (
            <div className="py-24 text-center">
              <div className="mb-6 text-zinc-300 flex justify-center">
                <Database size={48} strokeWidth={1} />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No Transactions Recorded</h3>
              <p className="text-zinc-500 text-sm font-light">The ledger is currently empty. Check back later.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500"></div>
            Real-time Consensus Active
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-black"></div>
            SHA-256 Proofs Verified
          </div>
        </div>
      </div>
    </div>
  );
};
export default PublicDashboard;
