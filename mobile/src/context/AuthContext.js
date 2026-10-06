import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStored() {
      try {
        const storedToken = (await AsyncStorage.getItem('pm_token')) || (await AsyncStorage.getItem('jira_token'));
        const storedUser = (await AsyncStorage.getItem('pm_user')) || (await AsyncStorage.getItem('jira_user'));
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to load stored auth', err);
      } finally {
        setLoading(false);
      }
    }
    loadStored();
  }, []);

  const login = async (email, password) => {
    const res = await mobileApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    await AsyncStorage.setItem('pm_token', res.token);
    await AsyncStorage.setItem('pm_user', JSON.stringify(res.user));
    await AsyncStorage.setItem('jira_token', res.token);
    await AsyncStorage.setItem('jira_user', JSON.stringify(res.user));
    return res;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('pm_token');
    await AsyncStorage.removeItem('pm_user');
    await AsyncStorage.removeItem('jira_token');
    await AsyncStorage.removeItem('jira_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
