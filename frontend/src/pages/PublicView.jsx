import React, { useMemo, useState } from 'react';
import {
  Globe2, CalendarDays, TrendingUp, AlertTriangle,
  CheckCircle2, Activity, Clock, MapPin, ArrowRight,
  ShieldCheck, Zap, XCircle
} from 'lucide-react';
import allTxns from '../data/ngo_transactions.json';

/* ─────────────────────────────────────────────────────────
   "This week" = Apr 27 – May 3 2026 (Unix seconds)
───────────────────────────────────────────────────────── */
const WEEK_START = 1745712000; // Sun 27 Apr 2026 00:00 UTC
const WEEK_END   = 1746316800; // Sat  3 May 2026 23:59 UTC

/* ─── helpers ─── */
const fmt = (n) =>
  n >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr'
  : n >= 1e5 ? '₹' + (n / 1e5).toFixed(1) + ' L'
  : '₹' + Number(n).toLocaleString('en-IN');

const fmtDate = (ts) =>
  new Date(ts * 1000).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

const getSeverity = (ratio) => {
  if (ratio >= 10) return { label: 'CRITICAL', cls: 'bg-red-600 text-white' };
  if (ratio >= 5)  return { label: 'HIGH',     cls: 'bg-rose-500 text-white' };
  if (ratio >= 3)  return { label: 'MEDIUM',   cls: 'bg-amber-500 text-white' };
  return               { label: 'LOW',      cls: 'bg-yellow-400 text-black' };
};

