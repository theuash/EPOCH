import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { Upload, Plus, Check, Clock, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { contracts } = useWeb3();
  const [formData, setFormData] = useState({ receiverName: '', receiverAddress: '', amount: '', category: 'Salary', description: '' });
  const [file, setFile] = useState(null);
  const [pendingTx, setPendingTx] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPending(); }, []);
  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions');
      setPendingTx(res.data.filter(tx => !tx.isApproved));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock hash if upload fails for demo
      const docHash = "0x" + Math.random().toString(16).slice(2);
      await axios.post('http://localhost:5000/api/transactions', { ...formData, documentHash: docHash }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Submitted! Waiting for approval.");
      fetchPending();
    } catch (err) { alert("Error"); }
    finally { setLoading(false); }
  };

  const handleApprove = async (txId) => {
    try {
      const tx = await contracts.fundTransfer.approveTransaction(txId);
      await tx.wait();
      alert("Approved!");
      fetchPending();
    } catch (err) { alert("Approval failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-1 space-y-6">
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-bold mb-2 flex items-center gap-2"><Clock className="text-warning" size={20} /> Pending</h3>
          <div className="text-4xl font-bold">{pendingTx.length}</div>
        </div>
      </div>
      <div className="md:col-span-2 space-y-10">
        <div className="glass p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Plus className="text-accent" /> Submit Transfer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Receiver Name" className="input-field" value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} />
            <input type="text" placeholder="Receiver Address" className="input-field" value={formData.receiverAddress} onChange={e => setFormData({...formData, receiverAddress: e.target.value})} />
            <input type="number" placeholder="Amount" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            <button type="submit" className="w-full btn-primary py-4">{loading ? "..." : t('buttons.submit')}</button>
          </form>
        </div>
        <div className="glass p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Check className="text-success" /> Pending Approval</h2>
          <table className="w-full">
            <tbody>
              {pendingTx.map(tx => (
                <tr key={tx.txId} className="border-b">
                  <td className="py-4 font-bold">{tx.receiverName}</td>
                  <td className="py-4">₹{tx.amount}</td>
                  <td className="py-4 text-right"><button onClick={() => handleApprove(tx.txId)} className="btn-primary bg-success">Approve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
