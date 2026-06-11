import  { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

// The hardcoded address of your Admin account (usually Account #0 from Hardhat node)
const ADMIN_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase();

export default function RealEstateApp() {
  const [account, setAccount] = useState("");
  const [role, setRole] = useState("Guest"); // Guest, Admin, Owner, Tenant
  const [contract, setContract] = useState(null);
  const [buyPrice, setBuyPrice] = useState("");
  const [rentRate, setRentRate] = useState("");

  // 1. Connect MetaMask Wallet and Listen for Account Changes
  async function connectWallet() {
    if (!window.ethereum) return alert("Please install MetaMask!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const marketContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setAccount(userAddress);
      setContract(marketContract);
      determineRole(userAddress, marketContract);
    } catch (err) {
      console.error(err);
    }
  }

  // 2. Dynamically Determine the User's Role View
  async function determineRole(userAddress, marketContract) {
    const lowerAddress = userAddress.toLowerCase();
    
    if (lowerAddress === ADMIN_ADDRESS) {
      setRole("Admin");
      return;
    }

    try {
      // Fetch property data from the blockchain to check if they own or rent an asset
      // For this example, we check property ID #1
      const property = await marketContract.properties(1);
      
      if (property.currentOwner.toLowerCase() === lowerAddress) {
        setRole("Owner");
      } else if (property.currentTenant.toLowerCase() === lowerAddress) {
        setRole("Tenant");
      } else {
        setRole("Public User");
      }
    } catch {
      setRole("Public User"); // Fallback if no properties are listed yet
    }
  }

  // 3. Listen for Account Swapping directly inside MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) determineRole(accounts[0], contract);
        } else {
          setAccount("");
          setRole("Guest");
        }
      });
    }
  }, [contract]);

  // 4. Owner Action Form (Replaces interact.js step 1)
  async function handleListProperty(e) {
    e.preventDefault();
    if (!contract) return;
    try {
      const tx = await contract.listProperty(
        ethers.parseEther(buyPrice), 
        ethers.parseEther(rentRate), 
        true, true
      );
      await tx.wait();
      alert("Property listed successfully on-chain!");
    } catch (err) {
      console.error(err);
    }
  }

  // 5. Tenant Action Button (Replaces interact.js step 2)
  async function handleRentProperty() {
    if (!contract) return;
    try {
      const rentalCost = ethers.parseEther("2.5"); // Example payment parameter
      const tx = await contract.rentProperty(1, 5, { value: rentalCost });
      await tx.wait();
      alert("Lease secured successfully via MetaMask!");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>🏡 Real Estate Web Portal</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask Wallet</button>
      ) : (
        <div>
          <p>Connected Wallet: <code>{account}</code></p>
          <p>Detected System Role: <strong style={{ color: 'blue' }}>{role}</strong></p>
        </div>
      )}

      {/* ADMIN INTERFACE PANEL */}
      {role === "Admin" && (
        <div style={{ border: '2px red dashed', padding: '20px', marginTop: '20px' }}>
          <h3>🛡️ Admin Dashboard</h3>
          <p>System Overview Mode. You can pause contracts or view global platform metrics here.</p>
        </div>
      )}

      {/* OWNER INTERFACE PANEL */}
      {(role === "Owner" || role === "Admin") && (
        <div style={{ border: '1px solid green', padding: '20px', marginTop: '20px' }}>
          <h3>🔑 Owner Portal: List a House</h3>
          <form onSubmit={handleListProperty}>
            <input type="number" placeholder="Sale Price (ETH)" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} required />
            <input type="number" placeholder="Rent Rate/Day (ETH)" value={rentRate} onChange={e => setRentRate(e.target.value)} required />
            <button type="submit">Broadcast Listing</button>
          </form>
        </div>
      )}

      {/* TENANT / PUBLIC INTERFACE PANEL */}
      {(role === "Public User" || role === "Tenant") && (
        <div style={{ border: '1px solid blue', padding: '20px', marginTop: '20px' }}>
          <h3>🛋️ Marketplace Explorer</h3>
          <div style={{ padding: '10px', background: '#f9f9f9' }}>
            <h4>Property ID #1 (Luxury Villa)</h4>
            <p>Status: Available for Rent</p>
            {role === "Tenant" ? (
              <p style={{ color: 'orange' }}>🎉 You are currently leasing this property!</p>
            ) : (
              <button onClick={handleRentProperty}>Rent this House for 5 Days (2.5 ETH)</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
