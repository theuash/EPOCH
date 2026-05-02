import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import JudgesDashboard from './pages/JudgesDashboard';
import PublicDashboard from './pages/PublicDashboard';
import PublicView from './pages/PublicView';
import FlaggedTransactions from './pages/FlaggedTransactions';
import NgoFundSpend from './pages/NgoFundSpend';
import DonorHistory from './pages/DonorHistory';
import MyTransactions from './pages/MyTransactions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import './i18n';

/* ── Error boundary ─────────────────────────────────────── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-lg w-full bg-white border border-rose-200 rounded-2xl p-8 shadow-sm">
          <div className="font-bold text-slate-900 mb-3">Something went wrong</div>
          <pre className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-4 overflow-auto max-h-40 whitespace-pre-wrap">
            {this.state.error?.message}
          </pre>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            className="mt-4 w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

/* ── Admin-only route guard ─────────────────────────────── */
const AdminRoute = ({ children }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

/* ── Auditor-only route guard ───────────────────────────── */
const AuditorRoute = ({ children }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== 'auditor') return <Navigate to="/" replace />;
  return children;
};

/* ── Donor-only route guard ─────────────────────────────── */
const DonorRoute = ({ children }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== 'donor') return <Navigate to="/" replace />;
  return children;
};

/* ── Generic protected route (any logged-in role) ────────── */
const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-50 flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* ── Public routes — no auth needed ── */}
                  <Route path="/"                  element={<Landing />} />
                  <Route path="/login"             element={<Login />} />
                  <Route path="/judges"            element={<JudgesDashboard />} />
                  <Route path="/public-dashboard"  element={<PublicDashboard />} />
                  <Route path="/ngo-spend-public"  element={<NgoFundSpend />} />

                  {/* ── Admin-only pages ── */}
                  <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/public"          element={<AdminRoute><PublicView /></AdminRoute>} />
                  <Route path="/ngo-spend"       element={<AdminRoute><NgoFundSpend /></AdminRoute>} />
                  <Route path="/flagged"         element={<AdminRoute><FlaggedTransactions /></AdminRoute>} />
                  <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                  {/* ── Auditor-only pages ── */}
                  <Route path="/auditor-home"   element={<AuditorRoute><AuditorDashboard /></AuditorRoute>} />
                  <Route path="/auditor-public" element={<AuditorRoute><NgoFundSpend /></AuditorRoute>} />
                  <Route path="/auditor-ngo"    element={<AuditorRoute><NgoFundSpend /></AuditorRoute>} />
                  <Route path="/donor-history"  element={<AuditorRoute><DonorHistory /></AuditorRoute>} />
                  <Route path="/auditor"        element={<AuditorRoute><AuditorDashboard /></AuditorRoute>} />

                  {/* ── Donor-only pages ── */}
                  <Route path="/donor-home"      element={<DonorRoute><Landing /></DonorRoute>} />
                  <Route path="/donor-public"    element={<DonorRoute><PublicView /></DonorRoute>} />
                  <Route path="/donor-ngo"       element={<DonorRoute><NgoFundSpend /></DonorRoute>} />
                  <Route path="/my-transactions" element={<DonorRoute><MyTransactions /></DonorRoute>} />

                  {/* ── Catch-all → back to home, NOT login ── */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}

export default App;
