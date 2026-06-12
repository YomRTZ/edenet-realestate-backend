import { useState } from 'react';
import { ethers } from 'ethers';

const API_BASE = 'http://localhost:5000';

export default function CitizenGovernmentPortal() {
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('Guest');
  const [isOwner, setIsOwner] = useState(false);
  const [isTenant, setIsTenant] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function handleLogin() {
    if (!window.ethereum) return alert('MetaMask extension driver instance not detected!');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Stage 1: Request unique challenge token from backend
      const nonceResponse = await fetch(`${API_BASE}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: userAddress }),
      });

      if (!nonceResponse.ok) {
        const msg = await nonceResponse.text();
        throw new Error(msg || 'Failed to fetch nonce');
      }

      const { nonce } = await nonceResponse.json();

      // Stage 2: Request client private key verification signing confirmation
      const verificationMessage = `Sign to authorize access:\nNonce: ${nonce}`;
      const userSignature = await signer.signMessage(verificationMessage);

      // Stage 3: Send verification packet back to API server loop
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: userSignature, walletAddress: userAddress }),
      });

      const data = await loginResponse.json();

      if (loginResponse.ok) {
        setAccount(data.account);
        setRole(data.role);
        setIsOwner(Boolean(data.isOwner));
        setIsTenant(Boolean(data.isTenant));
        setIsAuthenticated(true);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Crypto authorization operation execution canceled:', err);
      alert(err?.message || 'Login failed');
    }
  }

  // Updates user flags in real-time when interacting with simulated real estate actions
  async function performActionUpdate(actionFlag) {
    try {
      const response = await fetch(`${API_BASE}/api/citizen/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionFlag }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsOwner(Boolean(data.isOwner));
        setIsTenant(Boolean(data.isTenant));
        alert('Success! Account synchronized with your current transaction actions.');
      } else {
        alert(data?.error || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Action failed');
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }


    setAccount('');
    setRole('Guest');
    setIsOwner(false);
    setIsTenant(false);
    setIsAuthenticated(false);
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
      <h2>🏛 Land Deeds & Lease Administration Registry</h2>

      {!isAuthenticated ? (
        <div style={{ padding: '30px', border: '1px dashed #777', textAlign: 'center' }}>
          <p>Please authorize identity using active cryptographic signing parameters.</p>
          <button style={{ padding: '10px 20px', cursor: 'pointer' }} onClick={handleLogin}>
            Authenticate via MetaMask
          </button>
        </div>
      ) : (
        <div>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            <p>
              <strong>Identified Wallet Address:</strong> <code>{account}</code>
            </p>
            <p>
              <strong>System Categorization Scope:</strong> <b style={{ color: 'blue' }}>{role}</b>
            </p>
            <button
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
              onClick={handleLogout}
            >
              Revoke Active Session
            </button>
          </div>

          {/* 🏛 GOVERNMENT LAYOUT COMPONENT PANEL */}
          {role === 'Government' && (
            <div style={{ border: '2px solid red', padding: '20px', borderRadius: '5px' }}>
              <h3>🛡 Government Administrative Dashboard Workspace</h3>
              <p>You have full visibility over decentralized global property registries.</p>
            </div>
          )}

          {/* 👥 CITIZEN LAYOUT COMPONENT PANEL */}
          {role === 'Citizen' && (
            <div style={{ border: '2px solid green', padding: '20px', borderRadius: '5px' }}>
              <h3>👥 Citizen Account Space</h3>

              <div style={{ padding: '10px', background: '#fff', border: '1px solid #ccc', marginBottom: '15px' }}>
                <strong>Simulated Smart Contract Transaction Triggers:</strong>
                <br />
                <button style={{ marginTop: '10px', marginRight: '10px', cursor: 'pointer' }} onClick={() => performActionUpdate('list')}>
                  Simulate Listing Real Estate (Become Owner)
                </button>
                <button style={{ cursor: 'pointer' }} onClick={() => performActionUpdate('rent')}>
                  Simulate Securing Lease (Become Tenant)
                </button>
              </div>

              {isOwner && (
                <div style={{ background: '#eefbe0', padding: '15px', borderRadius: '4px', marginBottom: '10px' }}>
                  <h4>🔑 Landlord Property Hub</h4>
                  <p>You have verified properties listed. Managing public leasing agreements.</p>
                </div>
              )}

              {isTenant && (
                <div style={{ background: '#e0f0fb', padding: '15px', borderRadius: '4px' }}>
                  <h4>🛋 Tenant Rent Workspace</h4>
                  <p>Your current active lease profile tracking is secured on-chain.</p>
                </div>
              )}

              {!isOwner && !isTenant && (
                <p style={{ color: '#666' }}>Your citizen wallet profile currently carries no active real estate asset allocations.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

