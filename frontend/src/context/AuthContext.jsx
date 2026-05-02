import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

/* ── demo credentials (no backend needed) ─────────────────────────────── */
const DEMO_USERS = {
  'admin@example.com':   { role: 'admin',   name: 'Ravi Admin'    },
  'auditor@example.com': { role: 'auditor', name: 'Priya Auditor' },
  'donor@example.com':   { role: 'donor',   name: 'Rajesh Kumar'  },
};

const makeMockToken = (role, name, address = '0xDEMO') => {
  const header  = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role, name, address, iat: Date.now() }));
  return `${header}.${payload}.DEMO`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ role: decoded.role, name: decoded.name, address: decoded.address });
      } catch {
        setToken(null);
      }
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => setToken(newToken);

  /* email demo login — matches DEMO_USERS map */
  const demoLogin = (email) => {
    const demo = DEMO_USERS[email.toLowerCase().trim()];
    if (!demo) return null;
    const t = makeMockToken(demo.role, demo.name);
    setToken(t);
    return demo.role;
  };

  /* wallet demo login — simulates MetaMask for admin */
  const demoWalletLogin = (role = 'admin') => {
    const names = { admin: 'Ravi Admin', auditor: 'Priya Auditor', donor: 'Rajesh Kumar' };
    const addrs = { admin: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', auditor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', donor: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' };
    const t = makeMockToken(role, names[role], addrs[role]);
    setToken(t);
    return role;
  };

  const logout = () => { setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, token, login, demoLogin, demoWalletLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
