import { ethers } from 'ethers';
// Replace this address with your deployed address after running hardhat ignition
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

const CONTRACT_ABI = [
  "function listProperty(uint256 _buyPrice, uint256 _rentPriceRate, bool _isForSale, bool _isForRent, bytes32 _metadataHash, bytes32 _imagesRootHash, bytes32 _documentsRootHash) external"
];

class BlockchainService {
  async getSignerAndWallet() {
    if (!window.ethereum) {
      throw new Error("MetaMask extension missing. Please install a wallet extension.");
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress();
    return { signer, walletAddress };
  }

  async mintPropertyOnChain(buyPrice, rentPrice, isForSale, isForRent, hashes) {
    const { signer } = await this.getSignerAndWallet();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Format strings safely to hex configurations for the contract's bytes32 inputs
    const bytes32Meta = "0x" + hashes.metadataHash;
    const bytes32Img = "0x" + hashes.imagesRootHash;
    const bytes32Doc = "0x" + hashes.documentsRootHash;

    // Convert values into precise Wei values for on-chain storage
    const buyPriceWei = ethers.utils.parseEther(buyPrice || "0");
    const rentPriceWei = ethers.utils.parseEther(rentPrice || "0");

    // Execute the updated smart contract transaction
    const tx = await contract.listProperty(
      buyPriceWei,
      rentPriceWei,
      isForSale,
      isForRent,
      bytes32Meta,
      bytes32Img,
      bytes32Doc
    );

    // Wait for the block verification receipt confirmation
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }
}

export default new BlockchainService();
