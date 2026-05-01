import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Flag, CheckCircle, AlertTriangle } from 'lucide-react';

const AuditorDashboard = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [flags, setFlags] = useState([]);

  useEffect(() => { fetchFlags(); }, []);
  const fetchFlags = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/flags', { headers: { Authorization: `Bearer ${token}` } });
      setFlags(res.data);
    } catch (err) { console.error(err); }
  };

  const resolveFlag = async (id, notes) => {
    try {
      await axios.post(`http://localhost:5000/api/flags/${id}/resolve`, { notes }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Resolved");
      fetchFlags();
    } catch (err) { alert("Failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12">Auditor Oversight</h1>
      <div className="grid gap-8">
        {flags.map(flag => (
          <div key={flag.flagId} className="glass p-8 rounded-3xl border-l-8 border-warning flex justify-between items-center">
            <div>
              <div className="font-bold text-xl">{flag.ruleTriggered}</div>
              <div className="text-slate-500">Tx: #{flag.txId} | Receiver: {flag.receiverName}</div>
            </div>
            <button onClick={() => resolveFlag(flag.flagId, "Verified")} className="btn-primary">Resolve</button>
          </div>
        ))}
        {flags.length === 0 && <div className="text-center py-20 text-slate-400">No active flags</div>}
      </div>
    </div>
  );
};
export default AuditorDashboard;
