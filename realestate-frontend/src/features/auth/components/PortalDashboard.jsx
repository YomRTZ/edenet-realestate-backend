import { useAuth } from '../hooks/useAuth';

export function PortalDashboard() {
  const { account, role, isOwner, isTenant, isAuthenticated, isLoading, login, logout, updateStatus } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Validating Cryptographic Assertions...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>🏛 Land Deeds & Lease Administration Registry</h2>

      {!isAuthenticated ? (
        <div style={{ padding: '30px', border: '1px dashed #777', textAlign: 'center' }}>
          <p>Please authorize identity using active cryptographic signing parameters.</p>
          <button style={{ padding: '10px 20px', cursor: 'pointer' }} onClick={login}>
            Authenticate via MetaMask
          </button>
        </div>
      ) : (
        <div>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            <p><strong>Identified Wallet Address:</strong> <code>{account}</code></p>
            <p><strong>System Categorization Scope:</strong> <b style={{ color: 'blue' }}>{role}</b></p>
            <button
              style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}
              onClick={logout}
            >
              Revoke Active Session
            </button>
          </div>

          {role === 'Government' && (
            <div style={{ border: '2px solid red', padding: '20px', borderRadius: '5px' }}>
              <h3>🛡 Government Administrative Dashboard Workspace</h3>
              <p>You have full visibility over decentralized global property registries.</p>
            </div>
          )}

          {role === 'Citizen' && (
            <div style={{ border: '2px solid green', padding: '20px', borderRadius: '5px' }}>
              <h3>👥 Citizen Account Space</h3>

              <div style={{ padding: '10px', background: '#fff', border: '1px solid #ccc', marginBottom: '15px' }}>
                <strong>Simulated Smart Contract Transaction Triggers:</strong>
                <br />
                <button style={{ marginTop: '10px', marginRight: '10px', cursor: 'pointer' }} onClick={() => updateStatus('list')}>
                  Simulate Listing Real Estate (Become Owner)
                </button>
                <button style={{ cursor: 'pointer' }} onClick={() => updateStatus('rent')}>
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
