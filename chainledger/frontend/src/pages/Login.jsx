import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import axios from 'axios';
import { Wallet, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('wallet');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { connectWallet } = useWeb3();
  const navigate = useNavigate();

  const handleWalletLogin = async () => {
    setLoading(true);
    try {
      const address = await connectWallet();
      if (!address) return;
      const message = `Login: ${Date.now()}`;
      const signature = await window.ethereum.request({ method: 'personal_sign', params: [message, address] });
      const res = await axios.post('http://localhost:5000/api/auth/wallet-login', { address, signature, message });
      login(res.data.token);
      navigate(res.data.role === 'admin' ? '/admin' : res.data.role === 'auditor' ? '/auditor' : '/public');
    } catch (err) {
      console.error(err);
      alert("Wallet authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.token);
      navigate('/public');
    } catch (err) { 
      alert("Invalid credentials"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-[#fafafa]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-6">
            <Lock size={24} />
          </div>
          <h2 className="text-3xl font-bold text-black mb-3 tracking-tighter">System Access</h2>
          <p className="text-zinc-500 font-light text-sm">Select your authentication protocol</p>
        </div>

        <div className="bg-white p-8 md:p-10 border border-zinc-200">
          <div className="flex border-b border-zinc-200 mb-8">
            <button 
              onClick={() => setActiveTab('wallet')} 
              className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'wallet' ? 'text-black border-b-2 border-black' : 'text-zinc-400 hover:text-black'}`}
            >
              <Wallet size={14} /> Web3
            </button>
            <button 
              onClick={() => setActiveTab('email')} 
              className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'email' ? 'text-black border-b-2 border-black' : 'text-zinc-400 hover:text-black'}`}
            >
              <Mail size={14} /> Email
            </button>
          </div>

          {activeTab === 'wallet' ? (
            <div className="space-y-6">
              <div className="bg-zinc-50 border border-zinc-200 p-8 text-center">
                <ShieldCheck size={32} className="text-black mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-black mb-2">MetaMask Required</h3>
                <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-light">
                  Admins and Auditors must use a whitelisted hardware or software wallet to sign transactions.
                </p>
                <button 
                  onClick={handleWalletLogin} 
                  disabled={loading}
                  className="w-full btn-premium btn-premium-primary py-3"
                >
                  {loading ? 'Authenticating...' : 'Connect Wallet'} 
                  {!loading && <ArrowRight className="ml-2" size={16} />}
                </button>
              </div>
              <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                Protected by Ethereum cryptographic signatures
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="email" 
                    className="input-premium pl-10" 
                    placeholder="name@organization.org" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="password" 
                    className="input-premium pl-10" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-premium btn-premium-primary py-3 mt-2"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
              <div className="text-center pt-4 border-t border-zinc-100">
                <a href="#" className="text-xs font-bold text-zinc-400 hover:text-black transition-colors uppercase tracking-widest">Forgot password?</a>
              </div>
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          256-bit AES Encryption Active
        </p>
      </div>
    </div>
  );
};
export default Login;
