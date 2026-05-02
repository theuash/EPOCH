import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, LogOut, ShieldAlert, LayoutDashboard, Globe2, Layers, Users, Eye, Receipt, Home } from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'kn' : 'en');
  const handleLogout   = () => { logout(); navigate('/'); };

  const isAdmin   = user?.role === 'admin';
  const isAuditor = user?.role === 'auditor';
  const isDonor   = user?.role === 'donor';
  const isPublic  = !user; // not logged in

  const accentColor = isAuditor ? 'indigo' : isDonor ? 'emerald' : 'purple';
  const accentMap   = {
    indigo:  'text-indigo-600 border-b-2 border-indigo-500 pb-0.5',
    emerald: 'text-emerald-600 border-b-2 border-emerald-500 pb-0.5',
    purple:  'text-purple-600 border-b-2 border-purple-500 pb-0.5',
  };
  const badgeMap = {
    indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple:  'bg-purple-50 text-purple-700 border-purple-200',
  };
  const logoMap = {
    indigo:  'bg-indigo-600 shadow-indigo-200',
    emerald: 'bg-emerald-600 shadow-emerald-200',
    purple:  'bg-purple-600 shadow-purple-200',
  };

  // active link highlight — slate for public, role-colour for logged-in
  const active = (paths) => {
    const arr = Array.isArray(paths) ? paths : [paths];
    if (!arr.includes(location.pathname)) return 'hover:text-slate-900 transition-colors';
    return isPublic
      ? 'text-slate-900 border-b-2 border-slate-800 pb-0.5'
      : accentMap[accentColor];
  };

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-zinc-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group shrink-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow ${isPublic ? 'bg-slate-800 shadow-slate-200' : logoMap[accentColor]}`}>
            <ShieldAlert size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Secure Node<span className={isPublic ? 'text-slate-500' : `text-${accentColor}-600`}>.</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">

          {/* ── PUBLIC nav (not logged in) ── */}
          {isPublic && (
            <div className="hidden md:flex items-center gap-1 text-xs font-bold text-zinc-500 uppercase tracking-widest mr-2">
              <Link to="/" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/')}`}>
                <Home size={13} /> Home
              </Link>
              <Link to="/public-dashboard" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/public-dashboard')}`}>
                <Globe2 size={13} /> Public View
              </Link>
              <Link to="/ngo-spend-public" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/ngo-spend-public')}`}>
                <Layers size={13} /> NGO Spend
              </Link>
              <Link to="/login" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/login')}`}>
                <ShieldAlert size={13} /> Login
              </Link>
            </div>
          )}

          {/* ── ADMIN nav ── */}
          {isAdmin && (
            <div className="hidden md:flex items-center gap-1 text-xs font-bold text-zinc-500 uppercase tracking-widest mr-2">
              <Link to="/admin-dashboard" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/admin-dashboard')}`}>
                <LayoutDashboard size={13} /> Dashboard
              </Link>
            </div>
          )}

          {/* ── AUDITOR nav ── */}
          {isAuditor && (
            <div className="hidden md:flex items-center gap-1 text-xs font-bold text-zinc-500 uppercase tracking-widest mr-2">
              <Link to="/auditor-home" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/auditor-home')}`}>
                <LayoutDashboard size={13} /> Home
              </Link>
              <Link to="/auditor-ngo" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/auditor-ngo')}`}>
                <Layers size={13} /> NGO Spend
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-bold rounded-full normal-case tracking-normal">Extended</span>
              </Link>
              <Link to="/auditor-public" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/auditor-public')}`}>
                <Globe2 size={13} /> Public View
              </Link>
              <Link to="/donor-history" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/donor-history')}`}>
                <Users size={13} /> Donor History
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-bold rounded-full normal-case tracking-normal">Auditor</span>
              </Link>
            </div>
          )}

          {/* ── DONOR nav ── */}
          {isDonor && (
            <div className="hidden md:flex items-center gap-1 text-xs font-bold text-zinc-500 uppercase tracking-widest mr-2">
              <Link to="/donor-home" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/donor-home')}`}>
                <LayoutDashboard size={13} /> Home
              </Link>
              <Link to="/donor-ngo" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/donor-ngo')}`}>
                <Layers size={13} /> NGO Spend
              </Link>
              <Link to="/donor-public" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/donor-public')}`}>
                <Globe2 size={13} /> Public View
              </Link>
              <Link to="/my-transactions" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${active('/my-transactions')}`}>
                <Receipt size={13} /> My Transactions
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-bold rounded-full normal-case tracking-normal">Donor</span>
              </Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3 pl-4 ml-1 border-l border-zinc-200 h-8">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 transition-colors text-[10px] font-bold text-black border border-zinc-200 rounded-lg"
            >
              <Globe size={11} /> {i18n.language === 'en' ? 'ಕನ್ನಡ' : 'EN'}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeMap[accentColor]}`}>
                  {isAuditor && <Eye size={11} />}
                  {isDonor   && <Receipt size={11} />}
                  {isAdmin   && <ShieldAlert size={11} />}
                  {user.role}
                  {user.name && <span className="opacity-60 normal-case font-normal">· {user.name.split(' ')[0]}</span>}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  <LogOut size={13} /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
