import React, { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import {
  Users, Search, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  XCircle, Clock, ShieldAlert, FileWarning, Download, Eye
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import allTxns from "../data/ngo_transactions.json";

/* ── mock donor registry ─────────────────────────────────────────────── */
const DONORS = [
  { id:1, name:"Rajesh Kumar", email:"donor@example.com",  kycStatus:"verified", wallet:"0x742d35Cc6634C0532925a3b844Bc9e7595f42bEd", joined:"15 Jan 2024", txIds:["TX-001","TX-004","TX-009","TX-W01","TX-W04"] },
  { id:2, name:"Priya Sharma", email:"donor2@example.com", kycStatus:"pending",  wallet:"0x8ba1f109551bD432803012645Ac136ddd64DBA72", joined:"22 Mar 2024", txIds:["TX-002","TX-006","TX-W02","TX-W07"] },
  { id:3, name:"Amit Verma",   email:"amit@gmail.com",     kycStatus:"verified", wallet:"0x0947b0e6d821378805c59d7f46f20b23a7a9e6e7", joined:"10 Feb 2024", txIds:["TX-003","TX-007","TX-011","TX-016"] },
  { id:4, name:"Sunita Rao",   email:"sunita@ngo.org",     kycStatus:"verified", wallet:"0xf977814e90dA44bFA03b6295617ED3694C912C81", joined:"05 Apr 2024", txIds:["TX-005","TX-008","TX-013","TX-017","TX-W03"] },
  { id:5, name:"Kiran Desai",  email:"kiran@trust.in",     kycStatus:"pending",  wallet:"0x2B5AD0c86991C2D5a99a4Cbde1fDC4b75DdDE6D3", joined:"18 May 2024", txIds:["TX-010","TX-014","TX-018","TX-019","TX-W05","TX-W06"] },
];

const TX_MAP = Object.fromEntries(allTxns.map(t => [t.txId, t]));

const fmt = n =>
  n >= 1e7 ? "Rs." + (n/1e7).toFixed(2) + " Cr"
  : n >= 1e5 ? "Rs." + (n/1e5).toFixed(1) + " L"
  : "Rs." + Number(n).toLocaleString("en-IN");

const fmtDate = ts =>
  new Date(ts * 1000).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

const getSev = ratio => {
  if (ratio >= 10) return { label:"CRITICAL", cls:"bg-red-600 text-white" };
  if (ratio >= 5)  return { label:"HIGH",     cls:"bg-rose-500 text-white" };
  if (ratio >= 3)  return { label:"MEDIUM",   cls:"bg-amber-500 text-white" };
  return               { label:"LOW",      cls:"bg-yellow-400 text-black" };
};

/* ── Donor expandable row ─────────────────────────────────────────────── */
const DonorRow = ({ donor, search }) => {
  const [open, setOpen] = useState(false);
  const [txQ, setTxQ]   = useState("");
  const [txF, setTxF]   = useState("all");

  const txns        = useMemo(() => donor.txIds.map(id => TX_MAP[id]).filter(Boolean), [donor.txIds]);
  const flaggedCount = txns.filter(t => t.flagged).length;
  const totalAmt     = txns.reduce((s,t) => s + t.amount, 0);

  const visible = useMemo(() => {
    let list = txns;
    if (txF === "clean")   list = list.filter(t => !t.flagged);
    if (txF === "flagged") list = list.filter(t =>  t.flagged);
    if (txQ.trim()) {
      const q = txQ.toLowerCase();
      list = list.filter(t =>
        t.txId.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q) ||
        t.ngoName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [txns, txF, txQ]);

  const matches = !search ||
    donor.name.toLowerCase().includes(search.toLowerCase()) ||
    donor.email.toLowerCase().includes(search.toLowerCase());

  if (!matches) return null;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${flaggedCount > 0 ? "border-rose-200" : "border-zinc-200"}`}>
      {/* Header */}
      <button className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors text-left" onClick={() => setOpen(v => !v)}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${flaggedCount > 0 ? "bg-rose-500" : "bg-indigo-500"}`}>
          {donor.name.split(" ").map(n => n[0]).join("").slice(0,2)}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-sm">{donor.name}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${donor.kycStatus === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              KYC {donor.kycStatus}
            </span>
            {flaggedCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                <AlertTriangle size={10} /> {flaggedCount} flagged
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5 truncate">{donor.email}</div>
        </div>
        <div className="hidden md:flex items-center gap-8 shrink-0">
          <div className="text-right"><div className="text-xs text-zinc-400">Transactions</div><div className="font-bold text-slate-900">{txns.length}</div></div>
          <div className="text-right"><div className="text-xs text-zinc-400">Total Donated</div><div className="font-bold text-slate-900 font-mono">{fmt(totalAmt)}</div></div>
          <div className="text-right"><div className="text-xs text-zinc-400">Wallet</div><div className="font-mono text-[10px] text-zinc-500">{donor.wallet.slice(0,8)}…{donor.wallet.slice(-5)}</div></div>
        </div>
        <div className={`ml-2 p-2 rounded-lg border shrink-0 ${open ? "border-indigo-300 bg-indigo-50 text-indigo-600" : "border-zinc-200 text-zinc-400"}`}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-zinc-100 bg-slate-50/50">
          {/* Auditor banner */}
          <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
            <Eye size={14} className="text-indigo-500 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              Auditor View — Full Detail · Vendor Addresses · Overspend Ratios · On-Chain Evidence
            </span>
            <span className="ml-auto text-[10px] text-indigo-400 font-mono">Joined {donor.joined}</span>
          </div>

          {/* Search + filter */}
          <div className="px-6 py-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input type="text" className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" placeholder="Search transactions…" value={txQ} onChange={e => setTxQ(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {[["all","All"],["clean","Clean"],["flagged","Flagged"]].map(([v,label]) => (
                <button key={v} onClick={() => setTxF(v)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition ${txF === v ? (v === "flagged" ? "bg-rose-600 text-white border-rose-600" : v === "clean" ? "bg-emerald-600 text-white border-emerald-600" : "bg-indigo-600 text-white border-indigo-600") : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-white">
                  {["Status","TX ID","Date","Project / NGO","Category","Amount","Overspend","Milestone","Vendor","Vendor Addr.","Vendor Conc.","Block Hash","Flag Reasons"].map(h => (
                    <th key={h} className="px-4 py-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(tx => {
                  const sev = getSev(tx.overspendRatio);
                  return (
                    <tr key={tx.txId} className={`border-b border-zinc-50 hover:bg-white transition-colors ${tx.flagged ? "border-l-4 border-rose-400 bg-rose-50/20" : "border-l-4 border-emerald-400"}`}>
                      <td className="px-4 py-3">
                        {tx.flagged
                          ? <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase ${sev.cls}`}><XCircle size={9} /> {sev.label}</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700"><CheckCircle2 size={9} /> Clean</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-indigo-600 font-bold whitespace-nowrap">{tx.txId}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Clock size={11} className="text-zinc-400" />{fmtDate(tx.timestamp)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-xs text-slate-900 max-w-[150px] truncate">{tx.projectName}</div>
                        <div className="text-[10px] text-zinc-400">{tx.ngoName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100 whitespace-nowrap">{tx.category}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900 whitespace-nowrap">{fmt(tx.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold text-xs ${tx.overspendRatio >= 3 ? "text-rose-600" : "text-emerald-600"}`}>{tx.overspendRatio}x</span>
                        <div className="text-[9px] text-zinc-400">of {fmt(tx.avgMonthlyBudget)}</div>
                      </td>
                      <td className="px-4 py-3">
                        {tx.milestoneApproved
                          ? <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold whitespace-nowrap"><CheckCircle2 size={11} /> Approved</span>
                          : <span className="flex items-center gap-1 text-rose-500 text-[10px] font-bold whitespace-nowrap"><XCircle size={11} /> Missing</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-800 max-w-[110px] truncate">{tx.vendorName}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[9px] text-zinc-400 whitespace-nowrap">{tx.vendorAddress.slice(0,10)}…{tx.vendorAddress.slice(-5)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${tx.vendorRepeatPct > 80 ? "bg-rose-500" : "bg-indigo-400"}`} style={{ width: `${tx.vendorRepeatPct}%` }} />
                          </div>
                          <span className={`text-[9px] font-bold ${tx.vendorRepeatPct > 80 ? "text-rose-600" : "text-zinc-500"}`}>{tx.vendorRepeatPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[9px] text-zinc-400 whitespace-nowrap">{tx.blockHash}</td>
                      <td className="px-4 py-3">
                        {tx.flagged && tx.flagReasons.length > 0
                          ? <div className="space-y-1 max-w-[180px]">{tx.flagReasons.map((r,i) => <div key={i} className="flex items-start gap-1 text-[9px] text-rose-700"><AlertTriangle size={9} className="shrink-0 mt-0.5" /><span>{r}</span></div>)}</div>
                          : <span className="text-[10px] text-zinc-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {visible.length === 0 && <div className="py-10 text-center text-zinc-400 text-sm">No transactions match your filter.</div>}
        </div>
      )}
    </div>
  );
};

/* ── Main page ───────────────────────────────────────────────────────── */
const DonorHistory = () => {
  const { user } = useAuth();
  const [search, setSearch]     = useState("");
  const [kycFilter, setKycFilter] = useState("all");

  if (!user || user.role !== "auditor") return <Navigate to="/login" replace />;

  const totalDonors   = DONORS.length;
  const verifiedCount = DONORS.filter(d => d.kycStatus === "verified").length;
  const pendingCount  = DONORS.filter(d => d.kycStatus === "pending").length;
  const totalFlagged  = DONORS.reduce((s,d) => {
    const txns = d.txIds.map(id => TX_MAP[id]).filter(Boolean);
    return s + txns.filter(t => t.flagged).length;
  }, 0);

  const filtered = DONORS.filter(d => {
    if (kycFilter === "verified") return d.kycStatus === "verified";
    if (kycFilter === "pending")  return d.kycStatus === "pending";
    return true;
  });

  const exportCSV = () => {
    const rows = [["Donor","Email","KYC","TX ID","Date","Project","NGO","Category","Amount","Flagged","Severity","Overspend","Milestone","Vendor","Vendor Addr","Vendor Conc%","Block Hash","Flag Reasons"]];
    DONORS.forEach(donor => {
      donor.txIds.forEach(id => {
        const tx = TX_MAP[id];
        if (!tx) return;
        const sev = tx.flagged ? getSev(tx.overspendRatio).label : "";
        rows.push([donor.name, donor.email, donor.kycStatus, tx.txId, fmtDate(tx.timestamp), tx.projectName, tx.ngoName, tx.category, tx.amount, tx.flagged ? "YES" : "NO", sev, tx.overspendRatio + "x", tx.milestoneApproved ? "Yes" : "No", tx.vendorName, tx.vendorAddress, tx.vendorRepeatPct + "%", tx.blockHash, tx.flagReasons.join(" | ")]);
      });
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "donor_history_audit.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 md:px-10 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Users size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Donor Transaction History</h1>
              <p className="text-slate-400 text-sm font-light">Full audit trail — all donors, all transactions, flag status and on-chain evidence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold uppercase tracking-widest">
              <Eye size={13} /> Auditor Access Only
            </div>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label:"Total Donors",  value:totalDonors,   icon:Users,         color:"text-indigo-600",  bg:"bg-indigo-50",  border:"border-indigo-100" },
            { label:"KYC Verified",  value:verifiedCount, icon:CheckCircle2,  color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
            { label:"KYC Pending",   value:pendingCount,  icon:FileWarning,   color:"text-amber-600",   bg:"bg-amber-50",   border:"border-amber-100" },
            { label:"Flagged Txns",  value:totalFlagged,  icon:AlertTriangle, color:"text-rose-600",    bg:"bg-rose-50",    border:"border-rose-100" },
          ].map(({ label, value, icon:Icon, color, bg, border }) => (
            <div key={label} className={`bg-white border ${border} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}><Icon size={15} className={color} /></div>
              </div>
              <div className={`text-3xl font-bold tracking-tight ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Search + KYC filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input type="text" className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" placeholder="Search by donor name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {[["all","All Donors"],["verified","KYC Verified"],["pending","KYC Pending"]].map(([v,label]) => (
              <button key={v} onClick={() => setKycFilter(v)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition whitespace-nowrap ${kycFilter === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-500 border-zinc-200 hover:border-indigo-300"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Auditor notice */}
        <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">Auditor Notice:</span> This page shows complete transaction histories for all registered donors including flag status, overspend ratios, vendor concentration, and on-chain block hashes. Data is read-only and immutable. Click any donor row to expand their full transaction detail.
          </div>
        </div>

        {/* Donor rows */}
        <div className="space-y-4">
          {filtered.map(donor => <DonorRow key={donor.id} donor={donor} search={search} />)}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-t border-zinc-100">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />Auditor-Only Access</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />Smart Contract Fraud Detection Active</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Immutable On-Chain Records</span>
        </div>
      </div>
    </div>
  );
};

export default DonorHistory;
