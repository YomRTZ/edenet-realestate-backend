import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { api } from '../lib/axios';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = ["function approveAndMintProperty(address _ownerAddress, uint256 _buyPrice, uint256 _rentPriceRate, bool _isForSale, bool _isForRent, bytes32 _metadataHash, bytes32 _imagesRootHash, bytes32 _documentsRootHash) external returns (uint256)"];

export default function GovernmentDashboard() {
  const [pending, setPending] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [log, setLog] = useState('');

  useEffect(() => {
    api.get('/properties/pending').then(({ data }) => setPending(data.properties || [])).catch(console.error);
  }, []);

  const handleApprovalMint = async (property) => {
    setActiveId(property.id);
    setLog('Connecting to local Hardhat node environment parameters...');
    try {
      if (!window.ethereum) throw new Error('MetaMask driver instance not found.');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setLog('Awaiting admin wallet signature authorization verification...');
      const tx = await contract.approveAndMintProperty(
        property.ownerWallet,
        ethers.parseUnits(property.price, 0),
        0, true, false,
        "0x" + property.metadataHash,
        "0x" + property.imagesRootHash,
        "0x" + property.documentsRootHash
      );

      setLog('Transaction mining active on Hardhat local network blocks...');
      const receipt = await tx.wait();
      const parsedTokenIdRaw = parseInt(receipt.logs[0]?.topics[3], 16);
      const parsedTokenId = String(Number.isFinite(parsedTokenIdRaw) ? parsedTokenIdRaw : 0);

      setLog('On-chain execution completed. Synchronizing Postgres DB records status...');
      await api.post('/properties/confirm', { propertyId: property.id, tokenId: parsedTokenId, chainHash: receipt.hash });

      setLog('Asset successfully locked and initialized on-chain!');
      setPending(prev => prev.filter(p => p.id !== property.id));
    } catch (err) {
      alert(err.message || 'Pipeline conversion failed.');
    } finally {
      setActiveId('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans text-sm mt-4">
      <h2 className="text-lg font-bold text-red-700 border-b border-red-200 pb-2">🏛 Land Deeds Administrative Verification Gateway</h2>
      {log && <div className="my-3 p-2 bg-slate-100 font-mono text-xs border rounded-lg text-slate-700">{log}</div>}
      <div className="mt-4 space-y-3">
        {pending.length === 0 ? <p className="text-slate-400 italic text-xs">No pending applications in registry queue.</p> :
          pending.map(p => (
            <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-sm">
              <div className="max-w-xl truncate space-y-0.5 text-xs">
                <p className="text-sm font-bold text-slate-800">{p.title}</p>
                <p className="text-slate-500">Applicant: <code>{p.ownerWallet}</code></p>
                <p className="text-slate-400 truncate">Meta Hash: {p.metadataHash}</p>
              </div>
              <button disabled={activeId === p.id} onClick={() => handleApprovalMint(p)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg disabled:opacity-50 text-xs">
                {activeId === p.id ? 'Minting...' : 'Approve & Mint'}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
