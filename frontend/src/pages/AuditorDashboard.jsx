import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle,
  Clock, Search, ChevronDown, ChevronUp, MessageSquare, Send,
  ThumbsUp, ThumbsDown, RefreshCw, Eye, TrendingUp, Users,
  FileWarning, Ban, Activity, Building2, Filter
} from "lucide-react";

const API = "/api/ngo-transactions";

/* ── helpers ─────────────────────────────────────────────── */
const fmt = n =>
  n >= 1e7 ? "₹" + (n/1e7).toFixed(2) + " Cr"
  : n >= 1e5 ? "₹" + (n/1e5).toFixed(1) + " L"
  : "₹" + Number(n).toLocaleString("en-IN");

const fmtDate = ts =>
  new Date(ts * 1000).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

const fmtDateTime = d =>
  new Date(d).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });

const getSev = ratio => {
  if (ratio >= 10) return { label:"CRITICAL", cls:"bg-red-600 text-white" };
  if (ratio >= 5)  return { label:"HIGH",     cls:"bg-rose-500 text-white" };
  if (ratio >= 3)  return { label:"MEDIUM",   cls:"bg-amber-500 text-white" };
  return               { label:"LOW",      cls:"bg-yellow-400 text-black" };
};

const auditBadge = status => ({
  pending:  { cls:"bg-amber-100 text-amber-700 border-amber-200",  label:"Pending Review" },
  approved: { cls:"bg-emerald-100 text-emerald-700 border-emerald-200", label:"Approved" },
  rejected: { cls:"bg-rose-100 text-rose-700 border-rose-200",    label:"Rejected" },
}[status] || { cls:"bg-zinc-100 text-zinc-600 border-zinc-200", label:"Unknown" });

