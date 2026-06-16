// src/features/auth/context/AuthProvider.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { ethers } from 'ethers';
import { authApi } from '../api/auth.api';
import { authService } from '../../../lib/authService.js';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'realstate_user';

function safeParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('Guest');
  const [isOwner, setIsOwner] = useState(false);
  const [isTenant, setIsTenant] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ FIX: start true

  // =========================
  // LOGIN
  // =========================
  const login = async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected!');
      return;
    }

    try {
      setIsLoading(true);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const selectedAccount = accounts[0];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const nonce = await authApi.getNonce(selectedAccount);

      const message = `Sign to authorize access:\nNonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      const userData = await authApi.login(selectedAccount, signature);

      setAccount(userData.account);
      setRole(userData.role);
      setIsOwner(Boolean(userData.isOwner));
      setIsTenant(Boolean(userData.isTenant));
      setIsAuthenticated(true);

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({
          account: userData.account,
          role: userData.role,
          isOwner: userData.isOwner,
          isTenant: userData.isTenant,
          isAuthenticated: true,
        })
      );
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // RESTORE SESSION
  // =========================
  const restoreSession = async () => {
    try {
      setIsLoading(true);

      const data = await authApi.getMe();

      setAccount(data.account);
      setRole(data.role || 'Guest');
      setIsOwner(Boolean(data.isOwner));
      setIsTenant(Boolean(data.isTenant));
      setIsAuthenticated(true);

      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({
          account: data.account,
          role: data.role,
          isOwner: data.isOwner,
          isTenant: data.isTenant,
          isAuthenticated: true,
        })
      );
    } catch {
      setIsAuthenticated(false);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    authService.init();

    const cached = safeParseJSON(localStorage.getItem(USER_STORAGE_KEY));

    if (cached) {
      // Reduce cascading renders by deferring updates.
      Promise.resolve().then(() => {
        setAccount(cached.account || '');
        setRole(cached.role || 'Guest');
        setIsOwner(Boolean(cached.isOwner));
        setIsTenant(Boolean(cached.isTenant));
        setIsAuthenticated(Boolean(cached.isAuthenticated));

        if (!cached?.isAuthenticated) {
          setIsLoading(false);
        }
      });

      if (cached?.isAuthenticated) {
        // Restore from server without triggering linter's effect purity issues.
        Promise.resolve().then(() => {
          void restoreSession();
        });
      }
    } else {
      Promise.resolve().then(() => {
        setIsLoading(false);
      });
    }
  }, []);


  // =========================
  // LOGOUT
  // =========================
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }

    setAccount('');

    setRole('Guest');
    setIsOwner(false);
    setIsTenant(false);
    setIsAuthenticated(false);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);


  // =========================
  // CONTEXT VALUE
  // =========================
  const value = {
    account,
    role,
    isOwner,
    isTenant,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}