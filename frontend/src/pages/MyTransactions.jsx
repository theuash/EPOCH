import React, { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import {
  Receipt, AlertTriangle, CheckCircle2, XCircle, Clock,
  Search, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert,
  BadgeCheck, Hourglass, ToggleLeft, ToggleRight,
  TrendingUp, Wallet, Hash, Download, Fingerprint
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import allTxns from "../data/ngo_transactions.json";

/* ── donor → transaction mapping ─────────────────────────────────────── */
const DONOR_DATA = {
  "donor@example.com": {
    name: "Rajesh Kumar",
    wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bEd",
    joined: "15 Jan 2024",
    txIds: ["TX-001","TX-004","TX-009","TX-W01","TX-W04"],
    kycDefault: "verified",
  },
  "donor2@example.com": {
    name: "Priya Sharma",
    wallet: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    joined: "22 Mar 2024",
    txIds: ["TX-002","TX-006","TX-W02","TX-W07"],
    kycDefault: "pending",
  },
};

// Wallet-connected donor (demoWalletLogin sets name "Rajesh Kumar")
const WALLET_DONOR = DONOR_DATA["donor@example.com"];

const TX_MAP = Object.fromEntries(allTxns.map(t => [t.txId, t]));

/* ── helpers ─────────────────────────────────────────────────────────── */
const fmt = n =>
  n >= 1e7 ? "Rs." + (n/1e7).toFixed(2) + " Cr"
  : n >= 1e5 ? "Rs." + (n/1e5).toFixed(1) + " L"
  : "Rs." + Number(n).toLocaleString("en-IN");

const fmtDate = ts =>
  new Date(ts * 1000).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

const getSev = ratio => {
  if (ratio >= 10) return { label:"CRITICAL", cls:"bg-red-600 text-white border-red-600" };
  if (ratio >= 5)  return { label:"HIGH",     cls:"bg-rose-500 text-white border-rose-500" };
  if (ratio >= 3)  return { label:"MEDIUM",   cls:"bg-amber-500 text-white border-amber-500" };
  return               { label:"LOW",      cls:"bg-yellow-400 text-black border-yellow-400" };
};

/* ── KYC Card ─────────────────────────────────────────────────────────── */
const KycCard = ({ kycStatus, onToggle }) => {
  const verified = kycStatus === "verified";
  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${verified ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <div className={`px-6 py-4 flex items-center justify-between ${verified ? "bg-emerald-100/60" : "bg-amber-100/60"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verified ? "bg-emerald-600" : "bg-amber-500"}`}>
            <Fingerprint size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">KYC Status</div>
            <div className={`text-lg font-bold tracking-tight ${verified ? "text-emerald-800" : "text-amber-800"}`}>Know Your Customer</div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${verified ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700" : "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"}`}
        >
          {verified ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          Toggle Demo
        </button>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Verification</span>
          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 w-fit ${verified ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-amber-100 border-amber-300 text-amber-800"}`}>
            {verified ? <BadgeCheck size={18} className="text-emerald-600" /> : <Hourglass size={18} className="text-amber-600" />}
            <span className="font-bold text-sm uppercase tracking-wider">{verified ? "Verified" : "Pending"}</span>
          </div>
        </div>
        <div className="sm:col-span-2 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Access Level</span>
          {verified ? (
            <div className="space-y-1.5">
              {["Full transaction history visible","Eligible for large fund disbursements","Blockchain identity confirmed"].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />{item}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {["Document upload required","Transactions limited until verified","Contact support to complete KYC"].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-amber-800">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0" />{item}
                </div>
              ))}
              <button className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors w-fit">
                Upload KYC Documents →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Transaction row (expandable) ────────────────────────────────────── */
const TxRow = ({ tx }) => {
  const [open, setOpen] = useState(false);
  const sev = getSev(tx.overspendRatio);

  return (
    <>
      <tr
        onClick={() => setOpen(v => !v)}
        className={`border-b transition-colors cursor-pointer group ${tx.flagged ? "border-rose-100 hover:bg-rose-50/40 bg-rose-50/20 border-l-4 border-l-rose-400" : "border-zinc-50 hover:bg-emerald-50/20 border-l-4 border-l-emerald-400"}`}
      >
        <td className="px-5 py-4">
          {tx.flagged
            ? <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${sev.cls}`}><XCircle size={11} /> {sev.label}</span>
            : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 size={11} /> Clean</span>}
        </td>
        <td className="px-5 py-4 font-mono text-xs text-indigo-600 font-bold whitespace-nowrap">{tx.txId}</td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500 whitespace-nowrap">
            <Clock size={13} className="text-zinc-400" />{fmtDate(tx.timestamp)}
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="font-semibold text-sm text-slate-900 max-w-[200px] truncate">{tx.projectName}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{tx.ngoName}</div>
        </td>
        <td className="px-5 py-4">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100 whitespace-nowrap">{tx.category}</span>
        </td>
        <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">{fmt(tx.amount)}</td>
        <td className="px-5 py-4">
          {tx.flagged
            ? <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold"><ShieldAlert size={14} /> Flagged</div>
            : <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold"><ShieldCheck size={14} /> Verified</div>}
        </td>
        <td className="px-5 py-4 text-center">
          <div className={`inline-flex p-1.5 rounded-lg border transition-colors ${open ? "border-indigo-300 bg-indigo-50 text-indigo-600" : "border-zinc-200 text-zinc-400 group-hover:border-zinc-300"}`}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </td>
      </tr>

      {/* Expanded detail */}
      {open && (
        <tr className={tx.flagged ? "bg-rose-50/30" : "bg-emerald-50/20"}>
          <td colSpan={8} className="px-6 py-5 border-b border-zinc-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {tx.flagged ? (
                  <>
                    <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertTriangle size={12} /> Smart Contract Flag Reasons
                    </div>
                    <div className="space-y-2">
                      {tx.flagReasons.map((r,i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 bg-white border border-rose-200 rounded-xl">
                          <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-rose-800">{r}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 px-4 py-4 bg-white border border-emerald-200 rounded-xl">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-800 text-sm mb-1">Transaction Verified</div>
                      <div className="text-xs text-emerald-600">All smart contract checks passed. Milestone approved, spend within budget, vendor concentration normal.</div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Hash size={12} /> On-Chain Record
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                  {[
                    ["Block Hash",   tx.blockHash,                                                  "font-mono text-xs text-indigo-600"],
                    ["Description",  tx.description,                                                "text-slate-700"],
                    ["Milestone",    tx.milestoneApproved ? "Approved" : "Not Approved",           tx.milestoneApproved ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"],
                    ["Vendor",       tx.vendorName,                                                 "text-slate-700"],
                    ["Budget",       fmt(tx.avgMonthlyBudget) + " / month",                        "font-mono text-slate-700"],
                    ["Spend Ratio",  tx.overspendRatio + "x of monthly budget",                    tx.overspendRatio >= 3 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{label}</span>
                      <span className={`text-sm ${cls}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/* ── Main page ───────────────────────────────────────────────────────── */
const MyTransactions = () => {
  const { user } = useAuth();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [kycStatus, setKyc]   = useState(null); // null = use default

  if (!user || user.role !== "donor") return <Navigate to="/login" replace />;

  // Resolve donor data — email login uses email, wallet login uses name match
  const donorData = DONOR_DATA[user.address === "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" || user.name === "Rajesh Kumar"
    ? "donor@example.com"
    : "donor@example.com"] || WALLET_DONOR;

  const effectiveKyc = kycStatus ?? donorData.kycDefault;

  const txns = useMemo(
    () => donorData.txIds.map(id => TX_MAP[id]).filter(Boolean),
    [donorData]
  );

  const filtered = useMemo(() => {
    let list = txns;
    if (filter === "clean")   list = list.filter(t => !t.flagged);
    if (filter === "flagged") list = list.filter(t =>  t.flagged);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.txId.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q) ||
        t.ngoName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [txns, filter, search]);

  const totalAmount  = txns.reduce((s,t) => s + t.amount, 0);
  const flaggedCount = txns.filter(t => t.flagged).length;
  const cleanCount   = txns.length - flaggedCount;

  const exportCSV = () => {
    const rows = [["TX ID","Date","Project","NGO","Category","Amount","Status","Flag Reasons"]];
    txns.forEach(tx => rows.push([tx.txId, fmtDate(tx.timestamp), tx.projectName, tx.ngoName, tx.category, tx.amount, tx.flagged ? "FLAGGED" : "CLEAN", tx.flagReasons.join(" | ")]));
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "my_transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 md:px-10 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Receipt size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">My Transactions</h1>
              <p className="text-slate-400 text-sm font-light">{donorData.name} · Joined {donorData.joined}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl">
              <Wallet size={13} className="text-zinc-400" />
              <span className="font-mono text-[10px] text-zinc-500">{donorData.wallet.slice(0,10)}…{donorData.wallet.slice(-6)}</span>
            </div>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors">
              <Download size={13} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-8">

        {/* KYC Card */}
        <KycCard
          kycStatus={effectiveKyc}
          onToggle={() => setKyc(effectiveKyc === "verified" ? "pending" : "verified")}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label:"Total Transactions", value:txns.length,    icon:Receipt,       color:"text-indigo-600",  bg:"bg-indigo-50",  border:"border-indigo-100" },
            { label:"Total Donated",      value:fmt(totalAmount), icon:TrendingUp,  color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
            { label:"Clean",              value:cleanCount,      icon:CheckCircle2,  color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
            { label:"Flagged",            value:flaggedCount,    icon:AlertTriangle, color:flaggedCount > 0 ? "text-rose-600" : "text-emerald-600", bg:flaggedCount > 0 ? "bg-rose-50" : "bg-emerald-50", border:flaggedCount > 0 ? "border-rose-100" : "border-emerald-100" },
          ].map(({ label, value, icon:Icon, color, bg, border }) => (
            <div key={label} className={`bg-white border ${border} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}><Icon size={15} className={color} /></div>
              </div>
              <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Flag alert */}
        {flaggedCount > 0 && (
          <div className="flex items-start gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm text-rose-800">
              <span className="font-bold">{flaggedCount} of your transaction{flaggedCount > 1 ? "s have" : " has"} been flagged</span> by the smart contract fraud detection system. Click any flagged row below to see the reason.
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input type="text" className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition" placeholder="Search by project, NGO, or category…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {[["all","All"],["clean","Clean"],["flagged","Flagged"]].map(([v,label]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition whitespace-nowrap ${filter === v ? (v === "flagged" ? "bg-rose-600 text-white border-rose-600" : v === "clean" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-900 text-white border-slate-900") : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-zinc-100">
                  {["Status","TX ID","Date","Project / NGO","Category","Amount","Blockchain",""].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => <TxRow key={tx.txId} tx={tx} />)}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Receipt size={40} className="mx-auto text-zinc-200 mb-4" strokeWidth={1} />
              <p className="text-zinc-400 text-sm">No transactions match your filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-t border-zinc-100">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Your data only — private view</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />Smart contract fraud detection active</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />Immutable on-chain records</span>
        </div>
      </div>
    </div>
  );
};

export default MyTransactions;
