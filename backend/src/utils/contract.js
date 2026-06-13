// src/utils/contract.js
// Ethers v6 singleton provider, signer, and contract instance.
// Uses the government wallet private key to submit on-chain admin transactions.
// NEVER import this in the frontend — it uses the government private key.

const { ethers } = require('ethers');

// ── Full ABI (mirrors RealEstate.sol) ────────────────────────────────────────

const PROPERTY_NFT_ABI = [
  // ── Admin ──
  'function approveRequest(uint256 requestId) external',
  'function declineRequest(uint256 requestId, string reason) external',
  'function approveUpdateRequest(uint256 propertyId, uint256 updateIndex) external',
  'function declineUpdateRequest(uint256 propertyId, uint256 updateIndex, string reason) external',
  'function addAdmin(address account) external',
  'function setCommission(uint256 percent) external',
  'function setPlatformRestricted(bool restricted) external',

  // ── Update requests ──
  'function getUpdateRequests(uint256 propertyId) external view returns (tuple(uint256 id, uint256 propertyId, address requester, bytes32 newMetadataHash, bytes32 newImagesRootHash, bytes32 newDocumentsRootHash, uint8 status, string declineReason, uint256 timestamp)[])',

  // ── View ──
  'function getLatestHashes(uint256 propertyId) external view returns (bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash)',
  'function getMetadataVersions(uint256 propertyId) external view returns (tuple(bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 timestamp, uint256 versionNo)[])',
  'function getOwnershipHistory(uint256 propertyId) external view returns (tuple(address from, address to, uint256 price, uint256 timestamp)[])',
  'function isAdmin(address account) external view returns (bool)',
  'function getTotalProperties() external view returns (uint256)',
  'function getTotalRequests() external view returns (uint256)',
  'function commissionPercent() external view returns (uint256)',
  'function governmentWallet() external view returns (address)',

  // properties(id) → full struct (includes isForRent field)
  'function properties(uint256) external view returns (uint256 id, address owner, tuple(string name, string location, string propertyType, uint256 price, bool isForSale, bool isForRent, bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 bedrooms, uint256 bathrooms, uint256 sqft, uint256 parking, uint256 floors, uint256 yearBuilt) details)',

  'function requests(uint256) external view returns (uint256 id, address requester, tuple(string name, string location, string propertyType, uint256 price, bool isForSale, bool isForRent, bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 bedrooms, uint256 bathrooms, uint256 sqft, uint256 parking, uint256 floors, uint256 yearBuilt) details, uint8 status, string declineReason)',

  'function isRented(uint256 propertyId) external view returns (bool)',

  // ── Rental ──
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
  'function getRentalHistory(uint256 propertyId) external view returns (tuple(uint256 propertyId, address tenant, address landlord, uint256 monthlyRent, uint256 faithDeposit, uint256 startTime, uint256 endTime, uint256 nextPaymentDue, uint256 durationMonths, uint8 status)[])',
  'function getRentDue(uint256 propertyId) external view returns (uint256)',
  'function isInDefaultPeriod(uint256 propertyId) external view returns (bool)',
  'function isInTerminationWindow(uint256 propertyId) external view returns (bool)',

  // ── Events ──
  'event RequestSubmitted(uint256 indexed requestId, address requester, string name)',
  'event RequestApproved(uint256 indexed requestId, uint256 propertyId)',
  'event RequestDeclined(uint256 indexed requestId, string reason)',
  'event PropertyListed(uint256 indexed propertyId, uint256 price)',
  'event PropertyUnlisted(uint256 indexed propertyId)',
  'event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price)',
  'event MetadataUpdated(uint256 indexed propertyId, uint256 versionNo, bytes32 metadataHash)',
  'event PropertyListedForRent(uint256 indexed propertyId, address indexed landlord, uint256 monthlyRent, uint256 durationMonths)',
  'event PropertyUnlistedFromRent(uint256 indexed propertyId)',
  'event PropertyRented(uint256 indexed propertyId, address indexed tenant, address indexed landlord, uint256 endTime, uint256 faithDeposit)',
  'event RentPaid(uint256 indexed propertyId, address indexed tenant, uint256 amount, uint256 nextDue)',
  'event RentalTerminated(uint256 indexed propertyId, address indexed terminatedBy, string reason)',
  'event RentalExpired(uint256 indexed propertyId, address indexed tenant)',
  'event FaithDepositReturned(uint256 indexed propertyId, address indexed tenant, uint256 amount)',
  'event FaithDepositKept(uint256 indexed propertyId, address indexed landlord, uint256 amount)',
];

// ── Singletons ───────────────────────────────────────────────────────────────

let _provider = null;
let _signer = null;
let _propertyNFT = null;

function getProvider() {
  if (!_provider) {
    if (!process.env.RPC_URL) throw new Error('RPC_URL is not set');
    // ethers v6: JsonRpcProvider (no longer under ethers.providers.*)
    _provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }
  return _provider;
}

