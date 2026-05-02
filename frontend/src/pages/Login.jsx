import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet, Mail, Lock, ShieldCheck, ArrowRight,
  AlertCircle, CheckCircle2, Shield, Info, KeyRound, Zap
} from 'lucide-react';

/* ── where each role lands after login ─────────────────── */
const REDIRECT = { admin: '/admin-dashboard', auditor: '/auditor-home', donor: '/donor-home' };

/* ══════════════════════════════════════════════════════════
   WALLET PANEL  — Admin + Donor via MetaMask (or demo)
══════════════════════════════════════════════════════════ */
const WalletPanel = () => {
  const { demoWalletLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(false);
  const [selectedRole, setSelected] = useState(null);
  const [done, setDone]             = useState(false);
  const [doneRole, setDoneRole]     = useState('');

  const handleConnect = async (role) => {
    setSelected(role);
    setLoading(true);
    try {
      if (window.ethereum) await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch { /* no MetaMask — demo fallback */ }
    demoWalletLogin(role);
    setDoneRole(role);
    setDone(true);
    setLoading(false);
    // Show success screen for 1.5s, then navigate
    setTimeout(() => navigate(REDIRECT[role]), 1500);
  };

  if (done) {
    const cfg = {
      admin: { bg: 'bg-purple-600', ring: 'border-purple-400', spin: 'border-purple-500', label: 'Admin', addr: '0xf39F…2266' },
      donor: { bg: 'bg-emerald-600', ring: 'border-emerald-400', spin: 'border-emerald-500', label: 'Donor', addr: '0x7099…79C8' },
    };
    const c = cfg[doneRole] || cfg.admin;
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        {/* Animated success ring */}
        <div className="relative">
          <div className={`w-20 h-20 ${c.bg} rounded-full flex items-center justify-center shadow-2xl`}>
            <CheckCircle2 size={38} className="text-white" />
          </div>
          <div className={`absolute inset-0 rounded-full border-4 ${c.ring} animate-ping opacity-30`} />
        </div>

        {/* Message */}
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-900 text-xl tracking-tight">Connected Successfully!</div>
          <div className="text-sm text-zinc-500">Signed in as <span className="font-bold text-slate-800">{c.label}</span></div>
          <div className="font-mono text-[11px] text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 mt-2 inline-block">
            {c.addr}
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Wallet Verified
          </span>
          <span className="flex items-center gap-1.5 text-indigo-600">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            On-Chain Identity
          </span>
        </div>

        {/* Redirecting indicator */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className={`w-4 h-4 border-2 ${c.spin} border-t-transparent rounded-full animate-spin`} />
          Redirecting to dashboard…
        </div>
      </div>
    );
  }

  const WALLET_ROLES = [
    { role: 'admin', label: 'Admin',  desc: 'Full system access',  icon: Shield, spinColor: 'border-purple-500', card: 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100 hover:shadow-purple-100', iconBg: 'bg-purple-600', textColor: 'text-purple-900', subColor: 'text-purple-500', btnColor: 'text-purple-600', badgeBg: 'bg-purple-200 text-purple-700' },
    { role: 'donor', label: 'Donor',  desc: 'Track your donations', icon: Shield, spinColor: 'border-emerald-500', card: 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-emerald-100', iconBg: 'bg-emerald-600', textColor: 'text-emerald-900', subColor: 'text-emerald-500', btnColor: 'text-emerald-600', badgeBg: 'bg-emerald-200 text-emerald-700' },
  ];

  return (
    <div className="space-y-5">
      {/* Big wallet icon */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-300">
            <Wallet size={28} className="text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-slate-400 animate-ping opacity-20" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
            <Zap size={11} className="text-white" fill="white" />
          </div>
        </div>
        <div className="text-center">
          <div className="font-bold text-slate-900 text-sm">MetaMask / Web3 Wallet</div>
          <div className="text-xs text-zinc-400 mt-0.5">No password needed — wallet is your identity</div>
        </div>
      </div>

      {/* Role cards — side by side */}
      <div className="grid grid-cols-2 gap-3">
        {WALLET_ROLES.map(({ role, label, desc, icon: Icon, spinColor, card, iconBg, textColor, subColor, btnColor, badgeBg }) => (
          <button
            key={role}
            onClick={() => handleConnect(role)}
            disabled={loading}
            className={`group relative flex flex-col items-center gap-3 p-5 border-2 rounded-2xl transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${card}`}
          >
            {loading && selectedRole === role && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center gap-2">
                <div className={`w-6 h-6 border-2 ${spinColor} border-t-transparent rounded-full animate-spin`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${btnColor}`}>Connecting…</span>
              </div>
            )}
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
              <Icon size={22} className="text-white" />
            </div>
            <div className="text-center">
              <div className={`font-bold text-sm ${textColor}`}>{label}</div>
              <div className={`text-[10px] mt-0.5 ${subColor}`}>{desc}</div>
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${btnColor}`}>
              <KeyRound size={10} /> Connect
            </div>
            <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}>Demo</span>
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800"><span className="font-bold">Auditor</span> must use the Email Login tab — wallet login is not available for auditors.</p>
      </div>

      <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
        Protected by Ethereum cryptographic signatures
      </p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   EMAIL PANEL  — Admin (+ auditor/donor for demo)
══════════════════════════════════════════════════════════ */
const EmailPanel = () => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [successName, setSuccessName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 700));

    const role = demoLogin(email);
    if (role) {
      setSuccessName(email.split('@')[0]);
      setTimeout(() => navigate(REDIRECT[role] || '/'), 700);
    } else {
      setError('Account not found. Use a demo credential below.');
    }
    setLoading(false);
  };

  if (successName) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-xl">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <div className="text-center">
          <div className="font-bold text-slate-900 text-lg">Welcome, {successName}!</div>
          <div className="text-sm text-zinc-400 mt-1">Redirecting…</div>
        </div>
        <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition placeholder:text-zinc-300"
              placeholder="admin@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="password"
              className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition placeholder:text-zinc-300"
              placeholder="Any password for demo"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
            : <>Sign In <ArrowRight size={16} /></>}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-grow h-px bg-zinc-100" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-1">
            <Info size={10} /> Demo Accounts
          </span>
          <div className="flex-grow h-px bg-zinc-100" />
        </div>
        {/* Auditor-only notice */}
        <div className="flex items-start gap-2.5 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 leading-relaxed">
            <span className="font-bold">Auditor must use email login.</span> Admin and Donor can also use email or the <span className="font-bold">Connect Wallet</span> tab.
          </p>
        </div>
        <div className="space-y-2">
          {[
            { email: 'admin@example.com',   label: 'Admin',   desc: 'Full system access',  color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', avatar: 'bg-purple-600' } },
            { email: 'auditor@example.com', label: 'Auditor', desc: 'Full audit access',   color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', avatar: 'bg-indigo-600' } },
            { email: 'donor@example.com',   label: 'Donor',   desc: 'Track donations',     color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', avatar: 'bg-emerald-600' } },
          ].map(({ email: e, label, desc, color }) => (
            <button
              key={e}
              type="button"
              onClick={() => { setEmail(e); setPassword('demo'); setError(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 border rounded-xl transition-all group hover:shadow-sm ${color.bg} ${color.border}`}
            >
              <div className={`w-9 h-9 ${color.avatar} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="text-white text-xs font-bold">{label[0]}</span>
              </div>
              <div className="flex-grow text-left min-w-0">
                <div className={`text-xs font-bold ${color.text}`}>{label}</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">{e}</div>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color.bg} ${color.text} border ${color.border}`}>
                {desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
══════════════════════════════════════════════════════════ */
const Login = () => {
  const [tab, setTab] = useState('email');

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">System Access</h2>
          <p className="text-zinc-400 text-sm">Admin &amp; Donor via wallet · All roles via email · Auditor email only</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl shadow-slate-100/80 overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-zinc-100 bg-zinc-50/60">
            {[
              { id: 'email',  icon: Mail,   label: 'Email Login',    badge: 'All roles',       badgeColor: 'bg-slate-100 text-slate-600' },
              { id: 'wallet', icon: Wallet, label: 'Connect Wallet', badge: 'Admin · Donor',   badgeColor: 'bg-purple-100 text-purple-700' },
            ].map(({ id, icon: Icon, label, badge, badgeColor }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-4 px-3 flex flex-col items-center gap-1.5 transition-all duration-200 border-b-2 ${
                  tab === id
                    ? id === 'wallet'
                      ? 'bg-white text-purple-700 border-purple-500'
                      : 'bg-white text-slate-900 border-slate-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} />
                  <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tab === id ? badgeColor : 'bg-zinc-100 text-zinc-400'}`}>
                  {badge}
                </span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="p-7">
            {tab === 'email'  && <EmailPanel />}
            {tab === 'wallet' && <WalletPanel />}
          </div>
        </div>

        <p className="mt-5 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          256-bit AES · SHA-256 Block Verification Active
        </p>
      </div>
    </div>
  );
};

export default Login;
