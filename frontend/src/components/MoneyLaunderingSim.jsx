import React, { useState, useMemo } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp,
  XCircle, Zap, Shield, Info
} from "lucide-react";
import simLaunderingData from "../data/sim_money_laundering.json";

const fmt = (n) => "$" + Number(n).toLocaleString("en-US");
const fmtDate = (ts) =>
  new Date(ts * 1000).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

/* Heatmap cell color */
const heatColor = (amount, flagged) => {
  if (flagged) return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  if (amount > 500) return "bg-blue-400";
  if (amount > 200) return "bg-blue-300";
  if (amount > 100) return "bg-blue-200";
  return "bg-blue-100";
};

export default function MoneyLaunderingSim() {
  const [open, setOpen] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filter, setFilter] = useState("all");

  const data = useMemo(() => {
    if (filter === "flagged") return simLaunderingData.filter((t) => t.flagged);
    if (filter === "clean") return simLaunderingData.filter((t) => !t.flagged);
    return simLaunderingData;
  }, [filter]);

  const flaggedCount = simLaunderingData.filter((t) => t.flagged).length;
  const cleanCount = simLaunderingData.filter((t) => !t.flagged).length;
  const totalSuspicious = simLaunderingData.filter((t) => t.flagged).reduce((s, t) => s + t.amount, 0);
  const avgCleanDonation = Math.round(
    simLaunderingData.filter((t) => !t.flagged).reduce((s, t) => s + t.amount, 0) / (cleanCount || 1)
  );

  return (
    <div className="mt-10">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Zap size={20} />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-200">
              Edge Case 3 — Simulation
            </div>
            <div className="text-lg font-bold">Donor Money Laundering Detection</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase">
            {simLaunderingData.length} Synthetic Records
          </span>
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-5 animate-in fade-in duration-300">
          {/* Detection Rule Banner */}
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Shield size={22} className="text-purple-400 shrink-0" />
            <div className="flex-grow">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Detection Logic — Smart Contract Rules
              </div>
              <div className="font-mono text-xs text-purple-300 bg-slate-800 px-4 py-2 rounded-lg">
                {"if (amount > 1000 && !kycVerified) revert('Flag: Suspicious Donor');"}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mt-3">
                {[
                  { dot: "bg-red-500", text: "Single txn >$1,000 without KYC → REVERT" },
                  { dot: "bg-orange-500", text: "Avg txn jump >5x → SUSPICIOUS" },
                  { dot: "bg-purple-500", text: "Volume > total NGO avg → ALERT" },
                ].map(({ dot, text }) => (
                  <span key={text} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Donors", value: simLaunderingData.length, sub: "synthetic profiles", color: "text-slate-900" },
              { label: "Flagged", value: flaggedCount, sub: "suspicious donors", color: "text-red-600" },
              { label: "Suspicious Volume", value: fmt(totalSuspicious), sub: "total flagged amount", color: "text-red-600" },
              { label: "Avg Clean Donation", value: fmt(avgCleanDonation), sub: "normal baseline", color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 border border-zinc-200 rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Donor Heatmap */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Donor Transaction Heatmap</div>
              <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 inline-block" />$50-100</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300 inline-block" />$100-500</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" />Outlier</span>
              </div>
            </div>
            <div className="grid grid-cols-15 gap-1.5" style={{ gridTemplateColumns: "repeat(15, 1fr)" }}>
              {simLaunderingData.map((tx) => (
                <div
                  key={tx.id}
                  title={`${tx.donorAlias}: ${fmt(tx.amount)}${tx.flagged ? " ⚠ FLAGGED" : ""}`}
                  className={`h-10 rounded-lg transition-all duration-300 flex items-center justify-center text-[9px] font-bold ${heatColor(tx.amount, tx.flagged)} ${
                    tx.flagged ? "animate-pulse text-white" : "text-blue-900/40"
                  }`}
                >
                  {tx.flagged ? "⚠" : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase">Filter:</span>
            {[
              { k: "all", label: `All (${simLaunderingData.length})` },
              { k: "flagged", label: `Flagged (${flaggedCount})` },
              { k: "clean", label: `Clean (${cleanCount})` },
            ].map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                  filter === k
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-purple-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50 border-b border-purple-100">
                    {["Status", "Date", "Donor Wallet", "NGO", "Amount", "Avg Donation", "Jump", "KYC", "Details"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-purple-700 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((tx) => {
                    const isExp = expandedRow === tx.id;
                    return (
                      <React.Fragment key={tx.id}>
                        <tr
                          className={`border-b border-zinc-100 hover:bg-purple-50/40 transition-colors cursor-pointer ${isExp ? "bg-purple-50/60" : ""}`}
                          onClick={() => setExpandedRow(isExp ? null : tx.id)}
                        >
                          <td className="px-4 py-3">
                            {tx.flagged ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-red-600 text-white">
                                <XCircle size={11} /> FLAGGED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={11} /> CLEAN
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-sm text-zinc-600 whitespace-nowrap">
                              <Clock size={12} className="text-zinc-400" />
                              {fmtDate(tx.timestamp)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-xs text-indigo-600 font-bold">{tx.donorWallet}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{tx.donorAlias}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-800">{tx.ngoName}</td>
                          <td className={`px-4 py-3 font-mono font-bold whitespace-nowrap ${tx.flagged ? "text-red-600" : "text-slate-900"}`}>
                            {fmt(tx.amount)}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-zinc-600">{fmt(tx.avgDonation)}</td>
                          <td className="px-4 py-3">
                            {tx.jumpMultiplier >= 5 ? (
                              <span className="font-mono font-bold text-red-600">{tx.jumpMultiplier >= 100 ? "NEW" : `${tx.jumpMultiplier}x`}</span>
                            ) : (
                              <span className="font-mono text-zinc-500">{tx.jumpMultiplier}x</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {tx.kycVerified ? (
                              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 size={12} /> Yes</span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-500 text-xs font-bold"><XCircle size={12} /> No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="p-1.5 border border-zinc-200 rounded-lg text-zinc-400 hover:text-purple-600 hover:border-purple-300 transition-colors">
                              {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                        </tr>
                        {isExp && (
                          <tr className="bg-purple-50/40">
                            <td colSpan={9} className="p-0">
                              <div className="px-8 py-5 border-t border-purple-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2">Flag Reasons</div>
                                    {tx.flagReasons.length > 0 ? (
                                      <div className="space-y-2">
                                        {tx.flagReasons.map((r, i) => (
                                          <div key={i} className="flex items-start gap-2 px-3 py-2 bg-white border border-red-200 rounded-xl">
                                            <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                                            <span className="text-sm text-red-800">{r}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                                        <CheckCircle2 size={12} /> Donor profile clean — KYC verified, normal volume
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Donor Profile</div>
                                    <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-2 text-sm">
                                      {[
                                        ["Wallet", tx.donorWallet, "font-mono"],
                                        ["Block Hash", tx.blockHash, "font-mono text-xs"],
                                        ["Tx Count", `${tx.txCount} transactions`, ""],
                                        ["NGO Avg Volume", fmt(tx.ngoAvgVolume), ""],
                                        ["KYC Status", tx.kycVerified ? "✓ Verified" : "✕ Unverified", tx.kycVerified ? "text-emerald-600 font-bold" : "text-red-600 font-bold"],
                                      ].map(([label, val, cls]) => (
                                        <div key={label}>
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
          </div>
        </div>
      )}
    </div>
  );
}
