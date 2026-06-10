// src/utils/contract.js
// Ethers v5 singleton provider, signer, and contract instances.
// NEVER import this in the frontend — it uses the government private key.

const { ethers } = require('ethers');

// ── Minimal ABIs ─────────────────────────────────────────────────────────────

const PROPERTY_NFT_ABI = [
  // Admin approval
  'function approveRequest(uint256 requestId) external',
  'function declineRequest(uint256 requestId, string reason) external',
  'function approveUpdateRequest(uint256 propertyId, uint256 updateIndex) external',
  'function declineUpdateRequest(uint256 propertyId, uint256 updateIndex, string reason) external',
  'function getUpdateRequests(uint256 propertyId) external view returns (tuple(uint256 id, uint256 propertyId, address requester, bytes32 newMetadataHash, bytes32 newImagesRootHash, bytes32 newDocumentsRootHash, uint8 status, string declineReason, uint256 timestamp)[])',

  // View
  'function getLatestHashes(uint256 propertyId) external view returns (bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash)',
  'function getMetadataVersions(uint256 propertyId) external view returns (tuple(bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 timestamp, uint256 versionNo)[])',
  'function isAdmin(address account) external view returns (bool)',
  'function getTotalProperties() external view returns (uint256)',
  'function properties(uint256) external view returns (uint256 id, address owner, tuple(string name, string location, string propertyType, uint256 price, bool isForSale, bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 bedrooms, uint256 bathrooms, uint256 sqft, uint256 parking, uint256 floors, uint256 yearBuilt) details)',

  // Events
  'event RequestApproved(uint256 indexed requestId, uint256 propertyId)',
  'event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price)',
  'event MetadataUpdated(uint256 indexed propertyId, uint256 versionNo, bytes32 metadataHash)',

  // Rental
  'function listForRent(uint256 propertyId, uint256 monthlyRentInEther, uint256 durationMonths) external',
  'function unlistFromRent(uint256 propertyId) external',
  'function rentProperty(uint256 propertyId) external payable',
  'function payRent(uint256 propertyId) external payable',
  'function terminateRentalAsTenant(uint256 propertyId) external',
  'function terminateRentalAsLandlord(uint256 propertyId) external',
  'function terminateRentalAsLandlordNoFault(uint256 propertyId) external',
  'function finalizeExpiredRental(uint256 propertyId) external',
  'function getRentalAgreement(uint256 propertyId) external view returns (tuple(uint256 propertyId, address tenant, address landlord, uint256 monthlyRent, uint256 faithDeposit, uint256 startTime, uint256 endTime, uint256 nextPaymentDue, uint256 durationMonths, uint8 status))',
  'function getRentalListing(uint256 propertyId) external view returns (tuple(uint256 monthlyRent, uint256 durationMonths, bool active))',
  'function getRentDue(uint256 propertyId) external view returns (uint256)',
  'function isInDefaultPeriod(uint256 propertyId) external view returns (bool)',
  'function isInTerminationWindow(uint256 propertyId) external view returns (bool)',
  'function isRented(uint256 propertyId) external view returns (bool)',

  // Rental events
  'event PropertyListedForRent(uint256 indexed propertyId, address indexed landlord, uint256 monthlyRent, uint256 durationMonths)',
  'event PropertyRented(uint256 indexed propertyId, address indexed tenant, address indexed landlord, uint256 endTime, uint256 faithDeposit)',
  'event RentPaid(uint256 indexed propertyId, address indexed tenant, uint256 amount, uint256 nextDue)',
  'event RentalTerminated(uint256 indexed propertyId, address indexed terminatedBy, string reason)',
  'event RentalExpired(uint256 indexed propertyId, address indexed tenant)',
];

const MARKETPLACE_ABI = [
  'event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price)',
];

// ── Singletons ───────────────────────────────────────────────────────────────

let _provider = null;
let _signer = null;
let _propertyNFT = null;
let _marketplace = null;

function getProvider() {
  if (!_provider) {
    _provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }
  return _provider;
}

function getSigner() {
  if (!_signer) {
    if (!process.env.GOV_PRIVATE_KEY) throw new Error('GOV_PRIVATE_KEY is not set');
    _signer = new ethers.Wallet(process.env.GOV_PRIVATE_KEY, getProvider());
  }
  return _signer;
}

