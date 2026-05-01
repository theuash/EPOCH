import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, LogOut, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'kn' : 'en');
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-[#fafafa] sticky top-0 z-50 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <span className="text-xl font-bold tracking-tight text-black">
            Secure Node.
          </span>
        </Link>

        {/* Links + Actions */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Link to="/" className="hover:text-black transition-colors">{t('nav.home')}</Link>
            <Link to="/public" className="hover:text-black transition-colors">{t('nav.public')}</Link>
            <Link to="/flagged" className="hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-rose-500" />
              {t('nav.flagged')}
            </Link>
            {user?.role === 'admin' && <Link to="/admin" className="hover:text-black transition-colors">{t('nav.admin')}</Link>}
            {user?.role === 'auditor' && <Link to="/auditor" className="hover:text-black transition-colors">{t('nav.auditor')}</Link>}
          </div>

          <div className="flex items-center gap-4 pl-8 border-l border-zinc-200 h-10">
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 transition-colors text-xs font-bold text-black border border-zinc-200"
            >
              <Globe size={12} /> {i18n.language === 'en' ? 'ಕನ್ನಡ' : 'ENGLISH'}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="w-px h-4 bg-zinc-200"></div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="btn-premium btn-premium-primary text-xs tracking-widest uppercase px-6 py-2"
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
