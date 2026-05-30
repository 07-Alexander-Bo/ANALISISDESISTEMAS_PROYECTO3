import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('aq_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('aq_token', res.data.token);
    localStorage.setItem('aq_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('aq_token');
    localStorage.removeItem('aq_user');
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }
