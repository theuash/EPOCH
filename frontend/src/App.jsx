import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import PublicDashboard from './pages/PublicDashboard';
import FraudEdgeCases from './pages/FraudEdgeCases';
import FlaggedTransactions from './pages/FlaggedTransactions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import './i18n';

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/public" element={<PublicDashboard />} />
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/auditor" element={<ProtectedRoute role="auditor"><AuditorDashboard /></ProtectedRoute>} />
                <Route path="/prototypes" element={<FraudEdgeCases />} />
                <Route path="/flagged" element={<FlaggedTransactions />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;
