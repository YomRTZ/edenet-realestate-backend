import propertyRepository from '../repositories/property.repository';
import blockchainService from './blockchain.service';


class PropertyWorkflow {
  async executeHybridRegistration(fields, images, documents, setStatusMessage) {
    // 1. Initialize and request user's active wallet account connection
    setStatusMessage("Connecting to wallet account...");
    const { walletAddress } = await blockchainService.getSignerAndWallet();

    // 2. Wrap all payload fields inside a FormData package
    const formData = new FormData();
    Object.keys(fields).forEach(key => formData.append(key, fields[key]));
    formData.append('ownerWallet', walletAddress);

    // Append file lists
    images.forEach(file => formData.append('images', file));
    documents.forEach(file => formData.append('documents', file));

    // 3. Complete Web2 Postgres DB Processing
    setStatusMessage("Uploading media data & generating verification hashes...");
    const hashes = await propertyRepository.submitToWeb2Backend(formData);

    // 4. Trigger Hardhat Smart Contract State Mutations via MetaMask Signatures
    setStatusMessage("Awaiting on-chain transaction verification signatures...");
    const txHash = await blockchainService.mintPropertyOnChain(
      fields.price,
      fields.hoa_fees, // Maps out to temporary testing rates variables
      fields.status === 'ACTIVE', 
      true, 
      hashes
    );

    setStatusMessage("Asset successfully minted on-chain!");
    return txHash;
  }
}

export default new PropertyWorkflow();
