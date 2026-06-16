import { useState} from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

export default function MultiPropertyMarketplace() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [propertiesList, setPropertiesList] = useState([]); // 👈 Array state for multiple properties
  const [loading, setLoading] = useState(false);

  // Form states for listing a new house
  const [buyPrice, setBuyPrice] = useState("");
  const [rentRate, setRentRate] = useState("");

  // 1. Initial Wallet Connection Setup
  async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not found!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const marketContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setAccount(userAddress);
      setContract(marketContract);
      
      // Load properties immediately upon connection
      fetchProperties(marketContract);
    } catch (err) {
      console.error("Connection error:", err);
    }
  }

  // 2. 🔁 Loop Fetcher to Populate Array from Blockchain State
  async function fetchProperties(marketContract) {
    try {
      setLoading(true);
      // Read the public global state variable `propertyCount()` from Solidity
      const totalCountBigInt = await marketContract.propertyCount();
      const totalCount = Number(totalCountBigInt);
      
      const tempArray = [];
      
      // Loop through the sequential property token IDs starting at 1
      for (let i = 1; i <= totalCount; i++) {
        // Calls your Solidity struct: properties(uint256)
        const prop = await marketContract.properties(i);
        
        // Format raw struct data array fields into a clean frontend JavaScript object
        tempArray.push({
          id: Number(prop.id),
          owner: prop.currentOwner,
          buyPrice: ethers.formatEther(prop.buyPrice),      // Convert Wei string back to clean ETH
          rentPriceRate: ethers.formatEther(prop.rentPriceRate),
          tenant: prop.currentTenant,
          rentExpires: Number(prop.rentExpires),
          isForSale: prop.isForSale,
          isForRent: prop.isForRent
        });
      }
      
      // Store the compiled list into the React state engine
      setPropertiesList(tempArray);
    } catch (err) {
      console.error("Error loading marketplace data:", err);
    } finally {
      setLoading(false);
    }
  }

  // 3. Form action to add properties (triggers dynamic refresh on complete)
  async function handleListProperty(e) {
    e.preventDefault();
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.listProperty(
        ethers.parseEther(buyPrice),
        ethers.parseEther(rentRate),
        true, true
      );
      await tx.wait(); // Wait for block mint confirmation
      
      alert("Success! Re-indexing local blockchain database...");
      // Re-run the loop query to update your array layout with the new listing
      await fetchProperties(contract); 
      setBuyPrice("");
      setRentRate("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h2>🏡 Local Web3 Sandbox Marketplace</h2>
      
      {!account ? (
        <button style={{ padding: '10px 20px' }} onClick={connectWallet}>Connect MetaMask Wallet</button>
      ) : (
        <p>Wallet Connected: <code>{account}</code></p>
      )}

      {/* Input section to generate data properties */}
      {account && (
        <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
          <h3>➕ Mint & List a New Real Estate Asset</h3>
          <form onSubmit={handleListProperty} style={{ display: 'flex', gap: '15px' }}>
            <input type="number" step="any" placeholder="Sale Price (ETH)" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} required />
            <input type="number" step="any" placeholder="Rent / Day (ETH)" value={rentRate} onChange={e => setRentRate(e.target.value)} required />
            <button type="submit" disabled={loading}>Broadcast Property Listing</button>
          </form>
        </div>
      )}

      {/* Grid wrapper rendering multiple dynamic list assets */}
      <h3>📦 Active Marketplace Listings ({propertiesList.length})</h3>
      {loading && <p>Reading live blocks from your Mac mini node...</p>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {propertiesList.map((property) => (
          <div key={property.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '10px', right: '15px', fontWeight: 'bold' }}>ID: #{property.id}</span>
            <h4>Real Estate Property Deed</h4>
            <p style={{ fontSize: '12px', color: '#666' }}>Owner: <code>{property.owner.substring(0,6)}...{property.owner.substring(38)}</code></p>
            <hr />
            <p>💰 Buy-Out Valuation: <strong>{property.buyPrice} ETH</strong></p>
            <p>⏳ Rental Rate: <strong>{property.rentPriceRate} ETH / day</strong></p>
            <p style={{ fontSize: '13px' }}>
              Status: {property.rentExpires * 1000 > Date.now() ? (
                <span style={{ color: 'orange', fontWeight: 'bold' }}>🔴 Currently Rented Out</span>
              ) : (
                <span style={{ color: 'green', fontWeight: 'bold' }}>🟢 Available Immediately</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
