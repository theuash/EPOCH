import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2,
  Search, Filter, Clock, ArrowUpRight, TrendingUp, Users,
  FileWarning, ChevronDown, ChevronUp, XCircle, Ban,
  Database, Activity, BarChart3, Layers
} from "lucide-react";
import axios from "axios";

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
  }, [search, catFilter]);

  const categories = ["All", ...new Set(ngoTransactions.filter((t) => !t.flagged).map((t) => t.category))];
  const totalAmount = legitTxns.reduce((s, t) => s + t.amount, 0);

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
            <p className="text-zinc-500 text-sm">No matching transactions found.</p>
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
  }, [search, sortField, sortDir, sevFilter, catFilter]);

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
                                <div className="space-y-3 text-sm bg-white border border-zinc-200 rounded-xl p-4">
                                  {[
                                    ["TX ID",           tx.txId,                                                    "font-mono"],
                                    ["Block Hash",      tx.blockHash,                                               "font-mono text-xs"],
                                    ["Description",     tx.description,                                             ""],
                                    ["Milestone",       tx.milestoneApproved ? "✓ Approved" : "✕ Not Approved",    tx.milestoneApproved ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"],
                                    ["Vendor Repeat",   `${tx.vendorRepeatPct}%`,                                   tx.vendorRepeatPct > 80 ? "text-rose-600 font-bold" : "font-bold"],
                                  ].map(([label, val, cls]) => (
                                    <div key={label}>
                                      <span className="text-zinc-400 text-xs block">{label}</span>
                                      <span className={`text-slate-900 ${cls}`}>{val}</span>
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
   MAIN PAGE
══════════════════════════════════════════════════════════ */
const NgoFundSpend = () => {
  const [activeTab, setActiveTab] = useState("legit");
  const [ngoTransactions, setNgoTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ngo-transactions`);
        setNgoTransactions(response.data);
      } catch (err) {
        console.error("Error fetching NGO transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const legitCount   = ngoTransactions.filter((t) => !t.flagged).length;
  const flaggedCount = ngoTransactions.filter((t) =>  t.flagged).length;

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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Layers size={20} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">NGO Fund Spend</h1>
          </div>
          <p className="text-slate-500 text-base font-light ml-[52px]">
            Complete on-chain transaction ledger — whitelisted projects and auto-flagged anomalies.
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
        </div>

        {/* ── Tab Content ── */}
        <div>
          {activeTab === "legit"   && <LegitTab ngoTransactions={ngoTransactions} />}
          {activeTab === "flagged" && <FlaggedTab ngoTransactions={ngoTransactions} />}
        </div>

      </div>
    </div>
  );
};

export default NgoFundSpend;
