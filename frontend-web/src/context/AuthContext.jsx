import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pm_user') || localStorage.getItem('jira_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pm_token') || localStorage.getItem('jira_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getCurrentUser()
        .then(u => {
          setUser(u);
          localStorage.setItem('pm_user', JSON.stringify(u));
          localStorage.setItem('jira_user', JSON.stringify(u));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const handleLogout = () => logout();
    window.addEventListener('pm_auth_logout', handleLogout);
    window.addEventListener('jira_auth_logout', handleLogout);
    return () => {
      window.removeEventListener('pm_auth_logout', handleLogout);
      window.removeEventListener('jira_auth_logout', handleLogout);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('pm_token', res.token);
    localStorage.setItem('pm_user', JSON.stringify(res.user));
    localStorage.setItem('jira_token', res.token);
    localStorage.setItem('jira_user', JSON.stringify(res.user));
    return res;
  };

  const register = async (name, email, password, avatarUrl) => {
    const res = await authApi.register(name, email, password, avatarUrl);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('pm_token', res.token);
    localStorage.setItem('pm_user', JSON.stringify(res.user));
    localStorage.setItem('jira_token', res.token);
    localStorage.setItem('jira_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_user');
    localStorage.removeItem('jira_token');
    localStorage.removeItem('jira_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