function getPropertyNFT() {
  if (!_propertyNFT) {
    if (!process.env.PROPERTY_NFT_ADDRESS) throw new Error('PROPERTY_NFT_ADDRESS is not set');
    _propertyNFT = new ethers.Contract(
      process.env.PROPERTY_NFT_ADDRESS,
      PROPERTY_NFT_ABI,
      getSigner()
    );
  }
  return _propertyNFT;
}

function getMarketplace() {
  if (!_marketplace) {
    if (!process.env.MARKETPLACE_ADDRESS) throw new Error('MARKETPLACE_ADDRESS is not set');
    _marketplace = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      getProvider()
    );
  }
  return _marketplace;
}

// ── On-chain helpers ─────────────────────────────────────────────────────────

/** Approve a mint request on-chain (calls approveRequest). */
async function mintPropertyOnChain(onChainRequestId) {
  const tx = await getPropertyNFT().approveRequest(onChainRequestId);
  return tx.wait();
}

/** Approve a metadata update request on-chain. */
async function approveUpdateOnChain(propertyId, updateIndex) {
  const tx = await getPropertyNFT().approveUpdateRequest(propertyId, updateIndex);
  return tx.wait();
}

/** Decline a metadata update request on-chain. */
async function declineUpdateOnChain(propertyId, updateIndex, reason) {
  const tx = await getPropertyNFT().declineUpdateRequest(propertyId, updateIndex, reason || '');
  return tx.wait();
}

/** Returns the current on-chain metadata hash for a token (64-char hex, no 0x). */
async function getOnChainHash(tokenId) {
  const [metadataHash] = await getPropertyNFT().getLatestHashes(tokenId);
  return metadataHash.slice(2).toLowerCase();
}

/** Returns the full on-chain version history for a token. */
async function getOnChainVersionHistory(tokenId) {
  const versions = await getPropertyNFT().getMetadataVersions(tokenId);
  return versions.map((v) => ({
    versionNo: Number(v.versionNo),
    metadataHash: v.metadataHash.slice(2).toLowerCase(),
    timestamp: Number(v.timestamp),
  }));
}

/**
 * Returns a map of tokenId → { isForSale, isForRent } for every on-chain property.
 * Used for analytics since isForSale lives only on-chain.
 */
async function getOnChainListingStatusMap() {
  const contract = getPropertyNFT();
  const total = Number(await contract.getTotalProperties());
  const map = {};
  for (let i = 0; i < total; i++) {
    try {
      const raw = await contract.properties(i);
      const details = raw.details ?? raw[2];
      map[String(i)] = { isForSale: Boolean(details.isForSale ?? details[4]), isForRent: false };
    } catch (err) {
      console.error(`[chain] getOnChainListingStatusMap: failed on property ${i}`, err.message);
    }
  }
  return map;
}

// ── Marketplace event listener ───────────────────────────────────────────────

/**
 * Start listening for PropertySold events and keep ownerWallet in sync.
 * Call once at startup (index.js), passing the Prisma instance.
 * @param {import('@prisma/client').PrismaClient} prisma
 */
function startMarketplaceListener(prisma) {
  const marketplace = getMarketplace();
  marketplace.on('PropertySold', async (propertyId, _from, to) => {
    const id = propertyId.toString();
    console.log(`[chain] PropertySold: token ${id} → ${to}`);
    try {
      await prisma.property.update({
        where: { tokenId: id },
        data: { ownerWallet: to.toLowerCase() },
      });
      console.log(`[db] Updated owner of token ${id} to ${to}`);
    } catch (err) {
      console.error(`[db] Failed to update owner for token ${id}:`, err.message);
    }
  });
  console.log('[chain] Marketplace event listener started');
}

module.exports = {
  getProvider,
  getSigner,
  getPropertyNFT,
  getMarketplace,
  mintPropertyOnChain,
  approveUpdateOnChain,
  declineUpdateOnChain,
  getOnChainHash,
  getOnChainVersionHistory,
  getOnChainListingStatusMap,
  startMarketplaceListener,
};