/* ── Stat card ───────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon:Icon, color, bg, border }) => (
  <div className={`bg-white border ${border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
        <Icon size={15} className={color} />
      </div>
    </div>
    <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
    {sub && <div className="text-xs text-zinc-400 mt-1">{sub}</div>}
  </div>
);

/* ── Inquiry thread component ────────────────────────────── */
const InquiryThread = ({ tx, onInquirySent, auditorName }) => {
  const [question, setQuestion] = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");

  const handleSend = async () => {
    if (question.trim().length < 5) { setError("Question must be at least 5 characters."); return; }
    setSending(true); setError("");
    try {
      await axios.post(`${API}/${tx.txId}/inquire`, { question: question.trim(), askedBy: auditorName });
      setQuestion("");
      onInquirySent();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to send question.");
    } finally { setSending(false); }
  };

  const inquiries = tx.inquiries || [];

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
        <MessageSquare size={12} /> Inquiry Thread — {inquiries.length} question{inquiries.length !== 1 ? "s" : ""}
      </div>

      {/* Existing questions */}
      {inquiries.length > 0 ? (
        <div className="space-y-3">
          {inquiries.map((q, i) => (
            <div key={i} className="bg-white border border-indigo-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Eye size={13} className="text-white" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-700">{q.askedBy}</span>
                    <span className="text-[10px] text-zinc-400">{fmtDateTime(q.askedAt)}</span>
                    <span className={`ml-auto text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${q.status === "answered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {q.status === "answered" ? "Answered" : "Open"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium">{q.question}</p>
                  {q.answer && (
                    <div className="mt-2 pl-3 border-l-2 border-emerald-300">
                      <div className="text-[10px] text-zinc-400 mb-0.5">NGO Response · {fmtDateTime(q.answeredAt)}</div>
                      <p className="text-sm text-emerald-800">{q.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-zinc-400 italic px-1">No questions raised yet for this transaction.</div>
      )}

      {/* New question input */}
      <div className="flex gap-2">
        <div className="flex-grow relative">
          <textarea
            rows={2}
            className="w-full px-4 py-3 border border-indigo-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition resize-none placeholder:text-zinc-300"
            placeholder={`Ask ${tx.ngoName} a question about this transaction…`}
            value={question}
            onChange={e => { setQuestion(e.target.value); setError(""); }}
          />
          {error && <p className="text-[10px] text-rose-600 mt-1">{error}</p>}
        </div>
        <button
          onClick={handleSend}
          disabled={sending || question.trim().length < 5}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-start mt-0 shrink-0"
        >
          {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={13} />}
          Send
        </button>
      </div>
    </div>
  );
};

/* ── Transaction review row ──────────────────────────────── */
const ReviewRow = ({ tx, onRefresh, auditorName }) => {
  const [expanded, setExpanded]   = useState(false);
  const [activePanel, setPanel]   = useState("details"); // details | inquire
  const [auditNote, setAuditNote] = useState("");
  const [acting, setActing]       = useState(false);
  const [actionDone, setActionDone] = useState(null);

  const sev    = getSev(tx.overspendRatio);
  const badge  = auditBadge(tx.auditStatus || "pending");

  const handleAudit = async (action) => {
    if (acting) return;
    setActing(true);
    try {
      await axios.patch(`${API}/${tx.txId}/audit`, { action, note: auditNote, auditorName });
      setActionDone(action);
      setTimeout(() => { onRefresh(); setActionDone(null); }, 1200);
    } catch (e) {
      alert(e.response?.data?.error || "Action failed");
    } finally { setActing(false); }
  };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
      tx.flagged ? "border-rose-200" : "border-zinc-200"
    } ${expanded ? "shadow-md" : "hover:shadow-md"}`}>

      {/* Row header */}
      <button
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-50/60 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Status badges */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {tx.flagged && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${sev.cls}`}>
              <XCircle size={9} /> {sev.label}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Project info */}
        <div className="flex-grow min-w-0">
          <div className="font-bold text-sm text-slate-900 truncate">{tx.projectName}</div>
          <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
            <Building2 size={11} /> {tx.ngoName}
            <span className="text-zinc-300">·</span>
            <Clock size={11} /> {fmtDate(tx.timestamp)}
          </div>
        </div>

        {/* Amount + milestone */}
        <div className="hidden md:flex items-center gap-6 shrink-0 text-right">
          <div>
            <div className="text-xs text-zinc-400">Amount</div>
            <div className="font-mono font-bold text-sm text-slate-900">{fmt(tx.amount)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Milestone</div>
            <div className={`text-xs font-bold ${tx.milestoneApproved ? "text-emerald-600" : "text-rose-500"}`}>
              {tx.milestoneApproved ? "✓ Approved" : "✕ Missing"}
            </div>
          </div>
          {(tx.inquiries || []).length > 0 && (
            <div className="flex items-center gap-1 text-indigo-500 text-xs font-bold">
              <MessageSquare size={13} /> {tx.inquiries.length}
            </div>
          )}
        </div>

        <div className={`p-2 rounded-lg border shrink-0 transition-colors ${expanded ? "border-indigo-300 bg-indigo-50 text-indigo-600" : "border-zinc-200 text-zinc-400"}`}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-zinc-100">
          {/* Panel tabs */}
          <div className="flex border-b border-zinc-100 bg-zinc-50/50">
            {[["details","Transaction Details"],["inquire","Raise Inquiry"]].map(([id, label]) => (
              <button key={id} onClick={() => setPanel(id)}
                className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activePanel === id
                    ? "text-indigo-700 border-indigo-500 bg-white"
                    : "text-zinc-400 border-transparent hover:text-zinc-700"
                }`}>
                {id === "inquire" && <MessageSquare size={12} className="inline mr-1.5" />}
                {label}
                {id === "inquire" && (tx.inquiries||[]).length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-[9px] font-bold">
                    {tx.inquiries.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── DETAILS PANEL ── */}
            {activePanel === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: flag reasons + on-chain */}
                <div className="space-y-4">
                  {tx.flagged && tx.flagReasons?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={11} /> Flag Reasons
                      </div>
                      <div className="space-y-2">
                        {tx.flagReasons.map((r, i) => (
                          <div key={i} className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                            <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-rose-800">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2.5 overflow-hidden">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">On-Chain Record</div>
                    {[
                      ["TX ID",        tx.txId,                                                "font-mono text-xs text-cyan-300"],
                      ["Block Hash",   tx.blockHash,                                           "font-mono text-xs break-all text-slate-300"],
                      ["Payment Ref",  tx.paymentTxId || "—",                                 "font-mono text-xs text-slate-300"],
                      ["Overspend",    tx.overspendRatio + "x",                               tx.overspendRatio >= 3 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"],
                      ["Vendor Conc.", tx.vendorRepeatPct + "%",                              tx.vendorRepeatPct > 80 ? "text-rose-400 font-bold" : "text-slate-300"],
                      ["Description",  tx.description,                                        "text-slate-300"],
                    ].map(([k, v, cls]) => (
                      <div key={k} className="min-w-0">
                        <span className="text-[10px] text-slate-500 block">{k}</span>
                        <span className={`text-sm block ${cls}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: audit action */}
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Current Audit Status</div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${badge.cls}`}>
                      {tx.auditStatus === "approved" && <CheckCircle2 size={15} />}
                      {tx.auditStatus === "rejected" && <XCircle size={15} />}
                      {(!tx.auditStatus || tx.auditStatus === "pending") && <Clock size={15} />}
                      {badge.label}
                    </div>
                    {tx.auditNote && (
                      <div className="mt-2 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-700 italic">
                        "{tx.auditNote}"
                      </div>
                    )}
                    {tx.auditedAt && (
                      <div className="text-[10px] text-zinc-400 mt-1">
                        Reviewed by {tx.auditedBy} on {fmtDateTime(tx.auditedAt)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                      Audit Note (optional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition resize-none placeholder:text-zinc-300"
                      placeholder="Add a note explaining your decision…"
                      value={auditNote}
                      onChange={e => setAuditNote(e.target.value)}
                    />
                  </div>

                  {/* Action buttons */}
                  {actionDone ? (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${actionDone === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                      <CheckCircle2 size={16} />
                      {actionDone === "approved" ? "Milestone Approved!" : "Milestone Rejected!"} Refreshing…
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAudit("approved")}
                        disabled={acting}
                        className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-emerald-100"
                      >
                        {acting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ThumbsUp size={15} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAudit("rejected")}
                        disabled={acting}
                        className="flex items-center justify-center gap-2 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-rose-100"
                      >
                        {acting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ThumbsDown size={15} />}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── INQUIRY PANEL ── */}
            {activePanel === "inquire" && (
              <InquiryThread tx={tx} onInquirySent={onRefresh} auditorName={auditorName} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};


/* ── NGO Inquiry Card (per-NGO summary + question all txns) ── */
const NgoInquiryCard = ({ ngo, onRefresh, auditorName }) => {
  const [expanded, setExpanded] = useState(false);
  const [selTx, setSelTx]       = useState(null);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <button className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-slate-50/60 transition-colors" onClick={() => setExpanded(v => !v)}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${ngo.flaggedCount > 0 ? "bg-rose-500" : "bg-indigo-500"}`}>
          {ngo.ngoName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div className="flex-grow min-w-0">
          <div className="font-bold text-slate-900 text-sm">{ngo.ngoName}</div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {ngo.txCount} transaction{ngo.txCount !== 1 ? "s" : ""} · {ngo.flaggedCount} flagged · {ngo.openQuestions} open question{ngo.openQuestions !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {ngo.flaggedCount > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase border border-rose-200">
              <ShieldAlert size={10} /> {ngo.flaggedCount} flagged
            </span>
          )}
          {ngo.openQuestions > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase border border-amber-200">
              <MessageSquare size={10} /> {ngo.openQuestions} open
            </span>
          )}
        </div>
        <div className={`p-2 rounded-lg border shrink-0 ${expanded ? "border-indigo-300 bg-indigo-50 text-indigo-600" : "border-zinc-200 text-zinc-400"}`}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 p-6 space-y-4">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Select a transaction to raise a question:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ngo.txns.map(tx => (
              <button key={tx.txId} onClick={() => setSelTx(selTx?.txId === tx.txId ? null : tx)}
                className={`flex items-start gap-3 p-4 border rounded-xl text-left transition-all ${
                  selTx?.txId === tx.txId
                    ? "border-indigo-400 bg-indigo-50 shadow-sm"
                    : tx.flagged ? "border-rose-200 bg-rose-50/30 hover:border-rose-300" : "border-zinc-200 hover:border-indigo-200 hover:bg-indigo-50/20"
                }`}>
                <div className="flex-grow min-w-0">
                  <div className="font-semibold text-xs text-slate-900 truncate">{tx.projectName}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">{tx.txId}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-xs font-bold text-slate-700">{fmt(tx.amount)}</span>
                    {tx.flagged && <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full">Flagged</span>}
                    {(tx.inquiries||[]).length > 0 && (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <MessageSquare size={8} /> {tx.inquiries.length}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selTx && (
            <div className="mt-4 p-5 bg-indigo-50/50 border border-indigo-200 rounded-2xl">
              <div className="text-xs font-bold text-indigo-700 mb-3">
                Raising inquiry on: <span className="font-mono">{selTx.txId}</span> — {selTx.projectName}
              </div>
              <InquiryThread tx={selTx} onInquirySent={() => { onRefresh(); setSelTx(null); }} auditorName={auditorName} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
/* ── Main AuditorDashboard ───────────────────────────────── */
const AuditorDashboard = () => {
  const { user } = useAuth();
  const [txns, setTxns]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [ngoFilter, setNgoFilter] = useState("All");
  const [statusFilter, setStatus] = useState("all"); // all | pending | approved | rejected | flagged
  const [tab, setTab]             = useState("review"); // review | ngo-questions

  const auditorName = user?.name || "Auditor";

  const fetchTxns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { timeout: 5000 });
      setTxns(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTxns([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTxns(); }, []);

  const allNgos = useMemo(() => ["All", ...new Set(txns.map(t => t.ngoName))], [txns]);

  const filtered = useMemo(() => {
    let list = txns;
    if (ngoFilter !== "All") list = list.filter(t => t.ngoName === ngoFilter);
    if (statusFilter === "flagged")  list = list.filter(t => t.flagged);
    if (statusFilter === "pending")  list = list.filter(t => (t.auditStatus || "pending") === "pending");
    if (statusFilter === "approved") list = list.filter(t => t.auditStatus === "approved");
    if (statusFilter === "rejected") list = list.filter(t => t.auditStatus === "rejected");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.projectName.toLowerCase().includes(q) ||
        t.ngoName.toLowerCase().includes(q) ||
        t.txId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [txns, ngoFilter, statusFilter, search]);

  // NGO summary for the "NGO Questions" tab
  const ngoSummary = useMemo(() => {
    const map = {};
    txns.forEach(tx => {
      if (!map[tx.ngoName]) map[tx.ngoName] = { ngoName: tx.ngoName, txCount: 0, flaggedCount: 0, openQuestions: 0, txns: [] };
      map[tx.ngoName].txCount++;
      if (tx.flagged) map[tx.ngoName].flaggedCount++;
      map[tx.ngoName].openQuestions += (tx.inquiries || []).filter(q => q.status === "open").length;
      map[tx.ngoName].txns.push(tx);
    });
    return Object.values(map).sort((a, b) => b.flaggedCount - a.flaggedCount);
  }, [txns]);

  const pendingCount  = txns.filter(t => (t.auditStatus || "pending") === "pending").length;
  const approvedCount = txns.filter(t => t.auditStatus === "approved").length;
  const rejectedCount = txns.filter(t => t.auditStatus === "rejected").length;
  const flaggedCount  = txns.filter(t => t.flagged).length;
  const openQCount    = txns.reduce((s, t) => s + (t.inquiries || []).filter(q => q.status === "open").length, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* Page header */}
      <div className="bg-white border-b border-zinc-200 px-6 md:px-10 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Eye size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Auditor Dashboard</h1>
              <p className="text-slate-400 text-sm font-light">Review milestones · Approve or reject · Question NGOs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold uppercase tracking-widest">
              <Eye size={13} /> {auditorName}
            </div>
            <button onClick={fetchTxns} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition-colors">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label:"Pending Review",  value:pendingCount,  icon:Clock,         color:"text-amber-600",   bg:"bg-amber-50",   border:"border-amber-100" },
            { label:"Approved",        value:approvedCount, icon:CheckCircle2,  color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
            { label:"Rejected",        value:rejectedCount, icon:XCircle,       color:"text-rose-600",    bg:"bg-rose-50",    border:"border-rose-100" },
            { label:"Flagged Txns",    value:flaggedCount,  icon:ShieldAlert,   color:"text-rose-600",    bg:"bg-rose-50",    border:"border-rose-100" },
            { label:"Open Questions",  value:openQCount,    icon:MessageSquare, color:"text-indigo-600",  bg:"bg-indigo-50",  border:"border-indigo-100" },
          ].map(p => <StatCard key={p.label} {...p} />)}
        </div>

        {/* Main tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-zinc-200 rounded-2xl w-fit shadow-sm">
          {[
            { id:"review",        label:"Transaction Review",  count: pendingCount },
            { id:"ngo-questions", label:"NGO Inquiries",       count: openQCount },
          ].map(({ id, label, count }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                tab === id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-zinc-500 hover:text-indigo-700 hover:bg-indigo-50"
              }`}>
              {label}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tab === id ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TRANSACTION REVIEW TAB ── */}
        {tab === "review" && (
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input type="text" className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" placeholder="Search by project, NGO, or TX ID…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[["all","All"],["pending","Pending"],["approved","Approved"],["rejected","Rejected"],["flagged","Flagged"]].map(([v, label]) => (
                  <button key={v} onClick={() => setStatus(v)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                      statusFilter === v
                        ? v === "flagged" ? "bg-rose-600 text-white border-rose-600"
                          : v === "approved" ? "bg-emerald-600 text-white border-emerald-600"
                          : v === "rejected" ? "bg-rose-500 text-white border-rose-500"
                          : v === "pending" ? "bg-amber-500 text-white border-amber-500"
                          : "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-zinc-500 border-zinc-200 hover:border-indigo-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* NGO filter pills */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1"><Building2 size={12} /> NGO:</span>
              {allNgos.slice(0, 8).map(n => (
                <button key={n} onClick={() => setNgoFilter(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${ngoFilter === n ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-500 border-zinc-200 hover:border-indigo-300"}`}>
                  {n}
                </button>
              ))}
            </div>

            {/* Transaction rows */}
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-zinc-400">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Loading transactions…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Eye size={36} className="mx-auto text-zinc-200 mb-3" strokeWidth={1} />
                <p className="text-zinc-400 text-sm">No transactions match your filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(tx => (
                  <ReviewRow key={tx.txId} tx={tx} onRefresh={fetchTxns} auditorName={auditorName} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NGO INQUIRIES TAB ── */}
        {tab === "ngo-questions" && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 px-5 py-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
              <MessageSquare size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-800">
                <span className="font-bold">NGO Inquiry Power:</span> As auditor, you can raise questions on any transaction. Questions are logged on-chain and the NGO is notified to respond. Open questions block milestone approval.
              </div>
            </div>

            {ngoSummary.map(ngo => (
              <NgoInquiryCard key={ngo.ngoName} ngo={ngo} onRefresh={fetchTxns} auditorName={auditorName} />
            ))}

            {ngoSummary.length === 0 && (
              <div className="py-16 text-center">
                <Building2 size={36} className="mx-auto text-zinc-200 mb-3" strokeWidth={1} />
                <p className="text-zinc-400 text-sm">No NGOs found.</p>
              </div>
            )}
          </div>
        )}

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

export default AuditorDashboard;

