import { createContext, useContext, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    if (!window.ethereum) {
      alert('MetaMask extension driver instance not detected!');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get currently selected account BEFORE requesting
      const currentAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      // If user hasn't connected yet, request connection
      if (currentAccounts.length === 0) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      
      // Get the currently selected account
      const selectedAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (selectedAccounts.length === 0) {
        throw new Error('No MetaMask accounts available');
      }
      
      const selectedAccount = selectedAccounts[0]; // Use the currently selected one
      console.log('Using MetaMask account:', selectedAccount);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const nonce = await authApi.getNonce(selectedAccount);
      const verificationMessage = `Sign to authorize access:\nNonce: ${nonce}`;
      const signature = await signer.signMessage(verificationMessage);

      const userData = await authApi.login(selectedAccount, signature);

      const nextAccount = userData.account;
      const nextRole = userData.role;
      const nextIsOwner = Boolean(userData.isOwner);
      const nextIsTenant = Boolean(userData.isTenant);

      setAccount(nextAccount);
      setRole(nextRole);
      setIsOwner(nextIsOwner);
      setIsTenant(nextIsTenant);
      setIsAuthenticated(true);

      // Persist non-sensitive user data for faster reloads.
      try {
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({
            account: nextAccount,
            role: nextRole,
            isOwner: nextIsOwner,
            isTenant: nextIsTenant,
            isAuthenticated: true,
          })
        );
      } catch {
        // ignore localStorage errors
      }
    } catch (err) {
      console.error('Crypto authorization operation failed:', err);
      alert(err?.response?.data?.error || err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // On mount, initialize axios interceptor + restore auth state from server using httpOnly session cookie
  useEffect(() => {
    authService.init();

    // Hydrate from localStorage first to avoid UI flicker
    try {
      const cached = safeParseJSON(localStorage.getItem(USER_STORAGE_KEY));
      if (cached && cached.account) {
        // Defer state updates to avoid cascading-render effect lint failures.
        Promise.resolve().then(() => {
          setAccount(cached.account || '');
          setRole(cached.role || 'Guest');
          setIsOwner(Boolean(cached.isOwner));
          setIsTenant(Boolean(cached.isTenant));
          setIsAuthenticated(Boolean(cached.isAuthenticated));
        });
      }
    } catch {
      // ignore localStorage errors (privacy mode, etc.)
    }

    let mounted = true;

    // Listen for logout events triggered by token expiration
    const handleAuthLogout = () => {
      if (!mounted) return;
      // Defer cleanup to avoid linter ordering issues with function declarations.
      Promise.resolve().then(() => {
        setAccount('');
        setRole('Guest');
        setIsOwner(false);
        setIsTenant(false);
        setIsAuthenticated(false);
        try {
          localStorage.removeItem(USER_STORAGE_KEY);
        } catch {
          // ignore
        }
      });
    };


    const restore = async () => {
      try {
        setIsLoading(true);
        const data = await authApi.getMe();
        if (!mounted) return;
        setAccount(data.account);
        setRole(data.role || 'Guest');
        setIsOwner(Boolean(data.isOwner));
        setIsTenant(Boolean(data.isTenant));
        setIsAuthenticated(true);

        // Sync cached user data with server truth
        try {
          localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify({
              account: data.account,
              role: data.role || 'Guest',
              isOwner: Boolean(data.isOwner),
              isTenant: Boolean(data.isTenant),
              isAuthenticated: true,
            })
          );
        } catch {
          // ignore storage errors
        }
      } catch (err) {
        // 401 is expected if user hasn't logged in yet - this is not an error
        // Only log other errors
        if (err.response?.status !== 401) {
          console.warn('Session restore failed (expected if not logged in):', err.response?.data?.error || err.message);
        }
        if (mounted) {
          setIsAuthenticated(false);
        }

        // Server says user not authenticated => clear cached user
        try {
          localStorage.removeItem(USER_STORAGE_KEY);
        } catch {
          // ignore
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    restore();
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      mounted = false;
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);


  const updateStatus = async (action) => {
    try {
      const updatedFlags = await authApi.updateStatus(action);
      setIsOwner(Boolean(updatedFlags.isOwner));
      setIsTenant(Boolean(updatedFlags.isTenant));
      alert('Success! Account synchronized with your transaction configurations.');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Action configuration execution failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.log(err);
    } finally {
      setAccount('');
      setRole('Guest');
      setIsOwner(false);
      setIsTenant(false);
      setIsAuthenticated(false);

      try {
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch {
        // ignore localStorage errors
      }
    }
  };

  const value = {
    account,
    role,
    isOwner,
    isTenant,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
