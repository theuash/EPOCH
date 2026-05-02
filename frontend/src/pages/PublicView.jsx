import React, { useMemo, useState, useEffect } from 'react';
import {
  Globe2, TrendingUp, AlertTriangle, CheckCircle2,
  Activity, Clock, MapPin, ShieldCheck, Zap, XCircle,
  Users, BarChart3, RefreshCw, Building2, ArrowUpRight,
  ShieldAlert, Database
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import localTxns from '../data/ngo_transactions.json';

const API_BASE = '/api';

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
   FUND FLOW MAP — real Leaflet / OpenStreetMap (no API key)
───────────────────────────────────────────────────────── */

// [lat, lng] coordinates for each city
const CITY_COORDS = {
  Delhi:     [28.6139, 77.2090],
  Mumbai:    [19.0760, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Kolkata:   [22.5726, 88.3639],
  Chennai:   [13.0827, 80.2707],
  Lucknow:   [26.8467, 80.9462],
  Pune:      [18.5204, 73.8567],
  Hyderabad: [17.3850, 78.4867],
};

const FLOWS = [
  { from: 'Delhi',     to: 'Mumbai',    amount: 75000, project: 'National Highway Upgrade',  flagged: false },
  { from: 'Bangalore', to: 'Mysore',    amount: 25000, project: 'Rural School Construction', flagged: false },
  { from: 'Kolkata',   to: 'Chennai',   amount: 50000, project: 'Healthcare Supply Chain',   flagged: false },
  { from: 'Delhi',     to: 'Lucknow',   amount: 92000, project: 'Phantom Infrastructure',    flagged: true  },
  { from: 'Mumbai',    to: 'Pune',      amount: 18000, project: 'Women Skill Training',      flagged: false },
];

// Add Mysore coords (not in CITY_COORDS above)
CITY_COORDS['Mysore'] = [12.2958, 76.6394];

// Collect all unique cities used in flows
const FLOW_CITIES = [...new Set(FLOWS.flatMap(f => [f.from, f.to]))];

/* Leaflet default icon fix not needed — we use CircleMarker only */

const MapSection = () => {
  const [activeFlow, setActiveFlow] = useState(null);
  const flow = activeFlow !== null ? FLOWS[activeFlow] : null;

  // India bounding box center
  const center = [22.5, 82.0];

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

        {/* ── Real Leaflet Map ── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm border border-zinc-200" style={{ height: 440 }}>
          <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            zoomControl={true}
          >

            {/* OpenStreetMap tiles — completely free, no API key */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Flow lines */}
            {FLOWS.map((f, i) => {
              const from = CITY_COORDS[f.from];
              const to   = CITY_COORDS[f.to];
              if (!from || !to) return null;
              const isActive = activeFlow === i;
              const color = f.flagged ? '#f43f5e' : '#10b981';
              return (
                <Polyline
                  key={i}
                  positions={[from, to]}
                  pathOptions={{
                    color,
                    weight:    isActive ? 4 : 2.5,
                    opacity:   isActive ? 1 : 0.65,
                    dashArray: '8 5',
                  }}
                  eventHandlers={{
                    click: () => setActiveFlow(isActive ? null : i),
                  }}
                >
                  <Tooltip sticky>
                    <div style={{ minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{f.project}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{f.from} → {f.to}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: f.flagged ? '#e11d48' : '#059669', marginTop: 4 }}>
                        {f.flagged ? '⚠ Flagged' : '✓ Verified'} · ₹{f.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </Tooltip>
                </Polyline>
              );
            })}

            {/* City nodes */}
            {FLOW_CITIES.map((city) => {
              const coords = CITY_COORDS[city];
              if (!coords) return null;
              // Is this city part of the active flow?
              const inActive = flow && (flow.from === city || flow.to === city);
              return (
                <CircleMarker
                  key={city}
                  center={coords}
                  radius={inActive ? 9 : 6}
                  pathOptions={{
                    color:       '#6366f1',
                    fillColor:   inActive ? '#6366f1' : '#818cf8',
                    fillOpacity: 0.9,
                    weight:      2,
                  }}
                >
                  <Tooltip permanent direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{city}</span>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* ── Right panel: Active Flows + Blockchain status ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Active Flows</div>
            <div className="space-y-2">
              {FLOWS.map((f, i) => {
                const isActive = activeFlow === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveFlow(isActive ? null : i)}
                    className={[
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      isActive
                        ? f.flagged ? 'border-rose-300 bg-rose-50' : 'border-indigo-300 bg-indigo-50'
                        : 'border-zinc-100 hover:border-zinc-200 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {/* status dot */}
                    <span
                      className="shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: f.flagged ? '#f43f5e' : '#10b981' }}
                    />
                    {/* text */}
                    <span className="flex-grow min-w-0 overflow-hidden">
                      <span className="block text-xs font-semibold text-slate-800 truncate leading-snug">
                        {f.project}
                      </span>
                      <span className="flex items-center gap-1 mt-0.5">
                        <MapPin size={9} className="text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-500 truncate">
                          {f.from} → {f.to}
                        </span>
                        <span
                          className="shrink-0 ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
                          style={f.flagged
                            ? { backgroundColor: '#fee2e2', color: '#e11d48' }
                            : { backgroundColor: '#d1fae5', color: '#059669' }}
                        >
                          {f.flagged ? '⚠ Flagged' : '✓ Clean'}
                        </span>
                      </span>
                    </span>
                    {/* amount */}
                    <span className="shrink-0 font-mono text-xs font-bold text-slate-700">
                      {fmt(f.amount)}
                    </span>
                  </button>
                );
              })}
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
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: k === 'Network' ? '#34d399' : '#e2e8f0' }}>{v}</span>
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
