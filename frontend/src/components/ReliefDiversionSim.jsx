import React, { useState, useMemo } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp,
  XCircle, Flame, Shield, Info, Zap
} from "lucide-react";
import simReliefData from "../data/sim_relief_diversion.json";

const fmt = (n) => "$" + Number(n).toLocaleString("en-US");
const fmtDate = (ts) =>
  new Date(ts * 1000).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

const AdminGauge = ({ ratio }) => {
  const pct = Math.round(ratio * 100);
  const isBad = ratio > 0.2;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isBad ? "bg-red-500" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold ${isBad ? "text-red-600" : "text-emerald-600"}`}>
        {pct}%
      </span>
    </div>
  );
};

export default function ReliefDiversionSim() {
  const [open, setOpen] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filter, setFilter] = useState("all");

  const data = useMemo(() => {
    if (filter === "flagged") return simReliefData.filter((t) => t.flagged);
    if (filter === "clean") return simReliefData.filter((t) => !t.flagged);
    return simReliefData;
  }, [filter]);

  const flaggedCount = simReliefData.filter((t) => t.flagged).length;
  const cleanCount = simReliefData.filter((t) => !t.flagged).length;
  const totalDiverted = simReliefData.filter((t) => t.flagged).reduce((s, t) => s + t.amount, 0);
  const avgFlaggedRatio = (
    simReliefData.filter((t) => t.flagged).reduce((s, t) => s + t.adminRatio, 0) / (flaggedCount || 1)
  ).toFixed(0);

  return (
    <div className="mt-10">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Flame size={20} />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
              Edge Case 2 — Simulation
            </div>
            <div className="text-lg font-bold">Disaster Relief Diversion Detection</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase">
            {simReliefData.length} Synthetic Records
          </span>
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-5 animate-in fade-in duration-300">
          {/* Detection Rule Banner */}
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Shield size={22} className="text-amber-400 shrink-0" />
            <div className="flex-grow">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Detection Logic — Smart Contract Rules
              </div>
              <div className="font-mono text-xs text-amber-300 bg-slate-800 px-4 py-2 rounded-lg">
                {"if (adminRatio > 0.20 || category != 'relief') { flag.red(); revert(); }"}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mt-3">
                {[
                  { dot: "bg-red-500", text: "Admin costs >20% in disaster phase → HIGH RISK" },
                  { dot: "bg-orange-500", text: "Category mismatch (relief → travel/admin) → FLAG" },
                  { dot: "bg-emerald-500", text: "On-chain purpose tags enforce category locks" },
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
              { label: "Total Txns", value: simReliefData.length, sub: "synthetic dataset", color: "text-slate-900" },
              { label: "Flagged", value: flaggedCount, sub: `of ${simReliefData.length} total`, color: "text-red-600" },
              { label: "Total Diverted", value: fmt(totalDiverted), sub: "misallocated funds", color: "text-red-600" },
              { label: "Avg Flagged Ratio", value: `${avgFlaggedRatio}%`, sub: "admin overhead", color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 border border-zinc-200 rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase">Filter:</span>
            {[
              { k: "all", label: `All (${simReliefData.length})` },
              { k: "flagged", label: `Flagged (${flaggedCount})` },
              { k: "clean", label: `Clean (${cleanCount})` },
            ].map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                  filter === k
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-amber-300"
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
                  <tr className="bg-amber-50 border-b border-amber-100">
                    {["Status", "Date", "NGO / Project", "Purpose Tag", "Category", "Amount", "Admin Ratio", "Vendor", "Details"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-amber-700 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((tx) => {
                    const isBad = tx.flagged;
                    const isExp = expandedRow === tx.id;
                    return (
                      <React.Fragment key={tx.id}>
                        <tr
                          className={`border-b border-zinc-100 hover:bg-amber-50/40 transition-colors cursor-pointer ${isExp ? "bg-amber-50/60" : ""}`}
                          onClick={() => setExpandedRow(isExp ? null : tx.id)}
                        >
                          <td className="px-4 py-3">
                            {isBad ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-red-600 text-white border border-red-600">
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
                            <div className="font-semibold text-slate-900 text-sm">{tx.projectName}</div>
                            <div className="text-xs text-zinc-500">{tx.ngoName}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              tx.purpose.startsWith("relief")
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {tx.purpose}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              tx.category === "Relief"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {tx.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">{fmt(tx.amount)}</td>
                          <td className="px-4 py-3"><AdminGauge ratio={tx.adminRatio} /></td>
                          <td className="px-4 py-3 text-sm text-slate-700">{tx.vendor}</td>
                          <td className="px-4 py-3 text-center">
                            <button className="p-1.5 border border-zinc-200 rounded-lg text-zinc-400 hover:text-amber-600 hover:border-amber-300 transition-colors">
                              {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                        </tr>
                        {isExp && (
                          <tr className="bg-amber-50/40">
                            <td colSpan={9} className="p-0">
                              <div className="px-8 py-5 border-t border-amber-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Flag Reasons</div>
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
                                        <CheckCircle2 size={12} /> All checks passed — legitimate relief spend
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">On-Chain Record</div>
                                    <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-2 text-sm">
                                      {[
                                        ["TX ID", tx.id, "font-mono"],
                                        ["Block Hash", tx.blockHash, "font-mono text-xs"],
                                        ["Total Budget", fmt(tx.totalBudget), ""],
                                        ["Admin Spend", fmt(tx.adminSpend), tx.adminRatio > 0.2 ? "text-red-600 font-bold" : ""],
                                        ["Admin Ratio", `${Math.round(tx.adminRatio * 100)}%`, tx.adminRatio > 0.2 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"],
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
