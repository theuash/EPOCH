import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LayoutDashboard, FolderOpen, Plus, Upload, CheckCircle2,
  AlertTriangle, XCircle, Hash, Calendar, Tag, DollarSign,
  User, MapPin, FileText, ChevronDown, ChevronUp, Loader2,
  ShieldCheck, ShieldAlert, Clock, TrendingUp, Activity,
  Package, Milestone, Camera, List, ArrowRight, RefreshCw
} from "lucide-react";

const API = "/api/ngo-transactions";

/* ── helpers ─────────────────────────────────────────────── */
const fmt = n =>
  n >= 1e7 ? "₹" + (n/1e7).toFixed(2) + " Cr"
  : n >= 1e5 ? "₹" + (n/1e5).toFixed(1) + " L"
  : "₹" + Number(n).toLocaleString("en-IN");

const fmtDate = ts =>
  new Date(ts * 1000).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

const getSev = ratio => {
  if (ratio >= 10) return { label:"CRITICAL", cls:"bg-red-600 text-white" };
  if (ratio >= 5)  return { label:"HIGH",     cls:"bg-rose-500 text-white" };
  if (ratio >= 3)  return { label:"MEDIUM",   cls:"bg-amber-500 text-white" };
  return               { label:"LOW",      cls:"bg-yellow-400 text-black" };
};

const CATEGORIES = ["Food Distribution","Infrastructure","Healthcare","Education","Training","Energy","Environment","Sanitation","Culture","Legal Aid","Animal Welfare","Disaster Relief","Consulting","Other"];

/* ── MOCK PROJECTS (in real app these come from DB) ─────── */
const MOCK_PROJECTS = [
  { id:"P001", name:"Rural Food Distribution Program", ngoName:"Hope Foundation", deadline:"2026-08-31", category:"Food Distribution", budget:500, spent:450 },
  { id:"P002", name:"Clean Water Initiative",          ngoName:"Jal Seva Trust",  deadline:"2026-09-15", category:"Infrastructure",    budget:1500, spent:1200 },
  { id:"P003", name:"Digital Literacy Drive",          ngoName:"TechBridge India",deadline:"2026-07-20", category:"Education",         budget:2500, spent:2200 },
  { id:"P004", name:"Solar Micro-Grid — Bidar",        ngoName:"Prakash Foundation",deadline:"2026-10-01",category:"Energy",           budget:3500, spent:3200 },
  { id:"P005", name:"Women Entrepreneur Seed Fund",    ngoName:"Shakti NGO",      deadline:"2026-06-30", category:"Training",          budget:1200, spent:1100 },
];

