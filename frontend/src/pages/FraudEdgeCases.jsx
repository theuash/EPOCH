import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Activity, ShieldAlert, GitMerge, FileWarning, Search, XCircle, CheckCircle, RefreshCcw, DollarSign, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// --- Shared Components ---
const Card = ({ title, icon: Icon, description, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Icon size={20} className="text-blue-600" />
          {title}
        </h3>
        <p className="text-sm text-zinc-500 mt-1">{description}</p>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

const Badge = ({ type, text }) => {
  const styles = {
    danger: "bg-red-50 text-red-600 border-red-200",
    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    normal: "bg-zinc-100 text-zinc-600 border-zinc-200"
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[type]}`}>
      {text}
    </span>
  );
};

// --- Edge Case 1: Phantom Project Spending ---
const CasePhantomProject = () => {
  const [spending, setSpending] = useState(250); // normal average
  const [flagged, setFlagged] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, amount: 200, to: "Vendor A (Verified)", time: "10:00 AM", status: 'normal' },
    { id: 2, amount: 350, to: "Vendor B (Verified)", time: "11:30 AM", status: 'normal' },
    { id: 3, amount: 150, to: "Vendor C (Verified)", time: "01:15 PM", status: 'normal' },
  ]);

  const simulateFraud = () => {
    const newTx = { id: Date.now(), amount: 15000, to: "New Project X (Unverified)", time: "Just Now", status: 'flagged' };
    setHistory([newTx, ...history].slice(0, 4));
    setSpending(15000);
    setFlagged(true);
  };

  const reset = () => {
    setSpending(250);
    setFlagged(false);
    setHistory([
      { id: 1, amount: 200, to: "Vendor A (Verified)", time: "10:00 AM", status: 'normal' },
      { id: 2, amount: 350, to: "Vendor B (Verified)", time: "11:30 AM", status: 'normal' },
      { id: 3, amount: 150, to: "Vendor C (Verified)", time: "01:15 PM", status: 'normal' },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-zinc-500">Avg Monthly Budget: <span className="font-bold text-zinc-800">$4,000</span></div>
        <div className="space-x-2">
          <button onClick={reset} className="btn-premium btn-premium-outline py-1.5 px-3 text-xs"><RefreshCcw size={14}/></button>
          <button onClick={simulateFraud} disabled={flagged} className="btn-premium bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 text-xs">Simulate $15k Outflow</button>
        </div>
      </div>
      
      <div className={`p-4 rounded-lg border transition-colors ${flagged ? 'bg-red-50 border-red-200' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm">Contract Event Polling (Web3)</span>
          {flagged ? <Badge type="danger" text="FLAGGED: Overspend" /> : <Badge type="success" text="Normal Activity" />}
        </div>
        <div className="space-y-2 mt-4">
          <AnimatePresence>
            {history.map(tx => (
              <motion.div key={tx.id} initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} className={`p-3 rounded text-sm flex justify-between ${tx.status === 'flagged' ? 'bg-red-100/50 text-red-900 border border-red-200' : 'bg-white border border-zinc-200'}`}>
                <div>
                  <div className="font-medium">{tx.to}</div>
                  <div className="text-xs opacity-70">{tx.time}</div>
                </div>
                <div className="font-bold">${tx.amount.toLocaleString()}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Edge Case 2: Disaster Relief Diversion ---
const CaseReliefDiversion = () => {
  const [diversionActive, setDiversionActive] = useState(false);
  const [popup, setPopup] = useState(false);

  const triggerDiversion = () => {
    setDiversionActive(true);
    setTimeout(() => setPopup(true), 400); // Simulate network delay
  };

  const reset = () => {
    setDiversionActive(false);
    setPopup(false);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">Phase: <span className="text-amber-600">Disaster Relief Active</span></div>
        <button onClick={diversionActive ? reset : triggerDiversion} className={`btn-premium text-xs py-1.5 px-3 text-white ${diversionActive ? 'bg-zinc-800' : 'bg-rose-600 hover:bg-rose-700'}`}>
          {diversionActive ? 'Reset' : 'Divert to Luxury Travel'}
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded p-4 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Target Aid (Food)</div>
          <div className="text-2xl font-bold text-zinc-800">${diversionActive ? '200' : '2,000'}</div>
        </div>
        <div className={`flex-1 rounded p-4 text-center transition-colors border ${diversionActive ? 'bg-red-50 border-red-200' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Admin / Travel</div>
          <div className={`text-2xl font-bold ${diversionActive ? 'text-red-600' : 'text-zinc-800'}`}>${diversionActive ? '1,800' : '200'}</div>
        </div>
      </div>

      <div className="mt-4 text-xs font-mono bg-zinc-900 text-green-400 p-3 rounded">
        {`// Smart Contract Rule:`}<br/>
        {`require(adminRatio <= 0.20 || category == 'relief', "Revert");`}<br/>
        {diversionActive && <span className="text-red-400">&gt; REVERTED: Category Mismatch (Travel) / Ratio &gt; 20%</span>}
      </div>

      <AnimatePresence>
        {popup && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg border border-red-200">
            <div className="bg-red-600 text-white p-6 rounded-xl shadow-xl flex flex-col items-center max-w-xs text-center">
              <AlertTriangle size={32} className="mb-2" />
              <h4 className="font-bold text-lg mb-1">Misuse Detected</h4>
              <p className="text-xs opacity-90">Transaction blocked. Category 'Travel' restricted during active disaster phase.</p>
              <button onClick={reset} className="mt-4 bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-2 rounded transition-colors">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Edge Case 3: Donor Money Laundering ---
const CaseMoneyLaundering = () => {
  const [showOutlier, setShowOutlier] = useState(false);
  
  // Heatmap mock data
  const days = ['M','T','W','T','F','S','S'];
  const grid = Array.from({length: 4}, (_, row) => 
    days.map((day, col) => {
      const isOutlier = showOutlier && row === 1 && col === 4;
      const val = isOutlier ? 6000 : Math.floor(Math.random() * 150) + 50;
      return { row, col, val, isOutlier };
    })
  );

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-zinc-500">Donor Profile: <span className="font-mono text-zinc-800">0x7F...2B9</span> (No KYC)</div>
        <button onClick={() => setShowOutlier(!showOutlier)} className="btn-premium btn-premium-outline py-1.5 px-3 text-xs">
          {showOutlier ? 'Hide Outlier' : 'Inject $6k Txn'}
        </button>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <div className="text-xs text-zinc-500 mb-3">Donation Heatmap (Last 4 Weeks)</div>
        <div className="grid grid-cols-7 gap-1">
          {grid.flat().map((cell, i) => (
             <div 
              key={i} 
              title={`$${cell.val}`}
              className={`h-8 rounded transition-all duration-500 ${
                cell.isOutlier 
                  ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                  : cell.val > 150 ? 'bg-blue-300' : 'bg-blue-100'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showOutlier && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 items-start">
            <ShieldAlert size={16} className="text-red-600 mt-0.5 shrink-0" />
            <div className="text-sm text-red-900">
              <strong>Smart Contract Revert:</strong><br/>
              <span className="font-mono text-xs text-red-700 bg-red-100 px-1 py-0.5 rounded">require(amount &lt;= 1000 || kycVerified, "Flag: Suspicious Donor")</span>
              <div className="mt-1 text-xs opacity-80">Jump &gt;5x average ($120). Unverified wallet hit $6,000 threshold.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Edge Case 4: Fake Repeated Claims ---
const CaseFakeClaims = () => {
  const [claims, setClaims] = useState([
    { id: 1, wallet: '0x1A...9C', time: '2 mins ago', status: 'approved' },
    { id: 2, wallet: '0x4B...3F', time: '15 mins ago', status: 'approved' },
  ]);

  const addClaim = (wallet, isDuplicate) => {
    const newClaim = {
      id: Date.now(),
      wallet,
      time: 'Just now',
      status: isDuplicate ? 'rejected' : 'approved'
    };
    setClaims([newClaim, ...claims]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => addClaim('0x9D...2E', false)} className="btn-premium btn-premium-outline py-1.5 px-3 text-xs flex-1">New Claim (Valid)</button>
        <button onClick={() => addClaim('0x1A...9C', true)} className="btn-premium bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 text-xs flex-1">Claim Again (0x1A...)</button>
        <button onClick={() => setClaims(claims.slice(-2))} className="btn-premium btn-premium-outline py-1.5 px-2 text-xs"><RefreshCcw size={14}/></button>
      </div>

      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2">Wallet</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {claims.map((claim) => (
                <motion.tr 
                  key={claim.id} 
                  initial={{opacity: 0, backgroundColor: '#f4f4f5'}} 
                  animate={{opacity: 1, backgroundColor: claim.status === 'rejected' ? '#fef2f2' : '#ffffff'}}
                  className={`border-b border-zinc-100 ${claim.status === 'rejected' ? 'text-red-900' : ''}`}
                >
                  <td className="px-4 py-2 font-mono">{claim.wallet}</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">{claim.time}</td>
                  <td className="px-4 py-2">
                    {claim.status === 'approved' 
                      ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={12}/> Paid</span>
                      : <span className="flex items-center gap-1 text-red-600 font-bold"><XCircle size={12}/> Duplicate</span>
                    }
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Edge Case 5: Shell Entity Transfers ---
const CaseShellEntity = () => {
  const [simulated, setSimulated] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Flow Analytics</span>
        <button onClick={() => setSimulated(!simulated)} className="btn-premium btn-premium-outline py-1.5 px-3 text-xs">
          {simulated ? 'Reset' : 'Simulate Outflow'}
        </button>
      </div>

      {/* SVG Network Graph Simulation */}
      <div className="h-48 bg-zinc-900 rounded-lg relative overflow-hidden flex items-center justify-center border border-zinc-800">
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4ade80" />
            </marker>
            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
            </marker>
          </defs>
          
          {/* Inflow */}
          <line x1="10%" y1="50%" x2="45%" y2="50%" stroke="#4ade80" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4" className="animate-pulse" />
          
          {/* Outflow 1 (Valid) */}
          <line x1="55%" y1="50%" x2="85%" y2="20%" stroke={simulated ? "#52525b" : "#4ade80"} strokeWidth="2" markerEnd="url(#arrowhead)" />
          
          {/* Outflow 2 (Suspicious Shells) */}
          {simulated && (
            <>
              <line x1="55%" y1="50%" x2="85%" y2="50%" stroke="#f87171" strokeWidth="3" markerEnd="url(#arrowhead-red)" className="animate-pulse" />
              <line x1="55%" y1="50%" x2="85%" y2="80%" stroke="#f87171" strokeWidth="3" markerEnd="url(#arrowhead-red)" className="animate-pulse" />
            </>
          )}
        </svg>

        {/* Nodes */}
        <div className="absolute left-[5%] top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]"><DollarSign size={16} className="text-emerald-400"/></div>
          <span className="text-[10px] text-zinc-400 mt-1">Donors</span>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-14 h-14 rounded-xl bg-zinc-800 border-2 border-blue-500 flex items-center justify-center shadow-lg"><Activity size={24} className="text-blue-500"/></div>
          <span className="text-xs text-white font-bold mt-2">NGO Wallet</span>
        </div>

        <div className="absolute right-[5%] top-[20%] -translate-y-1/2 flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full bg-zinc-800 border-2 ${simulated ? 'border-zinc-600 opacity-50' : 'border-zinc-400'} flex items-center justify-center`}><CheckCircle size={16} className={simulated ? 'text-zinc-600' : 'text-zinc-400'}/></div>
          <span className="text-[10px] text-zinc-400 mt-1 whitespace-nowrap">Verified Local</span>
        </div>

        {simulated && (
          <>
            <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute right-[5%] top-[50%] -translate-y-1/2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]"><AlertOctagon size={16} className="text-red-500"/></div>
              <span className="text-[10px] text-red-400 mt-1 font-bold">Unwhitelisted A</span>
            </motion.div>
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2}} className="absolute right-[5%] top-[80%] -translate-y-1/2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]"><AlertOctagon size={16} className="text-red-500"/></div>
              <span className="text-[10px] text-red-400 mt-1 font-bold">Unwhitelisted B</span>
            </motion.div>
          </>
        )}
      </div>
      
      {simulated && (
        <div className="text-xs bg-red-50 text-red-800 p-2 rounded border border-red-200">
          <strong>Alert:</strong> &gt;80% of recent inflows transferred to new unwhitelisted entities within 48 hours. Smart contract lock initiated.
        </div>
      )}
    </div>
  );
};

// --- Edge Case 6: Micro-Donation Laundering ---
const CaseMicroDonations = () => {
  const [burst, setBurst] = useState(false);
  const [txCount, setTxCount] = useState(12);
  
  const data = [
    { name: 'Organic', value: burst ? 12 : 12, color: '#3b82f6' },
    { name: 'Suspicious Cluster', value: burst ? 58 : 0, color: '#ef4444' },
  ];

  const triggerBurst = () => {
    setBurst(true);
    let c = 12;
    const interval = setInterval(() => {
      c += 5;
      if(c > 70) clearInterval(interval);
      setTxCount(Math.min(c, 70));
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Live Transaction Feed</span>
        <button onClick={burst ? () => {setBurst(false); setTxCount(12)} : triggerBurst} className="btn-premium btn-premium-outline py-1.5 px-3 text-xs">
          {burst ? 'Reset' : 'Simulate Micro-Burst'}
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Hourly Vol:</span>
            <span className="font-bold">${burst ? '3,500' : '450'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Tx Count:</span>
            <span className={`font-bold ${burst ? 'text-red-600' : ''}`}>{txCount}</span>
          </div>
          
          <div className={`mt-2 p-2 rounded text-xs border transition-colors ${burst ? 'bg-red-50 border-red-200 text-red-800' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
            {burst ? (
              <span className="flex items-start gap-1"><AlertTriangle size={14} className="mt-0.5 shrink-0"/> cluster flagged: &gt;50 related wallets depositing $50-$60 rapidly.</span>
            ) : (
              <span className="flex items-center gap-1"><CheckCircle size={14}/> Normal organic volume.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function FraudEdgeCases() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6 border border-blue-100">
            <ShieldAlert size={14} /> Auditor Overview
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mb-4">
            Fraud Detection Prototypes
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-zinc-500 text-lg">
            Interactive demonstrations of blockchain-based edge case detection, utilizing smart contract logic and real-time ledger transparency.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            title="Phantom Projects" 
            icon={FileWarning} 
            description="Sudden large outflows to unverified entities."
            delay={0.1}
          >
            <CasePhantomProject />
          </Card>

          <Card 
            title="Relief Diversion" 
            icon={AlertTriangle} 
            description="Funds shifted to admin/luxury during disaster phase."
            delay={0.2}
          >
            <CaseReliefDiversion />
          </Card>

          <Card 
            title="Money Laundering" 
            icon={Search} 
            description="High-value txns from new unverified wallets."
            delay={0.3}
          >
            <CaseMoneyLaundering />
          </Card>

          <Card 
            title="Repeated Claims" 
            icon={GitMerge} 
            description="Donors claiming aid multiple times for same event."
            delay={0.4}
          >
            <CaseFakeClaims />
          </Card>

          <Card 
            title="Shell Transfers" 
            icon={Activity} 
            description="Rapid transfers to new entities matching inflows."
            delay={0.5}
          >
            <CaseShellEntity />
          </Card>

          <Card 
            title="Micro-Laundering" 
            icon={AlertOctagon} 
            description="Layering small txns to legitimize funds."
            delay={0.6}
          >
            <CaseMicroDonations />
          </Card>
        </div>
      </div>
    </div>
  );
}
