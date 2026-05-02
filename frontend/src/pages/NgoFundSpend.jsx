import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2,
  Search, Filter, Clock, ArrowUpRight, TrendingUp, Users,
  FileWarning, ChevronDown, ChevronUp, XCircle, Ban,
  Database, Activity, BarChart3, Layers, Eye, RefreshCw,
  UserX, Plus, Trash2, Lock, Info, TriangleAlert
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import localTxns from "../data/ngo_transactions.json";

const API_BASE = '/api';

/* ─── helpers ─── */
const getSeverity = (ratio) => {
  if (ratio >= 10) return { label: "CRITICAL", cls: "bg-red-600 text-white border-red-600" };
  if (ratio >= 5)  return { label: "HIGH",     cls: "bg-rose-500 text-white border-rose-500" };
  if (ratio >= 3)  return { label: "MEDIUM",   cls: "bg-amber-500 text-white border-amber-500" };
  return               { label: "LOW",      cls: "bg-yellow-400 text-black border-yellow-400" };
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtDate = (ts) => new Date(ts * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/* ─── sub-components ─── */
const StatCard = ({ label, value, sub, icon: Icon, accent }) => (
  <div className={`bg-white p-7 border rounded-2xl shadow-sm flex flex-col gap-3 ${accent || "border-zinc-200"}`}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
      {Icon && <Icon size={18} className="text-zinc-400" />}
    </div>
    <div className={`text-3xl font-bold tracking-tight ${accent ? "text-rose-600" : "text-slate-900"}`}>{value}</div>
    {sub && <div className="text-xs text-zinc-400">{sub}</div>}
  </div>
);

/* ══════════════════════════════════════════════════════════
   LEGIT TAB
══════════════════════════════════════════════════════════ */
const LegitTab = ({ ngoTransactions }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(ngoTransactions.filter((t) => !t.flagged).map((t) => t.category))],
    [ngoTransactions]
  );

  const totalAmount = useMemo(
    () => ngoTransactions.filter((t) => !t.flagged).reduce((s, tx) => s + tx.amount, 0),
    [ngoTransactions]
  );

  const legitTxns = useMemo(() => {
    let txns = ngoTransactions.filter((tx) => !tx.flagged);
    if (search.trim()) {
      const q = search.toLowerCase();
      txns = txns.filter(
        (tx) =>
          tx.projectName.toLowerCase().includes(q) ||
          tx.ngoName.toLowerCase().includes(q) ||
          tx.vendorName.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }
    if (catFilter !== "All") txns = txns.filter((tx) => tx.category === catFilter);
    return txns;
  }, [ngoTransactions, search, catFilter]);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <StatCard label="Whitelisted Txns"  value={legitTxns.length}    sub={`of ${ngoTransactions.filter(t=>!t.flagged).length} total`} icon={CheckCircle2} />
        <StatCard label="Total Disbursed"   value={fmt(totalAmount)}    sub="across all projects"  icon={Activity} />
        <StatCard label="Active NGOs"       value={new Set(legitTxns.map(t=>t.ngoName)).size} sub="unique organisations" icon={Users} />
        <StatCard label="Categories"        value={categories.length - 1} sub="fund categories"   icon={BarChart3} />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
            placeholder="Search by project, NGO, vendor, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-zinc-500 uppercase">Category:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                catFilter === c
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50 border-b border-emerald-100">
                {["TX ID","Date","Project / NGO","Vendor","Category","Amount","Budget Util.","Milestone","Block Hash"].map((h) => (
                  <th key={h} className="px-5 py-4 text-[10px] font-bold text-emerald-700 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {legitTxns.map((tx) => (
                <tr key={tx.txId} className="border-b border-zinc-50 hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-5 py-4 font-mono text-xs text-indigo-600 font-bold">{tx.txId}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 whitespace-nowrap">
                      <Clock size={13} className="text-zinc-400" />
                      {fmtDate(tx.timestamp)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 text-sm">{tx.projectName}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{tx.ngoName}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-slate-800">{tx.vendorName}</div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{tx.vendorAddress.slice(0,8)}…{tx.vendorAddress.slice(-5)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">{fmt(tx.amount)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(tx.overspendRatio * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-600">{(tx.overspendRatio * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {tx.milestoneApproved ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 size={13} /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 text-xs font-bold">
                        <XCircle size={13} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-zinc-400" title={tx.blockHash}>
                    {tx.blockHash.slice(0, 10)}…{tx.blockHash.slice(-8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {legitTxns.length === 0 && (
          <div className="py-20 text-center">
            <Database size={40} className="mx-auto text-zinc-200 mb-4" strokeWidth={1} />
            <p className="text-zinc-500 text-sm font-semibold mb-1">No legit transactions yet</p>
            <p className="text-zinc-400 text-xs">Submit a milestone transaction from the Admin Dashboard to see it here.</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-6 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />All transactions milestone-verified</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />SHA-256 block hashes on-chain</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   FLAGGED TAB  (absorbed from FlaggedTransactions.jsx)
══════════════════════════════════════════════════════════ */
const FlaggedTab = ({ ngoTransactions }) => {
  const [search, setSearch]       = useState("");
  const [expandedRow, setExpanded] = useState(null);
  const [sortField, setSortField]  = useState("overspendRatio");
  const [sortDir, setSortDir]      = useState("desc");
  const [sevFilter, setSevFilter]  = useState("All");
  const [catFilter, setCatFilter]  = useState("All");
  
  const categories = ["All", ...new Set(ngoTransactions.filter((t) => t.flagged).map((t) => t.category))];

  const flaggedTxns = useMemo(() => {
    let txns = ngoTransactions.filter((tx) => tx.flagged);
    if (search.trim()) {
      const q = search.toLowerCase();
      txns = txns.filter(
        (tx) =>
          tx.projectName.toLowerCase().includes(q) ||
          tx.ngoName.toLowerCase().includes(q) ||
          tx.vendorName.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }
    if (sevFilter !== "All") {
      txns = txns.filter((tx) => getSeverity(tx.overspendRatio).label === sevFilter);
    }
    if (catFilter !== "All") {
      txns = txns.filter((tx) => tx.category === catFilter);
    }
    txns.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return txns;
  }, [ngoTransactions, search, sortField, sortDir, sevFilter, catFilter]);

  const totalFlagged       = flaggedTxns.length;
  const totalFlaggedAmount = flaggedTxns.reduce((s, tx) => s + tx.amount, 0);
  const avgOverspend       = totalFlagged ? (flaggedTxns.reduce((s, tx) => s + tx.overspendRatio, 0) / totalFlagged).toFixed(1) : 0;
  const vendorLockCount    = flaggedTxns.filter((tx) => tx.vendorRepeatPct > 80).length;

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <StatCard label="Flagged Txns"   value={totalFlagged}           sub={`of ${ngoTransactions.length} total`}  icon={AlertTriangle} accent="border-rose-200" />
        <StatCard label="Total at Risk"  value={fmt(totalFlaggedAmount)} sub="aggregate flagged spend"               icon={Ban}           accent="border-rose-200" />
        <StatCard label="Avg Overspend"  value={`${avgOverspend}x`}     sub="vs monthly budget"                     icon={TrendingUp}    accent="border-rose-200" />
        <StatCard label="Vendor Lock-in" value={vendorLockCount}        sub="vendor repeat >80%"                    icon={Users}         accent="border-rose-200" />
      </div>

      {/* Detection Rules Banner */}
      <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <FileWarning size={22} className="text-rose-400 shrink-0" />
        <div className="flex-grow">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Smart Contract Auto-Detection Rules</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            {[
              { dot: "bg-red-500",    text: "Overspend > 3× avg monthly budget" },
              { dot: "bg-amber-500",  text: "No milestone approval on record" },
              { dot: "bg-orange-500", text: "Vendor repeat rate > 80%" },
              { dot: "bg-purple-500", text: "Phantom project suspected" },
            ].map(({ dot, text }) => (
              <span key={text} className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{text}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
              placeholder="Search by project, NGO, vendor, or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase">Severity:</span>
            {["All","CRITICAL","HIGH","MEDIUM","LOW"].map((s) => (
              <button
                key={s}
                onClick={() => setSevFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                  sevFilter === s
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-rose-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-zinc-500 uppercase">Category:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                catFilter === c
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-rose-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Flagged Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-rose-50 border-b border-rose-100">
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest">Severity</th>
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest cursor-pointer select-none" onClick={() => handleSort("timestamp")}>
                  <span className="flex items-center gap-1">Date <SortIcon field="timestamp" /></span>
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest">Project / NGO</th>
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest">Vendor</th>
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest">Category</th>
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest text-right cursor-pointer select-none" onClick={() => handleSort("amount")}>
                  <span className="flex items-center justify-end gap-1">Amount <SortIcon field="amount" /></span>
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest text-right cursor-pointer select-none" onClick={() => handleSort("overspendRatio")}>
                  <span className="flex items-center justify-end gap-1">Overspend <SortIcon field="overspendRatio" /></span>
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-rose-700 uppercase tracking-widest text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {flaggedTxns.map((tx) => {
                const sev = getSeverity(tx.overspendRatio);
                const isExp = expandedRow === tx.txId;
                return (
                  <React.Fragment key={tx.txId}>
                    <tr
                      className={`border-b border-zinc-100 hover:bg-rose-50/40 transition-colors cursor-pointer ${isExp ? "bg-rose-50/60" : ""}`}
                      onClick={() => setExpanded(isExp ? null : tx.txId)}
                    >
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${sev.cls}`}>
                          <XCircle size={11} /> {sev.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-600 whitespace-nowrap">
                          <Clock size={13} className="text-zinc-400" />
                          {fmtDate(tx.timestamp)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{tx.projectName}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{tx.ngoName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-800">{tx.vendorName}</div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{tx.vendorAddress.slice(0,8)}…{tx.vendorAddress.slice(-5)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-zinc-200">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 text-right whitespace-nowrap">{fmt(tx.amount)}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-mono font-bold text-rose-600">{tx.overspendRatio}x</span>
                        <div className="text-[10px] text-zinc-400 mt-0.5">budget: {fmt(tx.avgMonthlyBudget)}</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button className="p-2 border border-zinc-200 rounded-lg text-zinc-400 hover:text-rose-600 hover:border-rose-300 transition-colors">
                          {isExp ? <ChevronUp size={15} /> : <ArrowUpRight size={15} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExp && (
                      <tr className="bg-rose-50/40">
                        <td colSpan={8} className="p-0">
                          <div className="px-8 py-6 border-t border-rose-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="md:col-span-2">
                                <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-3">
                                  Flag Reasons — Smart Contract Events
                                </div>
                                <div className="space-y-2">
                                  {tx.flagReasons.map((reason, idx) => (
                                    <div key={idx} className="flex items-start gap-3 px-4 py-3 bg-white border border-rose-200 rounded-xl">
                                      <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                                      <span className="text-sm text-rose-800">{reason}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">On-Chain Record</div>
                                <div className="space-y-3 text-sm bg-white border border-zinc-200 rounded-xl p-4 overflow-hidden">
                                  {[
                                    ["TX ID",           tx.txId,                                                    "font-mono"],
                                    ["Block Hash",      tx.blockHash,                                               "font-mono text-xs break-all"],
                                    ["Description",     tx.description,                                             ""],
                                    ["Milestone",       tx.milestoneApproved ? "✓ Approved" : "✕ Not Approved",    tx.milestoneApproved ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"],
                                    ["Vendor Repeat",   `${tx.vendorRepeatPct}%`,                                   tx.vendorRepeatPct > 80 ? "text-rose-600 font-bold" : "font-bold"],
                                  ].map(([label, val, cls]) => (
                                    <div key={label} className="min-w-0">
                                      <span className="text-zinc-400 text-xs block">{label}</span>
                                      <span className={`text-slate-900 block ${cls}`}>{val}</span>
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
          <div className="py-20 text-center">
            <ShieldCheck size={40} className="mx-auto text-emerald-300 mb-4" strokeWidth={1} />
            <p className="text-zinc-500 text-sm">No flagged transactions match your filters.</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-6 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />Smart Contract Auto-Flagging Active</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-800 inline-block" />Immutable Ledger — Tamper-Proof</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SUSPECTED NGOs TAB
   - Auto-populates NGOs that have flagged transactions
   - Auditor can manually add/remove NGOs with a reason
   - Persisted in localStorage (no backend change needed)
══════════════════════════════════════════════════════════ */
const STORAGE_KEY = "suspected_ngos_v1";

const SuspectedTab = ({ ngoTransactions, isAuditor }) => {
  const fmt     = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const fmtDate = (ts) => new Date(ts * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // Load auditor-added entries from localStorage
  const [manualEntries, setManualEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [addNgo, setAddNgo]           = useState("");
  const [addReason, setAddReason]     = useState("");
  const [expanded, setExpanded]       = useState(null);

  const saveEntries = (entries) => {
    setManualEntries(entries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  const handleAdd = () => {
    if (!addNgo.trim() || !addReason.trim()) return;
    const entry = {
      ngoName:   addNgo.trim(),
      reason:    addReason.trim(),
      addedAt:   Date.now(),
      addedBy:   "Auditor",
      manual:    true,
    };
    saveEntries([...manualEntries, entry]);
    setAddNgo(""); setAddReason(""); setShowAddForm(false);
  };

  const handleRemove = (ngoName) => {
    saveEntries(manualEntries.filter(e => e.ngoName !== ngoName));
  };

  // Build per-NGO stats from transactions
  const ngoStats = useMemo(() => {
    const map = {};
    ngoTransactions.forEach(tx => {
      if (!map[tx.ngoName]) {
        map[tx.ngoName] = { ngoName: tx.ngoName, total: 0, flagged: 0, totalAmount: 0, flaggedAmount: 0, flagReasons: new Set(), txns: [] };
      }
      map[tx.ngoName].total++;
      map[tx.ngoName].totalAmount += tx.amount;
      map[tx.ngoName].txns.push(tx);
      if (tx.flagged) {
        map[tx.ngoName].flagged++;
        map[tx.ngoName].flaggedAmount += tx.amount;
        tx.flagReasons.forEach(r => map[tx.ngoName].flagReasons.add(r));
      }
    });
    return map;
  }, [ngoTransactions]);

  // Auto-suspected: NGOs with ≥1 flagged transaction
  const autoSuspected = useMemo(() =>
    Object.values(ngoStats)
      .filter(s => s.flagged > 0)
      .sort((a, b) => b.flagged - a.flagged),
    [ngoStats]
  );

  // Merge auto + manual (deduplicate by ngoName)
  const allSuspected = useMemo(() => {
    const autoNames = new Set(autoSuspected.map(s => s.ngoName));
    const manualOnly = manualEntries.filter(e => !autoNames.has(e.ngoName));
    return [
      ...autoSuspected.map(s => ({
        ...s,
        flagReasons: [...s.flagReasons],
        manual: false,
        manualEntry: manualEntries.find(e => e.ngoName === s.ngoName) || null,
      })),
      ...manualOnly.map(e => ({
        ngoName:       e.ngoName,
        total:         ngoStats[e.ngoName]?.total || 0,
        flagged:       ngoStats[e.ngoName]?.flagged || 0,
        totalAmount:   ngoStats[e.ngoName]?.totalAmount || 0,
        flaggedAmount: ngoStats[e.ngoName]?.flaggedAmount || 0,
        flagReasons:   ngoStats[e.ngoName] ? [...ngoStats[e.ngoName].flagReasons] : [],
        txns:          ngoStats[e.ngoName]?.txns || [],
        manual:        true,
        manualEntry:   e,
      })),
    ];
  }, [autoSuspected, manualEntries, ngoStats]);

  // Only NGOs with at least one flagged transaction can be added
  const flaggedNgoNames = useMemo(() =>
    [...new Set(ngoTransactions.filter(t => t.flagged).map(t => t.ngoName))].sort(),
    [ngoTransactions]
  );

  const getSuspicionLevel = (flagged, total) => {
    const ratio = total > 0 ? flagged / total : 0;
    if (ratio >= 0.7 || flagged >= 3) return { label: "HIGH",   color: "#e11d48", bg: "#fff1f2", border: "#fecdd3" };
    if (ratio >= 0.4 || flagged >= 2) return { label: "MEDIUM", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
    return                             { label: "LOW",    color: "#ca8a04", bg: "#fefce8", border: "#fef08a" };
  };

  return (
    <div>
      {/* Header banner */}
      <div className="flex items-start gap-4 px-6 py-5 bg-slate-900 text-white rounded-2xl mb-8">
        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shrink-0">
          <UserX size={20} className="text-white" />
        </div>
        <div className="flex-grow">
          <div className="font-bold text-lg tracking-tight mb-1">Suspected NGOs</div>
          <div className="text-slate-400 text-sm">
            NGOs are auto-flagged when their transactions trigger fraud detection rules.
            {isAuditor && " As auditor, you can also manually add NGOs under investigation."}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-3xl font-bold text-rose-400">{allSuspected.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Under Suspicion</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Suspected NGOs",    value: allSuspected.length,                                                                  color: "#e11d48", bg: "#fff1f2" },
          { label: "Total Flagged Txns", value: allSuspected.reduce((s, n) => s + n.flagged, 0),                                    color: "#d97706", bg: "#fffbeb" },
          { label: "Amount at Risk",    value: fmt(allSuspected.reduce((s, n) => s + n.flaggedAmount, 0)),                           color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Auditor-Added",     value: manualEntries.length,                                                                 color: "#0369a1", bg: "#f0f9ff" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{label}</div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Auditor add button */}
      {isAuditor && (
        <div className="mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> Add NGO to Suspected List
            </button>
          ) : (
            <div className="bg-white border-2 border-rose-200 rounded-2xl p-5 space-y-4">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserX size={15} className="text-rose-600" /> Add NGO Under Investigation
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">NGO Name *</label>
                  <select
                    className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition bg-white"
                    value={addNgo}
                    onChange={e => setAddNgo(e.target.value)}
                  >
                    <option value="">Select a flagged NGO…</option>
                    {flaggedNgoNames.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={9} className="text-amber-500 shrink-0" />
                    Only NGOs with flagged transactions can be added to the suspected list.
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Reason for Suspicion *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                    placeholder="e.g. Repeated vendor lock-in, phantom beneficiaries…"
                    value={addReason}
                    onChange={e => setAddReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  disabled={!addNgo.trim() || addNgo === "__custom__" || !addReason.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} /> Confirm
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setAddNgo(""); setAddReason(""); }}
                  className="px-5 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NGO cards */}
      {allSuspected.length === 0 ? (
        <div className="py-20 text-center">
          <ShieldCheck size={44} className="mx-auto text-emerald-300 mb-4" strokeWidth={1} />
          <p className="text-zinc-500 text-sm font-semibold mb-1">No suspected NGOs</p>
          <p className="text-zinc-400 text-xs">All NGOs have clean transaction records.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allSuspected.map((ngo) => {
            const level   = getSuspicionLevel(ngo.flagged, ngo.total);
            const isOpen  = expanded === ngo.ngoName;
            const manual  = ngo.manualEntry;
            const initials = ngo.ngoName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div
                key={ngo.ngoName}
                className="bg-white border-2 rounded-2xl overflow-hidden shadow-sm transition-all"
                style={{ borderColor: isOpen ? level.border : "#e4e4e7" }}
              >
                {/* Card header */}
                <div
                  className="flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : ngo.ngoName)}
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: level.color }}
                  >
                    {initials}
                  </div>

                  {/* Name + badges */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{ngo.ngoName}</span>
                      {/* Suspicion level badge */}
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={{ backgroundColor: level.bg, color: level.color, borderColor: level.border }}
                      >
                        {level.label} SUSPICION
                      </span>
                      {/* Manual badge */}
                      {manual && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                          Auditor-Added
                        </span>
                      )}
                    </div>
                    {/* Manual reason */}
                    {manual && (
                      <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Info size={10} className="text-sky-500 shrink-0" />
                        {manual.reason}
                      </div>
                    )}
                    {/* Auto reason summary */}
                    {!manual && ngo.flagReasons.length > 0 && (
                      <div className="text-xs text-zinc-400 mt-0.5 truncate max-w-md">
                        {ngo.flagReasons[0]}{ngo.flagReasons.length > 1 ? ` +${ngo.flagReasons.length - 1} more` : ""}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Flagged</div>
                      <div className="font-bold text-rose-600">{ngo.flagged} / {ngo.total}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">At Risk</div>
                      <div className="font-mono font-bold text-slate-900">{fmt(ngo.flaggedAmount)}</div>
                    </div>
                  </div>

                  {/* Auditor remove button */}
                  {isAuditor && manual && (
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(ngo.ngoName); }}
                      className="shrink-0 p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      title="Remove from suspected list"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* Expand chevron */}
                  <div className={`p-2 rounded-lg border shrink-0 transition-colors ${isOpen ? "border-rose-300 bg-rose-50 text-rose-600" : "border-zinc-200 text-zinc-400"}`}>
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>

                {/* Expanded: flagged transactions */}
                {isOpen && (
                  <div className="border-t border-zinc-100 px-6 py-5">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertTriangle size={11} className="text-rose-500" />
                      Flagged Transactions — {ngo.flagged} of {ngo.total} total
                    </div>

                    {ngo.txns.filter(t => t.flagged).length === 0 ? (
                      <div className="text-sm text-zinc-400 italic">
                        No flagged transactions on record — added manually by auditor.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ngo.txns.filter(t => t.flagged).map(tx => (
                          <div
                            key={tx.txId}
                            className="flex flex-col gap-2 px-4 py-4 bg-rose-50/60 border border-rose-200 rounded-xl"
                          >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <div className="font-semibold text-sm text-slate-900">{tx.projectName}</div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="font-mono text-[10px] text-zinc-400">{tx.txId}</span>
                                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                    <Clock size={10} />{fmtDate(tx.timestamp)}
                                  </span>
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                                    {tx.category}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-mono font-bold text-slate-900">{fmt(tx.amount)}</div>
                                <div className="text-[10px] font-bold text-rose-600">{tx.overspendRatio}x budget</div>
                              </div>
                            </div>
                            {/* Flag reasons */}
                            <div className="space-y-1">
                              {tx.flagReasons.map((r, i) => (
                                <div key={i} className="flex items-start gap-2 px-3 py-1.5 bg-white border border-rose-200 rounded-lg">
                                  <AlertTriangle size={10} className="text-rose-500 shrink-0 mt-0.5" />
                                  <span className="text-[11px] text-rose-800">{r}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Auditor note if manually added */}
                    {manual && (
                      <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl">
                        <Lock size={13} className="text-sky-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-0.5">Auditor Note</div>
                          <div className="text-sm text-sky-800">{manual.reason}</div>
                          <div className="text-[10px] text-sky-500 mt-1">
                            Added by {manual.addedBy} · {new Date(manual.addedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!isAuditor && (
        <div className="mt-6 flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Lock size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-bold">Auditor access required</span> to manually add NGOs to this list. NGOs are auto-listed based on flagged transaction data.
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-6 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />Auto-detection active</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />Auditor-curated entries</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
const NgoFundSpend = () => {
  const [activeTab, setActiveTab] = useState("legit");
  const [ngoTransactions, setNgoTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("api");
  const { user } = useAuth();
  const isAuditor = user?.role === "auditor";

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/ngo-transactions`, { timeout: 5000 });
      // Always use live DB data — even if empty (admin hasn't submitted yet)
      setNgoTransactions(Array.isArray(res.data) ? res.data : []);
      setDataSource("api");
    } catch {
      // Backend offline — fall back to local JSON seed data
      setNgoTransactions(localTxns);
      setDataSource("local");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const legitCount   = ngoTransactions.filter((t) => !t.flagged).length;
  const flaggedCount = ngoTransactions.filter((t) =>  t.flagged).length;
  // Count unique NGOs with at least one flagged transaction
  const suspectedCount = useMemo(() => {
    const names = new Set(ngoTransactions.filter(t => t.flagged).map(t => t.ngoName));
    try {
      const manual = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      manual.forEach(e => names.add(e.ngoName));
    } catch {}
    return names.size;
  }, [ngoTransactions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-zinc-500 font-medium animate-pulse">Loading database records...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] p-6 md:p-10 text-slate-900 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Layers size={20} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">NGO Fund Spend</h1>
            {isAuditor && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200 uppercase tracking-wider">
                <Eye size={11} /> Auditor — Extended View
              </span>
            )}
            {/* Data source badge */}
            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ml-auto ${
              dataSource === "api"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${dataSource === "api" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {dataSource === "api" ? "Live — MongoDB" : "Demo data — backend offline"}
            </span>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-50 transition-colors"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
          <p className="text-slate-500 text-base font-light ml-[52px]">
            {isAuditor
              ? "Full audit detail — vendor addresses, overspend ratios, vendor concentration, and on-chain evidence."
              : "Complete on-chain transaction ledger — whitelisted projects and auto-flagged anomalies."}
          </p>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1 p-1 bg-white border border-zinc-200 rounded-2xl w-fit mb-8 shadow-sm">
          {/* LEGIT tab */}
          <button
            onClick={() => setActiveTab("legit")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "legit"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle2 size={16} />
            Legit
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "legit" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
            }`}>
              {legitCount}
            </span>
          </button>

          {/* FLAGGED tab */}
          <button
            onClick={() => setActiveTab("flagged")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "flagged"
                ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                : "text-zinc-500 hover:text-rose-700 hover:bg-rose-50"
            }`}
          >
            <ShieldAlert size={16} />
            Flagged
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "flagged" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"
            }`}>
              {flaggedCount}
            </span>
          </button>

          {/* SUSPECTED NGOs tab */}
          <button
            onClick={() => setActiveTab("suspected")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === "suspected"
                ? "bg-slate-900 text-white shadow-md shadow-slate-300"
                : "text-zinc-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <UserX size={16} />
            Suspected NGOs
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "suspected" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}>
              {suspectedCount}
            </span>
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div>
          {activeTab === "legit"     && <LegitTab ngoTransactions={ngoTransactions} />}
          {activeTab === "flagged"   && <FlaggedTab ngoTransactions={ngoTransactions} />}
          {activeTab === "suspected" && <SuspectedTab ngoTransactions={ngoTransactions} isAuditor={isAuditor} />}
        </div>

      </div>
    </div>
  );
};

export default NgoFundSpend;
