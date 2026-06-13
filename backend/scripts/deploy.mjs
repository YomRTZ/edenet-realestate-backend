import { ethers } from "ethers";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = await provider.getSigner(0);

console.log("Deploying with account:", await signer.getAddress());

// Load compiled artifact (run `npx hardhat compile` first)
const artifactPath = resolve(__dirname, "../artifacts/contracts/RealEstate.sol/RealEstate.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

// account[0] of the local Hardhat node is the government wallet
const governmentWallet = await signer.getAddress();

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const contract = await factory.deploy(governmentWallet);
await contract.waitForDeployment();

const contractAddress = await contract.getAddress();

console.log("\n✅ RealEstate deployed!");
console.log("   Contract address :", contractAddress);
console.log("   Government wallet :", governmentWallet);

// ── Auto-sync ABI to the frontend ────────────────────────────────────────────
// Keeps frontend/abi/RealEstate.json in sync without a manual copy step.
const frontendAbiDir  = resolve(__dirname, "../../frontend/abi");
const frontendAbiPath = resolve(frontendAbiDir, "RealEstate.json");

try {
  mkdirSync(frontendAbiDir, { recursive: true });
  writeFileSync(frontendAbiPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log("\n📋 ABI synced to   :", frontendAbiPath);
} catch (err) {
  console.warn("\n⚠️  Could not sync ABI to frontend:", err.message);
  console.warn("   Copy manually: artifacts/contracts/RealEstate.sol/RealEstate.json → frontend/abi/RealEstate.json");
}

console.log("\n👉 Next steps:");
console.log("   1. Copy contract address into your .env → PROPERTY_NFT_ADDRESS=" + contractAddress);
console.log("   2. Set GOV_PRIVATE_KEY to the private key of account[0] from `npx hardhat node`");
console.log("   3. (Optional) Run ContractOwnerTransfer.mjs to grant ADMIN_ROLE to your MetaMask wallet");