function getSigner() {
  if (!_signer) {
    if (!process.env.GOV_PRIVATE_KEY) throw new Error('GOV_PRIVATE_KEY is not set');
    // ethers v6: Wallet constructor is the same
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

// ── On-chain helpers ─────────────────────────────────────────────────────────

/**
 * Approve a mint request on-chain (calls approveRequest).
 * @param {number|string} onChainRequestId
 */
async function mintPropertyOnChain(onChainRequestId) {
  const tx = await getPropertyNFT().approveRequest(onChainRequestId);
  const receipt = await tx.wait();
  // ethers v6: receipt.logs instead of receipt.events — parse manually
  receipt.events = _parseReceiptLogs(receipt);
  return receipt;
}

/**
 * Approve a metadata update request on-chain.
 */
async function approveUpdateOnChain(propertyId, updateIndex) {
  const tx = await getPropertyNFT().approveUpdateRequest(propertyId, updateIndex);
  const receipt = await tx.wait();
  receipt.events = _parseReceiptLogs(receipt);
  return receipt;
}

/**
 * Decline a metadata update request on-chain.
 */
async function declineUpdateOnChain(propertyId, updateIndex, reason) {
  const tx = await getPropertyNFT().declineUpdateRequest(propertyId, updateIndex, reason || '');
  return tx.wait();
}

/**
 * Returns the current on-chain metadata hash for a token (64-char hex, no 0x).
 */
async function getOnChainHash(tokenId) {
  const [metadataHash] = await getPropertyNFT().getLatestHashes(tokenId);
  return metadataHash.slice(2).toLowerCase();
}

/**
 * Returns the full on-chain version history for a token.
 */
async function getOnChainVersionHistory(tokenId) {
  const versions = await getPropertyNFT().getMetadataVersions(tokenId);
  return versions.map((v) => ({
    versionNo:    Number(v.versionNo),
    metadataHash: v.metadataHash.slice(2).toLowerCase(),
    timestamp:    Number(v.timestamp),
  }));
}

/**
 * Returns a map of tokenId → { isForSale, isForRent } for every on-chain property.
 * Used for analytics since listing flags live only on-chain.
 */
async function getOnChainListingStatusMap() {
  const contract = getPropertyNFT();
  const total = Number(await contract.getTotalProperties());
  const map = {};
  for (let i = 0; i < total; i++) {
    try {
      const raw = await contract.properties(i);
      // ethers v6 returns named fields directly
      const details = raw.details ?? raw[2];
      map[String(i)] = {
        isForSale: Boolean(details.isForSale ?? details[4]),
        isForRent:  Boolean(details.isForRent  ?? details[5]),
      };
    } catch (err) {
      console.error(`[chain] getOnChainListingStatusMap: failed on property ${i}`, err.message);
    }
  }
  return map;
}

// ── PropertySold event listener ──────────────────────────────────────────────

/**
 * Start listening for PropertySold events and keep ownerWallet in sync.
 * Call once at startup (index.js), passing the Prisma instance.
 * @param {import('@prisma/client').PrismaClient} prisma
 */
function startMarketplaceListener(prisma) {
  const contract = getPropertyNFT();

  // ethers v6: contract.on() still works the same way
  contract.on('PropertySold', async (propertyId, _from, to) => {
    const id = propertyId.toString();
    console.log(`[chain] PropertySold: token ${id} → ${to}`);
    try {
      await prisma.property.update({
        where:  { tokenId: id },
        data:   { ownerWallet: to.toLowerCase() },
      });
      console.log(`[db] Updated owner of token ${id} to ${to}`);
    } catch (err) {
      console.error(`[db] Failed to update owner for token ${id}:`, err.message);
    }
  });

  console.log('[chain] PropertySold event listener started');
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * ethers v6 removed receipt.events[] — parse logs manually using the contract interface.
 * Returns an array shaped like ethers v5 events so existing callers don't break.
 * Uses the already-initialized _propertyNFT instance (never calls getPropertyNFT() here
 * to avoid any risk of re-entry before the singleton is ready).
 */
function _parseReceiptLogs(receipt) {
  if (!_propertyNFT) return [];
  const iface = _propertyNFT.interface;
  const parsed = [];
  for (const log of receipt.logs || []) {
    try {
      const desc = iface.parseLog(log);
      if (desc) {
        parsed.push({
          event: desc.name,
          args:  desc.args,
          ...log,
        });
      }
    } catch (_) {
      // log from a different contract — ignore
    }
  }
  return parsed;
}

module.exports = {
  getProvider,
  getSigner,
  getPropertyNFT,
  mintPropertyOnChain,
  approveUpdateOnChain,
  declineUpdateOnChain,
  getOnChainHash,
  getOnChainVersionHistory,
  getOnChainListingStatusMap,
  startMarketplaceListener,
};
