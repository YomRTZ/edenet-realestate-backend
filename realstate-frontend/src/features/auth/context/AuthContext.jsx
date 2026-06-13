import { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { authApi } from '../api/auth.api';
import { useEffect } from 'react';

const AuthContext = createContext(null);

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

      setAccount(userData.account);
      setRole(userData.role);
      setIsOwner(Boolean(userData.isOwner));
      setIsTenant(Boolean(userData.isTenant));
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Crypto authorization operation failed:', err);
      alert(err?.response?.data?.error || err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // On mount, try to restore auth state from server using httpOnly session cookie
  useEffect(() => {
    let mounted = true;
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
      } catch (err) {
        // no active session or error — remain unauthenticated
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    restore();
    return () => { mounted = false; };
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
