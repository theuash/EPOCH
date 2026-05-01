import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert, AlertTriangle, Search, Filter, Clock,
  ArrowUpRight, ChevronDown, ChevronUp, XCircle,
} from 'lucide-react';
import CATEGORIES from '../data/categoryConfig';

const FlaggedTransactions = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('overspend');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('desc');

  const cat = CATEGORIES.find((c) => c.id === activeCategory);

  const switchCategory = (id) => {
    setActiveCategory(id);
    setSearchTerm('');
    setExpandedRow(null);
    const nc = CATEGORIES.find((c) => c.id === id);
    setSortField(nc.defaultSort);
    setSortDir('desc');
  };

  React.useEffect(() => { if (!sortField) setSortField(cat.defaultSort); }, []);

  const flaggedTxns = useMemo(() => {
    let txns = cat.dataset.filter((tx) => tx.flagged);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      txns = txns.filter((tx) => cat.searchFields.some((f) => String(tx[f]).toLowerCase().includes(q)));
    }
    const sf = sortField || cat.defaultSort;
    txns.sort((a, b) => {
      const aVal = a[sf], bVal = b[sf];
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return txns;
  }, [activeCategory, searchTerm, sortField, sortDir, cat]);

  const stats = cat.statsBuilder(cat.dataset);
  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };
  const totalFlagged = CATEGORIES.reduce((sum, c) => sum + c.dataset.filter((tx) => tx.flagged).length, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 border-b border-zinc-200 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-600 flex items-center justify-center"><ShieldAlert size={22} className="text-white" /></div>
              <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tighter">{t('flagged.title')}</h1>
            </div>
            <p className="text-zinc-600 font-light max-w-xl">{t('flagged.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border border-rose-200 text-rose-800">
            <AlertTriangle size={20} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Total Active Alerts</div>
              <div className="text-xl font-bold">{totalFlagged}</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = c.dataset.filter((tx) => tx.flagged).length;
            const isActive = activeCategory === c.id;
            return (
              <button key={c.id} onClick={() => switchCategory(c.id)}
                className={`flex items-center gap-3 px-5 py-4 border transition-all duration-200 min-w-[200px] ${isActive ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}>
                <Icon size={18} className={isActive ? 'text-rose-400' : 'text-zinc-400'} />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase tracking-widest">{c.label}</div>
                  <div className="text-[10px] mt-0.5 text-zinc-400">{count} flagged {c.mode === 'simulation' ? '· sim' : '· live'}</div>
                </div>
                <div className={`ml-auto text-xs font-bold px-2 py-0.5 ${isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}>{count}</div>
              </button>
            );
          })}
        </div>

        {/* Mode Badge */}
        {cat.mode === 'simulation' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={14} /> Simulation Mode — Future Feature Preview
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} className="bg-white p-8 border border-zinc-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                  <StatIcon size={18} className="text-rose-400" />
                </div>
                <div className="text-3xl font-bold text-rose-600">{stat.value}</div>
                <div className="text-xs text-zinc-400 mt-1">{stat.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Detection Rules */}
        <div className="bg-zinc-900 text-white p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <ShieldAlert size={28} className="text-rose-400 shrink-0" />
          <div className="flex-grow">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Smart Contract Detection Rules — {cat.label}</div>
            <div className="flex flex-col md:flex-row gap-4 text-sm">
              {cat.rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 ${rule.color} rounded-full`}></div>
                  <span><strong>{rule.label}:</strong> {rule.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" className="input-premium pl-12" placeholder="Search by project, NGO, vendor, or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-premium btn-premium-outline flex items-center gap-3"><Filter size={16} /> Filters</button>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-50 border-b border-rose-200">
                  {cat.columns.map((col) => (
                    <th key={col.key} className={`p-6 text-[10px] font-bold text-rose-600 uppercase tracking-widest ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}>
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
                      <tr className={`border-b border-zinc-100 hover:bg-rose-50/40 transition-colors cursor-pointer ${isExpanded ? 'bg-rose-50/60' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : tx.txId)}>
                        <td className="p-6"><span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${severity.color}`}><XCircle size={12} /> {severity.label}</span></td>
                        <td className="p-6"><div className="flex items-center gap-3"><Clock size={14} className="text-zinc-400" /><span className="text-sm text-zinc-600">{new Date(tx.timestamp * 1000).toLocaleDateString()}</span></div></td>
                        <td className="p-6"><div className="font-medium text-black text-sm">{row.project.name}</div><div className="text-xs text-zinc-500 mt-0.5">{row.project.sub}</div></td>
                        <td className="p-6"><div className="text-sm text-black">{row.vendor.name}</div><div className="text-[10px] text-zinc-400 font-mono mt-0.5">{row.vendor.address?.slice(0, 8)}...{row.vendor.address?.slice(-6)}</div></td>
                        <td className="p-6">
                          {row.mismatch ? (
                            <div>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest border border-emerald-200">{row.mismatch.declared}</span>
                              <div className="flex items-center gap-1.5 mt-1"><span className="text-[10px] text-zinc-400">→</span><span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-widest border border-rose-200">{row.mismatch.actual}</span></div>
                            </div>
                          ) : (<span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest border border-zinc-200">{row.category}</span>)}
                        </td>
                        <td className="p-6 font-mono text-black text-right text-base font-bold">{row.amount}</td>
                        <td className="p-6 text-right"><span className="font-mono font-bold text-rose-600 text-base">{row.metric.value}</span><div className="text-[10px] text-zinc-400 mt-0.5">{row.metric.sub}</div></td>
                        <td className="p-6 text-center"><button className="p-2 border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-300 transition-colors">{isExpanded ? <ChevronUp size={16} /> : <ArrowUpRight size={16} />}</button></td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-rose-50/40">
                          <td colSpan={cat.columns.length} className="p-0">
                            <div className="px-8 py-6 border-t border-rose-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] mb-3">Flag Reasons (Smart Contract Events)</div>
                                  <div className="space-y-2">
                                    {tx.flagReasons.map((reason, idx) => (
                                      <div key={idx} className="flex items-start gap-3 px-4 py-3 bg-white border border-rose-200">
                                        <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                        <span className="text-sm text-rose-800">{reason}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">On-Chain Record</div>
                                  <div className="space-y-3 text-sm">
                                    {cat.renderExpanded(tx).map((item, idx) => (
                                      <div key={idx}>
                                        <span className="text-zinc-400 text-xs">{item.label}</span>
                                        <div className={`${item.mono ? 'font-mono text-xs' : ''} ${item.danger ? 'font-bold text-rose-600' : 'text-black'}`}>{item.value}</div>
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
              <div className="mb-6 text-zinc-300 flex justify-center"><ShieldAlert size={48} strokeWidth={1} /></div>
              <h3 className="text-lg font-bold text-black mb-2">No Flagged Transactions</h3>
              <p className="text-zinc-500 text-sm font-light">All transactions are within compliance thresholds.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-8 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rose-500"></div>Smart Contract Auto-Flagging Active</div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-black"></div>Immutable Ledger — Tamper-Proof</div>
        </div>
      </div>
    </div>
  );
};

export default FlaggedTransactions;