/* ─────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, accent, pulse }) => (
  <div className={`relative bg-white rounded-2xl border-2 p-7 shadow-sm overflow-hidden
    hover:shadow-md transition-shadow duration-200 ${accent.border}`}>
    {/* background glow blob */}
    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 ${accent.blob}`} />

    <div className="flex items-start justify-between mb-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent.iconBg}`}>
        <Icon size={22} className={accent.iconText} />
      </div>
      {pulse && (
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      )}
    </div>

    <div className={`text-4xl font-bold tracking-tight mb-1 ${accent.value}`}>{value}</div>
    <div className="text-sm font-semibold text-slate-700 mb-0.5">{label}</div>
    {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────
   FUND FLOW MAP (CSS-only India placeholder)
───────────────────────────────────────────────────────── */
const FLOWS = [
  { from: 'Delhi',     to: 'Mumbai',    amount: 75000,  project: 'National Highway Upgrade',  flagged: false, x1: 22, y1: 13, x2: 18, y2: 62 },
  { from: 'Bangalore', to: 'Mysore',    amount: 25000,  project: 'Rural School Construction', flagged: false, x1: 30, y1: 72, x2: 26, y2: 79 },
  { from: 'Kolkata',   to: 'Chennai',   amount: 50000,  project: 'Healthcare Supply Chain',   flagged: false, x1: 72, y1: 30, x2: 38, y2: 80 },
  { from: 'Delhi',     to: 'Lucknow',   amount: 92000,  project: 'Phantom Infrastructure',    flagged: true,  x1: 22, y1: 13, x2: 38, y2: 22 },
  { from: 'Mumbai',    to: 'Pune',      amount: 18000,  project: 'Women Skill Training',      flagged: false, x1: 18, y1: 62, x2: 22, y2: 67 },
];

const CITY_NODES = [
  { city: 'Delhi',     x: '22%', y: '13%' },
  { city: 'Mumbai',    x: '18%', y: '62%' },
  { city: 'Bangalore', x: '30%', y: '72%' },
  { city: 'Kolkata',   x: '72%', y: '30%' },
  { city: 'Chennai',   x: '38%', y: '80%' },
  { city: 'Lucknow',   x: '38%', y: '22%' },
  { city: 'Pune',      x: '22%', y: '67%' },
  { city: 'Hyderabad', x: '34%', y: '68%' },
];

const MapSection = () => {
  const [activeFlow, setActiveFlow] = useState(null);
  const flow = activeFlow !== null ? FLOWS[activeFlow] : null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <MapPin size={18} className="text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Live Fund Flow Map</h2>
        <span className="flex items-center gap-1.5 ml-auto text-[10px] font-bold uppercase tracking-widest text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map canvas */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm relative"
          style={{ minHeight: 420 }}>
          {/* subtle grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:40px_40px]" />
          {/* India silhouette hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="20,5 80,5 90,20 85,40 75,55 70,70 60,85 50,95 40,85 30,70 15,55 10,35 15,20"
                fill="#6366f1" />
            </svg>
          </div>

          {/* SVG flow lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
            {FLOWS.map((f, i) => {
              const color = f.flagged ? '#ef4444' : '#10b981';
              const isActive = activeFlow === i;
              const mx = (f.x1 + f.x2) / 2;
              const my = (f.y1 + f.y2) / 2 - 6;
              return (
                <g key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveFlow(isActive ? null : i)}>
                  <line
                    x1={`${f.x1}%`} y1={`${f.y1}%`}
                    x2={`${f.x2}%`} y2={`${f.y2}%`}
                    stroke={color}
                    strokeWidth={isActive ? 3 : 2}
                    strokeOpacity={isActive ? 1 : 0.55}
                    strokeDasharray="6 4"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.2s" repeatCount="indefinite" />
                  </line>
                  <circle cx={`${mx}%`} cy={`${my}%`} r={isActive ? 7 : 5} fill={color} fillOpacity={0.18}>
                    <animate attributeName="r" values={isActive ? '7;10;7' : '5;7;5'} dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={`${mx}%`} cy={`${my}%`} r={isActive ? 4 : 3} fill={color} />
                </g>
              );
            })}
          </svg>

          {/* City nodes */}
          {CITY_NODES.map((n) => (
            <div key={n.city} className="absolute flex flex-col items-center"
              style={{ left: n.x, top: n.y, transform: 'translate(-50%,-50%)', zIndex: 3 }}>
              <div className="relative w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-md">
                <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-50" />
              </div>
              <span className="mt-1 text-[9px] font-bold text-slate-600 bg-white/90 px-1 rounded shadow-sm whitespace-nowrap">
                {n.city}
              </span>
            </div>
          ))}

          {/* Active popup */}
          {flow && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-64
              bg-white border border-zinc-200 rounded-xl shadow-xl p-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
                  ${flow.flagged ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                  {flow.flagged ? '⚠ Flagged' : '✓ Verified'}
                </span>
                <button onClick={() => setActiveFlow(null)} className="text-zinc-400 hover:text-zinc-700 text-lg leading-none">×</button>
              </div>
              <div className="font-bold text-slate-900 text-sm mb-1">{flow.project}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <MapPin size={11} /> {flow.from} <ArrowRight size={11} /> {flow.to}
              </div>
              <div className="font-mono font-bold text-indigo-600 text-lg">{fmt(flow.amount)}</div>
            </div>
          )}

          <div className="absolute bottom-3 right-3 text-[9px] text-zinc-300 font-mono z-10">
            Click a flow line for details
          </div>
        </div>

        {/* Legend + blockchain status */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Active Flows</div>
            <div className="space-y-2">
              {FLOWS.map((f, i) => (
                <button key={i} onClick={() => setActiveFlow(activeFlow === i ? null : i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                    ${activeFlow === i
                      ? f.flagged ? 'border-rose-300 bg-rose-50' : 'border-indigo-300 bg-indigo-50'
                      : 'border-zinc-100 hover:border-zinc-200 hover:bg-slate-50'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${f.flagged ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <div className="flex-grow min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{f.from} → {f.to}</div>
                    <div className="text-[10px] text-slate-400 truncate">{f.project}</div>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-700 shrink-0">{fmt(f.amount)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Blockchain mini-status */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Zap size={12} className="text-cyan-400" /> Blockchain Status
            </div>
            <div className="space-y-3 text-xs">
              {[
                ['Consensus',   'PBFT · 4/4 Nodes'],
                ['Last Block',  '2 min ago'],
                ['Block Hash',  '0x7a3f2b8e9c4d…'],
                ['Merkle Root', '0x9c4d1a5f3e8b…'],
                ['Network',     '99.98% Uptime'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-slate-400">{k}</span>
                  <span className={`font-mono font-bold ${k === 'Network' ? 'text-emerald-400' : 'text-slate-200'}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <ShieldCheck size={12} /> Tamper-Proof · SHA-256 Verified
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
const PublicView = () => {
  const [txFilter, setTxFilter] = useState('all');

  /* ── this-week stats ── */
  const weekTxns = useMemo(
    () => allTxns.filter((tx) => tx.timestamp >= WEEK_START && tx.timestamp <= WEEK_END),
    []
  );
  const weekCount   = weekTxns.length;
  const weekAmount  = weekTxns.reduce((s, t) => s + t.amount, 0);
  const weekFlagged = weekTxns.filter((t) => t.flagged).length;
  const weekClean   = weekCount - weekFlagged;

  /* ── recent 8 across all time ── */
  const recent = useMemo(
    () => [...allTxns].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8),
    []
  );

  /* ── filtered this-week list ── */
  const filteredWeek = useMemo(() => {
    if (txFilter === 'clean')   return weekTxns.filter((t) => !t.flagged);
    if (txFilter === 'flagged') return weekTxns.filter((t) =>  t.flagged);
    return weekTxns;
  }, [weekTxns, txFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 md:px-10 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Globe2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Public View</h1>
              <p className="text-slate-400 text-sm font-light">Live fund transparency — open to all citizens</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl
            text-emerald-700 text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Blockchain Verified · Real-Time
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-12">

        {/* ══════════ THIS WEEK ══════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">This Week</h2>
            <span className="text-xs text-slate-400 font-medium">Apr 27 – May 3, 2026</span>
          </div>

          {/* 3 stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <StatCard
              icon={Activity}
              label="Donations This Week"
              value={weekCount}
              sub={`${weekClean} clean · ${weekFlagged} flagged`}
              accent={{
                border: 'border-indigo-200',
                blob: 'bg-indigo-400',
                iconBg: 'bg-indigo-50',
                iconText: 'text-indigo-600',
                value: 'text-indigo-700',
              }}
              pulse
            />
            <StatCard
              icon={TrendingUp}
              label="Amount Donated This Week"
              value={fmt(weekAmount)}
              sub="across all NGO projects"
              accent={{
                border: 'border-emerald-200',
                blob: 'bg-emerald-400',
                iconBg: 'bg-emerald-50',
                iconText: 'text-emerald-600',
                value: 'text-emerald-700',
              }}
              pulse
            />
            <StatCard
              icon={AlertTriangle}
              label="Flagged Donations This Week"
              value={weekFlagged}
              sub={weekFlagged > 0 ? 'Under smart-contract review' : 'No anomalies detected'}
              accent={weekFlagged > 0 ? {
                border: 'border-rose-200',
                blob: 'bg-rose-400',
                iconBg: 'bg-rose-50',
                iconText: 'text-rose-600',
                value: 'text-rose-600',
              } : {
                border: 'border-emerald-200',
                blob: 'bg-emerald-400',
                iconBg: 'bg-emerald-50',
                iconText: 'text-emerald-600',
                value: 'text-emerald-600',
              }}
            />
          </div>

          {/* This-week transaction list */}
          {weekTxns.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  This Week's Transactions
                </span>
                {/* filter pills */}
                <div className="flex gap-2">
                  {[['all','All'],['clean','✓ Clean'],['flagged','⚠ Flagged']].map(([v, label]) => (
                    <button key={v} onClick={() => setTxFilter(v)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                        txFilter === v
                          ? v === 'flagged' ? 'bg-rose-600 text-white border-rose-600'
                            : v === 'clean' ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-zinc-50">
                {filteredWeek.map((tx) => {
                  const sev = getSeverity(tx.overspendRatio);
                  return (
                    <div key={tx.txId}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors
                        ${tx.flagged ? 'border-l-4 border-rose-400' : 'border-l-4 border-emerald-400'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                        ${tx.flagged ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                        {tx.flagged
                          ? <AlertTriangle size={16} className="text-rose-500" />
                          : <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">{tx.projectName}</div>
                        <div className="text-xs text-slate-400">{tx.ngoName} · {fmtDate(tx.timestamp)}</div>
                      </div>
                      {/* severity badge for flagged */}
                      {tx.flagged && (
                        <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full
                          text-[9px] font-bold uppercase ${sev.cls}`}>
                          <XCircle size={9} /> {sev.label}
                        </span>
                      )}
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-sm text-slate-900">{fmt(tx.amount)}</div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider
                          ${tx.flagged ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {tx.flagged ? '⚠ Flagged' : '✓ Clean'}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-300 hidden md:block shrink-0">{tx.txId}</span>
                    </div>
                  );
                })}
                {filteredWeek.length === 0 && (
                  <div className="py-10 text-center text-zinc-400 text-sm">No transactions match this filter.</div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ══════════ FUND FLOW MAP ══════════ */}
        <MapSection />

        {/* ══════════ RECENT ACTIVITY ══════════ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <Clock size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Activity</h2>
            <span className="text-xs text-slate-400">Latest 8 transactions across all time</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-zinc-100">
                    {['TX ID','Date','Project / NGO','Category','Amount','Status'].map((h) => (
                      <th key={h} className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((tx) => (
                    <tr key={tx.txId}
                      className={`border-b border-zinc-50 hover:bg-slate-50 transition-colors
                        ${tx.flagged ? 'border-l-4 border-rose-300' : ''}`}>
                      <td className="px-5 py-4 font-mono text-xs text-indigo-600 font-bold">{tx.txId}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{fmtDate(tx.timestamp)}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm text-slate-900">{tx.projectName}</div>
                        <div className="text-xs text-slate-400">{tx.ngoName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">{fmt(tx.amount)}</td>
                      <td className="px-5 py-4">
                        {tx.flagged ? (
                          <span className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
                            <AlertTriangle size={13} /> Flagged
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 size={13} /> Clean
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── footer strip ── */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-zinc-100">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Real-time Consensus Active
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            SHA-256 Block Proofs Verified
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Smart Contract Fraud Detection On
          </span>
        </div>

      </div>
    </div>
  );
};

export default PublicView;
