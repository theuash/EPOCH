import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Database, 
  Users, 
  FileCheck,
  TrendingUp,
  FileText
} from 'lucide-react';

/* ─────────────────────────────── subcomponents ─────────────────────────────── */
const SectionTag = ({ children }) => (
  <div className="inline-flex items-center text-xs font-bold tracking-[0.2em] uppercase mb-8 text-black border-b border-black pb-1">
    {children}
  </div>
);

const FeatureCard = ({ icon: Icon, title, body }) => (
  <div className="p-8 border border-zinc-200 bg-white group hover:border-black transition-colors duration-300">
    <div className="mb-8 text-black">
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold mb-4 text-black">{title}</h3>
    <p className="text-zinc-600 leading-relaxed mb-6 text-sm">{body}</p>
  </div>
);

/* ─────────────────────────────── main component ─────────────────────────────── */
const Landing = () => {
  const { t, i18n } = useTranslation();
  const [chainStatus, setChainStatus] = useState(null);
  const isKn = i18n.language === 'kn';

  // Reflexive Parallax State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/chain/verify')
      .then(r => setChainStatus(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let animationFrameId;
    
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      
      // Throttle with requestAnimationFrame for smooth performance
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const rect = heroRef.current.getBoundingClientRect();
        
        // Calculate relative to the hero section, not the whole window
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Normalize between -1 and 1
        const normalizedX = (x / rect.width) * 2 - 1;
        const normalizedY = (y / rect.height) * 2 - 1;
        
        setMousePos({ 
          x: normalizedX * 30, // Pan translation
          y: normalizedY * 30,
          rotX: normalizedY * -15, // Tilt rotation (negative so it tilts towards mouse)
          rotY: normalizedX * 15 
        });
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-[#fafafa] text-[#111] overflow-x-hidden">

      {/* ════════════════ HERO SECTION ════════════════ */}
      <section ref={heroRef} className="relative pt-32 pb-40 px-6 border-b border-zinc-200 overflow-hidden">
        {/* Subtle Background Grid for Depth Reference */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            {chainStatus && (
              <div className="inline-flex items-center gap-3 px-3 py-1 mb-10 border border-zinc-300 bg-white shadow-sm">
                <div className={`w-2 h-2 rounded-full ${chainStatus.intact ? 'bg-emerald-600' : 'bg-rose-600'}`}></div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                  {chainStatus.intact ? t('chain.intact') : t('chain.tampered')}
                </span>
              </div>
            )}
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tighter text-black">
              {isKn ? 'ಸೆಕ್ಯೂರ್ ನೋಡ್.' : 'Secure Node.'}
            </h1>
            
            <p className="text-2xl text-zinc-600 mb-14 max-w-xl leading-tight font-light">
              {isKn ? 'ಪಾರದರ್ಶಕ ನಿಧಿಗಳು. ನಂಬಿಕಸ್ತ ಸಮುದಾಯಗಳು.' : <>Transparent Funds. <br/>Trusted Communities.</>}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/ngo-spend-public" className="btn-premium btn-premium-primary text-base px-8 py-4">
                {t('cta_public')} <ArrowRight className="ml-3" size={18} />
              </Link>
              <Link to="/login" className="btn-premium btn-premium-outline text-base px-8 py-4 bg-white">
                {t('cta_login')}
              </Link>
            </div>
          </div>
          
          {/* 3D Parallax Container */}
          <div className="relative hidden lg:flex items-center justify-center h-full min-h-[500px]" style={{ perspective: '1200px' }}>
             
             {/* Background Decorative Layer (Moves opposite to mouse) */}
             <div 
               className="absolute w-[80%] aspect-square border border-zinc-200 bg-zinc-50/50 rounded-full transition-transform duration-700 ease-out"
               style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }}
             ></div>
             
             {/* Main Reflexive Card Layer */}
             <div 
               className="relative bg-white border border-zinc-200 p-10 shadow-2xl w-full max-w-md transition-transform duration-300 ease-out"
               style={{ 
                 transform: `translate(${mousePos.x}px, ${mousePos.y}px) rotateX(${mousePos.rotX}deg) rotateY(${mousePos.rotY}deg)`,
                 transformStyle: 'preserve-3d'
               }}
             >
              {/* Inner content pushed out slightly for 3D effect */}
              <div style={{ transform: 'translateZ(40px)' }}>
                <div className="flex items-center justify-between mb-12 border-b border-zinc-100 pb-4">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    {isKn ? 'ನೋಡ್ ಸಮಗ್ರತೆ ಮಾನಿಟರ್' : 'Node Integrity Monitor'}
                  </div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
                
                <div className="space-y-10">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase mb-3 tracking-widest">
                      {isKn ? 'ಸಕ್ರಿಯ ಒಮ್ಮತದ ಹ್ಯಾಶ್' : 'Active Consensus Hash'}
                    </div>
                    <div className="font-mono text-[10px] sm:text-xs text-black break-all leading-relaxed p-4 bg-zinc-50 border border-zinc-200">
                      {chainStatus?.lastBlockHash || '0x0000000000000000000000000000000000000000'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 border border-zinc-200 p-6 flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase mb-3 tracking-widest">
                        {isKn ? 'ನೆಟ್‌ವರ್ಕ್' : 'Network'}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-bold text-black uppercase">
                          {isKn ? 'ಸಿಂಕ್ರೊನೈಸ್ ಆಗಿದೆ' : 'Synchronized'}
                        </span>
                      </div>
                    </div>
                    <div className={`p-6 flex flex-col justify-center ${chainStatus?.intact ? 'bg-black text-white' : 'bg-rose-600 text-white'}`}>
                      <div className="text-[10px] font-bold text-white/50 uppercase mb-1 tracking-widest">
                        {isKn ? 'ಸ್ಥಿತಿ' : 'Status'}
                      </div>
                      <div className="text-sm font-bold uppercase">
                        {chainStatus?.intact ? (isKn ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Verified') : (isKn ? 'ತಿರುಚಲಾಗಿದೆ' : 'Tampered')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ════════════════ PROBLEM SECTION ════════════════ */}
      <section className="py-32 px-6 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-start">
          <div className="sticky top-32">
            <SectionTag>{isKn ? 'ಸಮಸ್ಯೆ' : t('problem.heading')}</SectionTag>
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-8 leading-tight tracking-tighter">
              {isKn ? 'ಪಾರದರ್ಶಕತೆಯ ಕೊರತೆ' : 'The Transparency Deficit'}
            </h2>
            <div className="space-y-6 text-zinc-600 leading-relaxed text-lg font-light">
              <p>{isKn ? t('problem.body_kn') : t('problem.body').split('\n\n')[0]}</p>
              {!isKn && <p className="font-medium text-black">{t('problem.body').split('\n\n')[1]}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: FileText, label: isKn ? 'ಯಾವುದೇ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ' : 'No verifiable receipts' },
              { icon: Lock, label: isKn ? 'ತಿದ್ದಬಹುದಾದ ಡೇಟಾ' : 'Editable spreadsheets' },
              { icon: Eye, label: isKn ? 'ಸಾರ್ವಜನಿಕ ಅವಲೋಕನ ಇಲ್ಲ' : 'No public visibility' },
              { icon: TrendingUp, label: isKn ? 'ದಾನಿಗಳ ನಂಬಿಕೆ ಕಳೆದುಕೊಳ್ಳುತ್ತಿದೆ' : 'Eroded donor trust' },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-50 p-8 border border-zinc-200">
                <div className="mb-6 text-black">
                  <item.icon size={24} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-black">{item.label}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SOLUTION SECTION ════════════════ */}
      <section className="py-32 px-6 border-b border-zinc-200 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <SectionTag>{isKn ? 'ಪರಿಹಾರ' : t('solution.heading')}</SectionTag>
            <h2 className="text-5xl md:text-7xl font-bold text-black mb-8 tracking-tighter">
              {isKn ? 'ಒಂದು ಲೆಡ್ಜರ್. ಸಂಪೂರ್ಣ ಸಮಗ್ರತೆ.' : <>One Ledger. <br /> Absolute Integrity.</>}
            </h2>
            <p className="text-xl text-zinc-600 leading-relaxed font-light">
              {isKn ? t('solution.body') : 'Secure Node puts every NGO transaction on a blockchain ledger that nobody — not even the platform itself — can alter after the fact.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Database} 
              title={t('solution.card1_title')} 
              body={isKn ? t('solution.card1_kn') : t('solution.card1_body')} 
            />
            <FeatureCard 
              icon={Users} 
              title={t('solution.card2_title')} 
              body={isKn ? t('solution.card2_kn') : t('solution.card2_body')} 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title={t('solution.card3_title')} 
              body={isKn ? t('solution.card3_kn') : t('solution.card3_body')} 
            />
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-32 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <div className="sticky top-32">
              <div className="inline-flex items-center text-xs font-bold tracking-[0.2em] uppercase mb-8 text-white border-b border-white pb-1">
                {isKn ? 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ' : t('how.heading')}
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-none tracking-tighter">
                {isKn ? 'ಹೊಣೆಗಾರಿಕೆಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.' : <>Designed for <br /> Accountability.</>}
              </h2>
              <p className="text-xl text-zinc-400 mb-12 max-w-md leading-relaxed font-light">
                {isKn ? 'ನಮ್ಮ ಬಹು-ಹಂತದ ಪರಿಶೀಲನೆ ಪ್ರಕ್ರಿಯೆಯು ಯಾವುದೇ ವಹಿವಾಟು ಪರಿಶೀಲಿಸದೆ ಹೋಗುವುದಿಲ್ಲ ಎಂದು ಖಚಿತಪಡಿಸುತ್ತದೆ.' : 'Our multi-step verification process ensures that no transaction goes unvetted.'}
              </p>
            </div>
            
            <div className="space-y-12 border-l border-zinc-800 pl-8 md:pl-16">
              {[
                { title: t('how.step1_title'), body: t('how.step1_body'), icon: FileCheck },
                { title: t('how.step2_title'), body: t('how.step2_body'), icon: Database },
                { title: t('how.step3_title'), body: t('how.step3_body'), icon: AlertCircle },
                { title: t('how.step4_title'), body: t('how.step4_body'), icon: CheckCircle2 },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[41px] md:-left-[73px] top-0 w-4 h-4 bg-black border-2 border-zinc-600 rounded-full"></div>
                  <div className="flex gap-6 items-start">
                    <div className="text-zinc-600">
                      <step.icon size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-500 mb-2 tracking-widest uppercase">
                        {isKn ? `ಹಂತ 0${i + 1}` : `Phase 0${i + 1}`}
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-4">{step.title}</h4>
                      <p className="text-zinc-400 leading-relaxed font-light">{step.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ LIVE CHAIN STATUS ════════════════ */}
      <section className="py-32 px-6 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`p-12 md:p-20 border ${chainStatus?.intact ? 'bg-zinc-50 border-zinc-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div>
                <div className="text-black font-bold uppercase tracking-widest text-xs mb-6 border-b border-black pb-1 inline-block">
                  {isKn ? t('chain.label_kn') : t('chain.label')}
                </div>
                <h3 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter text-black">
                  {chainStatus?.intact ? t('chain.intact') : t('chain.tampered')}
                </h3>
                <p className="text-zinc-600 text-xl font-light">
                  {chainStatus?.intact 
                    ? (isKn ? 'ಪ್ರತಿ ಬ್ಲಾಕ್ ಅನ್ನು ಒಮ್ಮತದ ಹ್ಯಾಶ್ ವಿರುದ್ಧ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.' : 'Every block has been verified against the consensus hash.') 
                    : (isKn ? 'ಚೈನ್ ರಾಜಿ ಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ. ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ.' : 'The chain has been compromised. Verification failed.')}
                </p>
              </div>
              
              {chainStatus && (
                <div className="flex gap-12 md:border-l border-zinc-200 md:pl-12 pt-8 md:pt-0 border-t md:border-t-0">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="text-2xl font-bold text-black tracking-tight">ACTIVE</div>
                    </div>
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Consensus Layer</div>
                  </div>
                  <div>
                    <div className="text-sm font-mono mb-3 bg-zinc-100 border border-zinc-200 p-3 text-black">{chainStatus.lastBlockHash?.slice(0, 10)}...</div>
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Consensus Hash</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-2">
              <h4 className="text-3xl font-bold text-black mb-6 tracking-tighter">Secure Node.</h4>
              <p className="text-zinc-500 max-w-sm leading-relaxed mb-6 font-light">
                {isKn ? t('footer.tagline_kn') : t('footer.tagline')}
              </p>
            </div>
            <div>
              <h5 className="font-bold text-black mb-6 uppercase tracking-widest text-xs">Platform</h5>
              <div className="grid gap-4 text-zinc-500 text-sm">
                <Link to="/public" className="hover:text-black transition-colors">{t('footer.view_txns')}</Link>
                <Link to="/login" className="hover:text-black transition-colors">{t('footer.admin_login')}</Link>
                <Link to="/login" className="hover:text-black transition-colors">{t('footer.auditor_login')}</Link>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-black mb-6 uppercase tracking-widest text-xs">Connect</h5>
              <div className="grid gap-4 text-zinc-500 text-sm">
                <a href="#" className="hover:text-black transition-colors">GitHub Repository</a>
                <a href="#" className="hover:text-black transition-colors">Documentation</a>
                <a href="#" className="hover:text-black transition-colors">Support</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-400 text-xs tracking-widest uppercase">© 2025 Secure Node</p>
            <div className="flex gap-8 text-zinc-400 text-xs tracking-widest uppercase">
              <a href="#" className="hover:text-black">Privacy Policy</a>
              <a href="#" className="hover:text-black">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