/* ══════════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════════ */
const StatsBar = ({ txns }) => {
  const total    = txns.length;
  const flagged  = txns.filter(t => t.flagged).length;
  const clean    = total - flagged;
  const totalAmt = txns.reduce((s,t) => s + t.amount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label:"Total Donations",   value:total,          icon:Activity,    color:"text-indigo-600",  bg:"bg-indigo-50",  border:"border-indigo-100" },
        { label:"Total Amount",      value:fmt(totalAmt),  icon:TrendingUp,  color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
        { label:"Legit Transactions",value:clean,          icon:ShieldCheck, color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-100" },
        { label:"Flagged",           value:flagged,        icon:ShieldAlert, color:flagged>0?"text-rose-600":"text-emerald-600", bg:flagged>0?"bg-rose-50":"bg-emerald-50", border:flagged>0?"border-rose-100":"border-emerald-100" },
      ].map(({ label, value, icon:Icon, color, bg, border }) => (
        <div key={label} className={`bg-white border ${border} rounded-2xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}><Icon size={15} className={color} /></div>
          </div>
          <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PROJECT CARD
══════════════════════════════════════════════════════════ */
const ProjectCard = ({ project, onAddMilestone }) => {
  const pct = Math.min(Math.round((project.spent / project.budget) * 100), 100);
  const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / 86400000);
  const overdue  = daysLeft < 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-grow min-w-0">
          <div className="font-bold text-slate-900 text-sm truncate">{project.name}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{project.ngoName}</div>
        </div>
        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100 shrink-0">{project.category}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <div className="text-zinc-400 mb-0.5">Deadline</div>
          <div className={`font-bold flex items-center gap-1 ${overdue ? "text-rose-600" : daysLeft <= 14 ? "text-amber-600" : "text-slate-700"}`}>
            <Calendar size={11} />
            {new Date(project.deadline).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
            <span className="text-[10px] font-normal">({overdue ? "Overdue" : `${daysLeft}d left`})</span>
          </div>
        </div>
        <div>
          <div className="text-zinc-400 mb-0.5">Budget</div>
          <div className="font-bold text-slate-700">{fmt(project.budget)}/mo</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
          <span>Budget utilisation</span><span className="font-bold">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button
        onClick={() => onAddMilestone(project)}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors"
      >
        <Milestone size={13} /> Add Milestone Transaction
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MILESTONE FORM MODAL
══════════════════════════════════════════════════════════ */
const MilestoneModal = ({ project, onClose, onSuccess }) => {
  const fileRef = useRef(null);
  const [step, setStep]       = useState(1); // 1=details, 2=proof, 3=result
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [files, setFiles]     = useState([]);
  const [form, setForm]       = useState({
    vendorName: "", paymentTxId: "", amount: "",
    avgMonthlyBudget: project.budget.toString(),
    description: "",
    milestoneApproved: true,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files).slice(0, 5);
    setFiles(picked);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const proofFiles = files.map(f => ({ name: f.name, size: f.size }));
      const payload = {
        projectName: project.name,
        ngoName: project.ngoName,
        category: project.category,
        vendorName: form.vendorName,
        vendorAddress: "0x0000000000000000000000000000000000000000",
        paymentTxId: form.paymentTxId,
        amount: Number(form.amount),
        avgMonthlyBudget: Number(form.avgMonthlyBudget),
        vendorRepeatPct: 0,
        description: form.description,
        milestoneApproved: form.milestoneApproved,
        proofFiles,
      };
      const res = await axios.post(API, payload);
      setResult(res.data);
      setStep(3);
      // Don't call onSuccess here — call it when modal closes so admin sees the result first
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || err.message });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <div>
            <div className="font-bold text-slate-900 text-lg">Add Milestone Transaction</div>
            <div className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{project.name}</div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors text-xl leading-none">x</button>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center gap-0 px-6 pt-5 pb-2">
            {[["1","Transaction Details"],["2","Proof of Work"]].map(([n, label], i) => (
              <React.Fragment key={n}>
                <div className={`flex items-center gap-2 text-xs font-bold ${step >= Number(n) ? "text-indigo-600" : "text-zinc-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= Number(n) ? "bg-indigo-600 text-white" : "bg-zinc-200 text-zinc-500"}`}>{n}</div>
                  {label}
                </div>
                {i === 0 && <div className="flex-grow h-px bg-zinc-200 mx-3" />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="px-6 py-5">

          {/* ── STEP 1: Transaction Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Transaction ID</label>
                  <div className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 text-xs font-mono text-zinc-400">Auto-generated on submit</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Date</label>
                  <div className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 text-xs text-zinc-400">{new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Vendor Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                  <input type="text" className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" placeholder="Vendor / Supplier name" value={form.vendorName} onChange={e => set("vendorName", e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Payment Transaction ID *</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                  <input type="text" className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" placeholder="e.g. UPI/NEFT/RTGS/Cheque ref no." value={form.paymentTxId} onChange={e => set("paymentTxId", e.target.value)} required />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">UPI reference, NEFT/RTGS UTR, cheque number, or any payment tracking ID.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Amount (₹) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input type="number" min="1" className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" placeholder="0" value={form.amount} onChange={e => set("amount", e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Avg Monthly Budget</label>
                  <input type="number" min="1" className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" value={form.avgMonthlyBudget} onChange={e => set("avgMonthlyBudget", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description *</label>
                <textarea rows={3} className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition resize-none" placeholder="Describe the work done, deliverables, beneficiaries…" value={form.description} onChange={e => set("description", e.target.value)} required />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-zinc-200 rounded-xl">
                <input type="checkbox" id="milestone" className="w-4 h-4 accent-indigo-600" checked={form.milestoneApproved} onChange={e => set("milestoneApproved", e.target.checked)} />
                <label htmlFor="milestone" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Milestone Approved — I confirm this milestone has been reviewed and approved
                </label>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.vendorName || !form.amount || !form.description || !form.paymentTxId}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Attach Proof of Work <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Proof of Work ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">Attach geo-tagged photos, equipment lists, beneficiary records, or any supporting documents. These are hashed and stored on-chain as proof.</p>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <Camera size={32} className="mx-auto text-zinc-300 mb-3" />
                <div className="font-bold text-slate-700 text-sm mb-1">Click to upload proof files</div>
                <div className="text-xs text-zinc-400">Geo-tagged images, equipment lists, beneficiary records (max 5 files)</div>
                <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.xlsx,.csv" className="hidden" onChange={handleFiles} />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{files.length} file{files.length > 1 ? "s" : ""} selected</div>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <FileText size={14} className="text-emerald-600 shrink-0" />
                      <div className="flex-grow min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{f.name}</div>
                        <div className="text-[10px] text-zinc-400">{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep(1)} className="py-3 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : <><Hash size={15} /> Generate Hash & Submit</>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Result ── */}
          {step === 3 && result && (
            <div className="space-y-5">

              {/* Big verification verdict */}
              <div className={`rounded-2xl border-2 overflow-hidden ${result.flagged ? "border-rose-300" : "border-emerald-300"}`}>
                {/* Verdict header */}
                <div className={`flex items-center gap-4 px-6 py-5 ${result.flagged ? "bg-rose-600" : "bg-emerald-600"}`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    {result.flagged
                      ? <ShieldAlert size={26} className="text-white" />
                      : <ShieldCheck size={26} className="text-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xl tracking-tight">
                      {result.flagged ? "⚠ Transaction FLAGGED" : "✓ Transaction VERIFIED — Legit"}
                    </div>
                    <div className="text-white/80 text-sm mt-0.5">{result.message}</div>
                  </div>
                </div>

                {/* Verdict body */}
                <div className={`px-6 py-4 ${result.flagged ? "bg-rose-50" : "bg-emerald-50"}`}>
                  {result.flagged ? (
                    <div className="space-y-2">
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 text-rose-700`}>
                        Fraud Detection Rules Triggered
                      </div>
                      {result.flagReasons?.map((r, i) => (
                        <div key={i} className="flex items-start gap-2.5 px-4 py-3 bg-white border border-rose-200 rounded-xl">
                          <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-rose-800 font-medium">{r}</span>
                        </div>
                      ))}
                      <div className="mt-3 px-4 py-3 bg-rose-100 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        This transaction has been saved to the database and will appear in the <strong>Flagged</strong> tab of NGO Spend.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { icon: CheckCircle2, text: "Spend within 3× monthly budget threshold", ok: true },
                        { icon: CheckCircle2, text: "Milestone approval confirmed", ok: true },
                        { icon: CheckCircle2, text: "Vendor concentration within limits", ok: true },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2.5 text-sm text-emerald-800">
                          <Icon size={15} className="text-emerald-500 shrink-0" />
                          {text}
                        </div>
                      ))}
                      <div className="mt-3 px-4 py-3 bg-emerald-100 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                        This transaction has been saved to the database and will appear in the <strong>Legit</strong> tab of NGO Spend.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* On-chain record */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Hash size={12} className="text-cyan-400" /> On-Chain Record Generated
                </div>
                {[
                  ["Transaction ID",   result.txId,                                    "font-mono text-cyan-300"],
                  ["SHA-256 Hash",     result.blockHash,                               "font-mono text-xs text-slate-300 break-all"],
                  ["Milestone",        result.milestoneApproved ? "✓ Approved" : "✕ Not Approved", result.milestoneApproved ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"],
                  ["Overspend Ratio",  result.overspendRatio + "x monthly budget",     result.overspendRatio >= 3 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"],
                  ["Verdict",          result.flagged ? "FLAGGED" : "LEGIT",           result.flagged ? "text-rose-400 font-bold uppercase" : "text-emerald-400 font-bold uppercase"],
                ].map(([k, v, cls]) => (
                  <div key={k} className="flex flex-col gap-0.5 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{k}</span>
                    <span className={`text-sm ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
              >
                Done — View in NGO Spend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   DONATIONS TABLE
══════════════════════════════════════════════════════════ */
const DonationsTable = ({ txns, loading }) => {
  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3 text-zinc-400">
      <Loader2 size={20} className="animate-spin" /> Loading donations…
    </div>
  );

  if (txns.length === 0) return (
    <div className="py-16 text-center">
      <Activity size={36} className="mx-auto text-zinc-200 mb-3" strokeWidth={1} />
      <div className="text-zinc-400 text-sm">No donations recorded yet. Submit a milestone transaction to get started.</div>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-zinc-100">
            {["Status","Date","Project / NGO","Vendor","Category","Amount","Milestone",""].map(h => (
              <th key={h} className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {txns.map(tx => {
            const sev = getSev(tx.overspendRatio);
            const isExp = expanded === tx.txId;
            return (
              <React.Fragment key={tx.txId}>
                <tr
                  onClick={() => setExpanded(isExp ? null : tx.txId)}
                  className={`border-b transition-colors cursor-pointer hover:bg-slate-50 ${tx.flagged ? "border-l-4 border-rose-400 bg-rose-50/10" : "border-l-4 border-emerald-400"}`}
                >
                  <td className="px-4 py-3">
                    {tx.flagged
                      ? <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase ${sev.cls}`}><XCircle size={9} /> {sev.label}</span>
                      : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700"><CheckCircle2 size={9} /> Legit</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Clock size={11} className="text-zinc-400" />{fmtDate(tx.timestamp)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-xs text-slate-900 max-w-[160px] truncate">{tx.projectName}</div>
                    <div className="text-[10px] text-zinc-400">{tx.ngoName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">{tx.vendorName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100 whitespace-nowrap">{tx.category}</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900 whitespace-nowrap">{fmt(tx.amount)}</td>
                  <td className="px-4 py-3">
                    {tx.milestoneApproved
                      ? <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold"><CheckCircle2 size={11} /> Approved</span>
                      : <span className="flex items-center gap-1 text-rose-500 text-[10px] font-bold"><XCircle size={11} /> Missing</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`inline-flex p-1.5 rounded-lg border ${isExp ? "border-indigo-300 bg-indigo-50 text-indigo-600" : "border-zinc-200 text-zinc-400"}`}>
                      {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </div>
                  </td>
                </tr>
                {isExp && (
                  <tr className={tx.flagged ? "bg-rose-50/30" : "bg-emerald-50/20"}>
                    <td colSpan={8} className="px-6 py-4 border-b border-zinc-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 overflow-hidden">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">On-Chain Record</div>
                          {[["TX ID", tx.txId, "font-mono text-xs"],["Block Hash", tx.blockHash, "font-mono text-xs break-all"],["Overspend", tx.overspendRatio + "x", "font-bold"],["Payment TX ID", tx.paymentTxId || "—", "font-mono text-xs break-all"],["Description", tx.description, ""]].map(([k,v,cls]) => (
                            <div key={k} className="min-w-0"><span className="text-[10px] text-slate-400 block">{k}</span><span className={`text-slate-200 block ${cls}`}>{v}</span></div>
                          ))}
                        </div>
                        {tx.flagged && tx.flagReasons?.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-2">Flag Reasons</div>
                            <div className="space-y-1.5">
                              {tx.flagReasons.map((r,i) => (
                                <div key={i} className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg">
                                  <AlertTriangle size={12} className="text-rose-500 shrink-0 mt-0.5" />
                                  <span className="text-xs text-rose-800">{r}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
══════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [tab, setTab]           = useState("donations");
  const [txns, setTxns]         = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [modalProject, setModal] = useState(null);

  const fetchTxns = async () => {
    setLoadingTxns(true);
    try {
      const res = await axios.get(API);
      setTxns(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err.message);
      setTxns([]);
    } finally {
      setLoadingTxns(false);
    }
  };

  useEffect(() => { fetchTxns(); }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* Page header */}
      <div className="bg-white border-b border-zinc-200 px-6 md:px-10 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm font-light">Manage donations, projects, and milestone transactions</p>
            </div>
          </div>
          <button onClick={fetchTxns} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">

        {/* Stats */}
        <StatsBar txns={txns} />

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 bg-white border border-zinc-200 rounded-2xl w-fit mb-6 shadow-sm">
          {[
            { id:"donations", icon:Activity,    label:"Donations Received" },
            { id:"projects",  icon:FolderOpen,  label:"Projects" },
          ].map(({ id, icon:Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === id ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-zinc-500 hover:text-purple-700 hover:bg-purple-50"}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Donations tab */}
        {tab === "donations" && (
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">All Donation Transactions</span>
              <span className="text-xs text-zinc-400">{txns.length} records</span>
            </div>
            <DonationsTable txns={txns} loading={loadingTxns} />
          </div>
        )}

        {/* Projects tab */}
        {tab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm font-bold text-slate-700">{MOCK_PROJECTS.length} Active Projects</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {MOCK_PROJECTS.map(p => (
                <ProjectCard key={p.id} project={p} onAddMilestone={setModal} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Milestone modal */}
      {modalProject && (
        <MilestoneModal
          project={modalProject}
          onClose={() => setModal(null)}
          onSuccess={fetchTxns}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
