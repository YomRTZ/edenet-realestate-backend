// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RealEstate is ERC721, AccessControl {

    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ============ COUNTERS ============
    uint256 private _propertyIdCounter;
    uint256 private _requestIdCounter;
    uint256 private _updateRequestIdCounter;

    // ============ COMMISSION ============
    uint256 public commissionPercent = 2;
    address public governmentWallet;
    bool public platformRestricted = true;

    // ============ STRUCTS ============

    struct PropertyDetails {
        string name;
        string location;
        string propertyType;
        uint256 price;
        bool isForSale;
        bool isForRent;            // rental listing flag
        // ── CHANGED: replaced string ipfsHash with three bytes32 hash fields ──
        bytes32 metadataHash;      // SHA-256 of the property metadata JSON
        bytes32 imagesRootHash;    // Merkle root of all image hashes
        bytes32 documentsRootHash; // Merkle root of all document hashes
        // ─────────────────────────────────────────────────────────────────────
        uint256 bedrooms;
        uint256 bathrooms;
        uint256 sqft;
        uint256 parking;
        uint256 floors;
        uint256 yearBuilt;
    }

    struct Property {
        uint256 id;
        address owner;
        PropertyDetails details;
    }

    struct RentalListing {
        uint256 monthlyRent;     // in wei
        uint256 durationMonths;  // contract length
        bool active;
    }

    struct RentalAgreement {
        uint256 propertyId;
        address tenant;
        address landlord;
        uint256 monthlyRent;
        uint256 faithDeposit;
        uint256 startTime;
        uint256 endTime;
        uint256 nextPaymentDue;
        uint256 durationMonths;
        RentalStatus status;
    }

    struct PropertyRequest {
        uint256 id;
        address requester;
        PropertyDetails details;
        RequestStatus status;
        string declineReason;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint256 price;
        uint256 timestamp;
    }

    // ── CHANGED: replaced string newIpfsHash with three bytes32 hash fields ──
    struct UpdateRequest {
        uint256 id;
        uint256 propertyId;
        address requester;
        bytes32 newMetadataHash;
        bytes32 newImagesRootHash;
        bytes32 newDocumentsRootHash;
        UpdateStatus status;
        string declineReason;
        uint256 timestamp;
    }

    // ── CHANGED: version history now stores a full hash snapshot, not just a string ──
    struct MetadataVersion {
        bytes32 metadataHash;
        bytes32 imagesRootHash;
        bytes32 documentsRootHash;
        uint256 timestamp;
        uint256 versionNo;
    }

    // ============ ENUMS ============
    enum RequestStatus { Pending, Approved, Declined }
    enum UpdateStatus  { Pending, Approved, Declined }
    enum RentalStatus  { ACTIVE, ENDED, DEFAULTED }

    // ============ CONSTANTS ============
    uint256 public constant GRACE_PERIOD = 7 days;
    uint256 public constant LATE_PENALTY_BPS = 500;       // 5%
    uint256 public constant TERMINATION_WINDOW_BPS = 1000; // 10%
    uint256 public constant PERIOD = 30 days;

    // ============ MAPPINGS ============
    mapping(uint256 => Property) public properties;
    mapping(uint256 => PropertyRequest) public requests;
    mapping(uint256 => OwnershipRecord[]) public ownershipHistory;
    // ── CHANGED: was mapping(uint256 => string[]), now stores full snapshots ──
    mapping(uint256 => MetadataVersion[]) public metadataVersions;
    mapping(uint256 => UpdateRequest[]) public updateRequests;
    // ── RENTAL ──
    mapping(uint256 => RentalListing) public rentalListings;
    mapping(uint256 => RentalAgreement) public rentalAgreements;
    mapping(uint256 => bool) public isRented;
    mapping(uint256 => RentalAgreement[]) public rentalHistory;

    // ============ EVENTS ============
    event RequestSubmitted(uint256 indexed requestId, address requester, string name);
    event RequestApproved(uint256 indexed requestId, uint256 propertyId);
    event RequestDeclined(uint256 indexed requestId, string reason);
    event PropertyListed(uint256 indexed propertyId, uint256 price);
    event PropertyUnlisted(uint256 indexed propertyId);
    event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price);
    // ── NEW: emitted when a metadata update is approved (backend listens to this) ──
    event MetadataUpdated(uint256 indexed propertyId, uint256 versionNo, bytes32 metadataHash);
    // ── RENTAL EVENTS ──
    event PropertyListedForRent(uint256 indexed propertyId, address indexed landlord, uint256 monthlyRent, uint256 durationMonths);
    event PropertyUnlistedFromRent(uint256 indexed propertyId);
    event PropertyRented(uint256 indexed propertyId, address indexed tenant, address indexed landlord, uint256 endTime, uint256 faithDeposit);
    event RentPaid(uint256 indexed propertyId, address indexed tenant, uint256 amount, uint256 nextDue);
    event RentalTerminated(uint256 indexed propertyId, address indexed terminatedBy, string reason);
    event RentalExpired(uint256 indexed propertyId, address indexed tenant);
    event FaithDepositReturned(uint256 indexed propertyId, address indexed tenant, uint256 amount);
    event FaithDepositKept(uint256 indexed propertyId, address indexed landlord, uint256 amount);

    // ============ CONSTRUCTOR ============
    constructor(address _governmentWallet) ERC721("RealEstateNFT", "RENFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        governmentWallet = _governmentWallet;
    }

    // ============ CITIZEN FUNCTIONS ============

    // ── CHANGED: details now carries bytes32 hashes instead of string ipfsHash ──
    // The frontend calls the backend first to get the three hashes,
    // then passes them here inside the details struct.
    function submitRequest(PropertyDetails memory details) public {
        uint256 requestId = _requestIdCounter;
        _requestIdCounter++;

        details.price = details.price * 1 ether;

        requests[requestId] = PropertyRequest({
            id: requestId,
            requester: msg.sender,
            details: details,
            status: RequestStatus.Pending,
            declineReason: ""
        });

        emit RequestSubmitted(requestId, msg.sender, details.name);
    }

    function listProperty(uint256 propertyId, uint256 priceInEther) public {
        require(ownerOf(propertyId) == msg.sender, "You don't own this property");
        require(priceInEther > 0, "Price must be greater than 0");
        require(!isRented[propertyId], "Cannot sell while rented");
        require(!properties[propertyId].details.isForRent, "Unlist from rent first");
        properties[propertyId].details.isForSale = true;
        properties[propertyId].details.price = priceInEther * 1 ether;
        emit PropertyListed(propertyId, priceInEther * 1 ether);
    }

    function unlistProperty(uint256 propertyId) public {
        require(ownerOf(propertyId) == msg.sender, "You don't own this property");
        require(properties[propertyId].details.isForSale, "Property is not listed for sale");
        require(!isRented[propertyId], "Cannot unlist while rented");

        properties[propertyId].details.isForSale = false;
        emit PropertyUnlisted(propertyId);
    }

    function buyProperty(uint256 propertyId) public payable {
        Property storage property = properties[propertyId];
        address seller = ownerOf(propertyId);

        require(property.details.isForSale, "Property is not for sale");
        require(!isRented[propertyId], "Cannot buy a rented property");
        require(msg.sender != seller, "You already own this property");
        require(msg.value >= property.details.price, "Insufficient funds sent");

        uint256 commission = (msg.value * commissionPercent) / 100;
        uint256 sellerAmount = msg.value - commission;

        this.platformTransfer(seller, msg.sender, propertyId);

        payable(seller).transfer(sellerAmount);
        payable(governmentWallet).transfer(commission);

        ownershipHistory[propertyId].push(OwnershipRecord({
            from: seller,
            to: msg.sender,
            price: msg.value,
            timestamp: block.timestamp
        }));

        property.details.isForSale = false;
        property.owner = msg.sender;

        emit PropertySold(propertyId, seller, msg.sender, msg.value);
    }

    function platformTransfer(address from, address to, uint256 tokenId) external {
        require(msg.sender == address(this), "Only platform allowed");
        _transfer(from, to, tokenId);
    }

    // ============ ADMIN FUNCTIONS ============

    function approveRequest(uint256 requestId) public onlyRole(ADMIN_ROLE) {
        PropertyRequest storage request = requests[requestId];
        require(request.status == RequestStatus.Pending, "Request is not pending");

        request.status = RequestStatus.Approved;

        uint256 propertyId = _propertyIdCounter;
        _propertyIdCounter++;

        _safeMint(request.requester, propertyId);

        properties[propertyId] = Property({
            id: propertyId,
            owner: request.requester,
            details: request.details
        });

        ownershipHistory[propertyId].push(OwnershipRecord({
            from: address(0),
            to: request.requester,
            price: 0,
            timestamp: block.timestamp
        }));

        // ── NEW: store the initial hash snapshot as version 1 ──
        metadataVersions[propertyId].push(MetadataVersion({
            metadataHash:      request.details.metadataHash,
            imagesRootHash:    request.details.imagesRootHash,
            documentsRootHash: request.details.documentsRootHash,
            timestamp:         block.timestamp,
            versionNo:         1
        }));

        emit RequestApproved(requestId, propertyId);
    }

    function declineRequest(uint256 requestId, string memory reason) public onlyRole(ADMIN_ROLE) {
        PropertyRequest storage request = requests[requestId];
        require(request.status == RequestStatus.Pending, "Request is not pending");
        request.status = RequestStatus.Declined;
        request.declineReason = reason;
        emit RequestDeclined(requestId, reason);
    }

    function addAdmin(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, account);
    }

    function setCommission(uint256 percent) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(percent <= 10, "Commission too high");
        commissionPercent = percent;
    }

    // ============ UPDATE FUNCTIONS ============

    // ── CHANGED: takes 3 bytes32 hashes instead of a single string ipfsHash ──
    function submitUpdateRequest(
        uint256 propertyId,
        bytes32 newMetadataHash,
        bytes32 newImagesRootHash,
        bytes32 newDocumentsRootHash
    ) public {
        require(ownerOf(propertyId) == msg.sender, "You don't own this property");

        uint256 updateId = _updateRequestIdCounter;
        _updateRequestIdCounter++;

        updateRequests[propertyId].push(UpdateRequest({
            id:                   updateId,
            propertyId:           propertyId,
            requester:            msg.sender,
            newMetadataHash:      newMetadataHash,
            newImagesRootHash:    newImagesRootHash,
            newDocumentsRootHash: newDocumentsRootHash,
            status:               UpdateStatus.Pending,
            declineReason:        "",
            timestamp:            block.timestamp
        }));
    }

    // ── CHANGED: applies the 3 new hashes and saves old snapshot to version history ──
    function approveUpdateRequest(uint256 propertyId, uint256 updateIndex) public onlyRole(ADMIN_ROLE) {
        UpdateRequest storage request = updateRequests[propertyId][updateIndex];
        require(request.status == UpdateStatus.Pending, "Not pending");

        request.status = UpdateStatus.Approved;

        uint256 newVersionNo = metadataVersions[propertyId].length + 1;

        // Save old hashes to version history before overwriting
        metadataVersions[propertyId].push(MetadataVersion({
            metadataHash:      request.newMetadataHash,
            imagesRootHash:    request.newImagesRootHash,
            documentsRootHash: request.newDocumentsRootHash,
            timestamp:         block.timestamp,
            versionNo:         newVersionNo
        }));

        // Apply new hashes to the live property
        properties[propertyId].details.metadataHash      = request.newMetadataHash;
        properties[propertyId].details.imagesRootHash    = request.newImagesRootHash;
        properties[propertyId].details.documentsRootHash = request.newDocumentsRootHash;

        emit MetadataUpdated(propertyId, newVersionNo, request.newMetadataHash);
    }

    function declineUpdateRequest(uint256 propertyId, uint256 updateIndex, string memory reason) public onlyRole(ADMIN_ROLE) {
        UpdateRequest storage request = updateRequests[propertyId][updateIndex];
        require(request.status == UpdateStatus.Pending, "Not pending");
        request.status = UpdateStatus.Declined;
        request.declineReason = reason;
    }

    // ============ VIEW FUNCTIONS ============

    function getTotalProperties() public view returns (uint256) {
        return _propertyIdCounter;
    }

    function getTotalRequests() public view returns (uint256) {
        return _requestIdCounter;
    }

    function getOwnershipHistory(uint256 propertyId) public view returns (OwnershipRecord[] memory) {
        return ownershipHistory[propertyId];
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function getUpdateRequests(uint256 propertyId) public view returns (UpdateRequest[] memory) {
        return updateRequests[propertyId];
    }

    // ── CHANGED: returns MetadataVersion[] instead of string[] ──
    function getMetadataVersions(uint256 propertyId) public view returns (MetadataVersion[] memory) {
        return metadataVersions[propertyId];
    }

    // ── NEW: get just the latest hashes for a property (used by verify route) ──
    function getLatestHashes(uint256 propertyId) public view returns (
        bytes32 metadataHash,
        bytes32 imagesRootHash,
        bytes32 documentsRootHash
    ) {
        PropertyDetails storage d = properties[propertyId].details;
        return (d.metadataHash, d.imagesRootHash, d.documentsRootHash);
    }

    // ============ RENTAL FUNCTIONS ============

    function listForRent(
        uint256 propertyId,
        uint256 monthlyRentInEther,
        uint256 durationMonths
    ) public {
        require(ownerOf(propertyId) == msg.sender, "Not property owner");
        require(!properties[propertyId].details.isForSale, "Listed for sale");
        require(!isRented[propertyId], "Currently rented");
        require(monthlyRentInEther > 0, "Rent must be > 0");
        require(durationMonths > 0 && durationMonths <= 60, "Duration 1-60 months");

        rentalListings[propertyId] = RentalListing({
            monthlyRent: monthlyRentInEther * 1 ether,
            durationMonths: durationMonths,
            active: true
        });

        properties[propertyId].details.isForRent = true;
        emit PropertyListedForRent(propertyId, msg.sender, monthlyRentInEther * 1 ether, durationMonths);
    }

    function unlistFromRent(uint256 propertyId) public {
        require(ownerOf(propertyId) == msg.sender, "Not property owner");
        require(!isRented[propertyId], "Cannot unlist while rented");

        rentalListings[propertyId].active = false;
        properties[propertyId].details.isForRent = false;
        emit PropertyUnlistedFromRent(propertyId);
    }

    function rentProperty(uint256 propertyId) public payable {
        require(properties[propertyId].details.isForRent, "Not listed for rent");
        require(!isRented[propertyId], "Already rented");
        require(msg.sender != ownerOf(propertyId), "Owner cannot rent own property");

        RentalListing memory listing = rentalListings[propertyId];
        require(listing.active, "Rental listing not active");

        uint256 faithDeposit = listing.monthlyRent;
        uint256 totalDue = listing.monthlyRent + faithDeposit;
        require(msg.value >= totalDue, "Insufficient payment");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (listing.durationMonths * PERIOD);
        address landlord = ownerOf(propertyId);

        rentalAgreements[propertyId] = RentalAgreement({
            propertyId: propertyId,
            tenant: msg.sender,
            landlord: landlord,
            monthlyRent: listing.monthlyRent,
            faithDeposit: faithDeposit,
            startTime: startTime,
            endTime: endTime,
            nextPaymentDue: startTime + PERIOD,
            durationMonths: listing.durationMonths,
            status: RentalStatus.ACTIVE
        });

        isRented[propertyId] = true;
        properties[propertyId].details.isForRent = false;
        rentalListings[propertyId].active = false;

        payable(landlord).transfer(listing.monthlyRent);

        if (msg.value > totalDue) {
            payable(msg.sender).transfer(msg.value - totalDue);
        }

        emit PropertyRented(propertyId, msg.sender, landlord, endTime, faithDeposit);
    }

    function payRent(uint256 propertyId) public payable {
        RentalAgreement storage agreement = rentalAgreements[propertyId];
        require(agreement.status == RentalStatus.ACTIVE, "No active rental");
        require(msg.sender == agreement.tenant, "Not the tenant");
        require(block.timestamp <= agreement.endTime, "Contract expired");

        uint256 baseRent = agreement.monthlyRent;
        uint256 daysLate = 0;

        if (block.timestamp > agreement.nextPaymentDue) {
            daysLate = (block.timestamp - agreement.nextPaymentDue) / 1 days;
        }

        uint256 rentDue = baseRent;
        if (daysLate > 7) {
            rentDue = baseRent + (baseRent * LATE_PENALTY_BPS / 10000);
        }

        require(msg.value >= rentDue, "Insufficient rent payment");

        agreement.nextPaymentDue = agreement.nextPaymentDue + PERIOD;
        payable(agreement.landlord).transfer(rentDue);

        if (msg.value > rentDue) {
            payable(msg.sender).transfer(msg.value - rentDue);
        }

        emit RentPaid(propertyId, msg.sender, rentDue, agreement.nextPaymentDue);
    }

    function terminateRentalAsTenant(uint256 propertyId) public {
        RentalAgreement storage agreement = rentalAgreements[propertyId];
        require(agreement.status == RentalStatus.ACTIVE, "No active rental");
        require(msg.sender == agreement.tenant, "Not the tenant");

        uint256 totalDuration = agreement.endTime - agreement.startTime;
        uint256 tenPercentWindow = totalDuration * TERMINATION_WINDOW_BPS / 10000;
        uint256 remaining = agreement.endTime > block.timestamp ? agreement.endTime - block.timestamp : 0;
        bool inWindow = remaining <= tenPercentWindow;

        agreement.status = RentalStatus.ENDED;
        isRented[propertyId] = false;
        properties[propertyId].details.isForRent = false;
        rentalHistory[propertyId].push(agreement);

        if (inWindow) {
            payable(agreement.tenant).transfer(agreement.faithDeposit);
            emit FaithDepositReturned(propertyId, agreement.tenant, agreement.faithDeposit);
        } else {
            payable(agreement.landlord).transfer(agreement.faithDeposit);
            emit FaithDepositKept(propertyId, agreement.landlord, agreement.faithDeposit);
        }

        emit RentalTerminated(propertyId, msg.sender, inWindow ? "Clean exit" : "Early exit - deposit forfeited");
    }

    function terminateRentalAsLandlord(uint256 propertyId) public {
        RentalAgreement storage agreement = rentalAgreements[propertyId];
        require(agreement.status == RentalStatus.ACTIVE, "No active rental");
        require(msg.sender == agreement.landlord, "Not the landlord");

        uint256 daysSincePaymentDue = 0;
        if (block.timestamp > agreement.nextPaymentDue) {
            daysSincePaymentDue = (block.timestamp - agreement.nextPaymentDue) / 1 days;
        }
        require(daysSincePaymentDue >= 15, "Tenant not in default (need 15+ days overdue)");

        agreement.status = RentalStatus.DEFAULTED;
        isRented[propertyId] = false;
        properties[propertyId].details.isForRent = false;
        rentalHistory[propertyId].push(agreement);

        payable(agreement.landlord).transfer(agreement.faithDeposit);
        emit FaithDepositKept(propertyId, agreement.landlord, agreement.faithDeposit);
        emit RentalTerminated(propertyId, msg.sender, "Tenant default - deposit kept by landlord");
    }

    function terminateRentalAsLandlordNoFault(uint256 propertyId) public {
        RentalAgreement storage agreement = rentalAgreements[propertyId];
        require(agreement.status == RentalStatus.ACTIVE, "No active rental");
        require(msg.sender == agreement.landlord, "Not the landlord");

        uint256 remainingRent = 0;
        if (block.timestamp < agreement.endTime) {
            uint256 remainingSeconds = agreement.endTime - block.timestamp;
            uint256 remainingMonths = remainingSeconds / PERIOD;
            remainingRent = remainingMonths * agreement.monthlyRent;
        }
        uint256 compensation = remainingRent * TERMINATION_WINDOW_BPS / 10000;

        require(
            address(this).balance >= agreement.faithDeposit + compensation,
            "Insufficient contract balance"
        );

        agreement.status = RentalStatus.ENDED;
        isRented[propertyId] = false;
        properties[propertyId].details.isForRent = false;
        rentalHistory[propertyId].push(agreement);

        payable(agreement.tenant).transfer(agreement.faithDeposit + compensation);
        emit FaithDepositReturned(propertyId, agreement.tenant, agreement.faithDeposit);
        emit RentalTerminated(propertyId, msg.sender, "Landlord terminated - no fault - compensation paid");
    }

    function finalizeExpiredRental(uint256 propertyId) public {
        RentalAgreement storage agreement = rentalAgreements[propertyId];
        require(agreement.status == RentalStatus.ACTIVE, "No active rental");
        require(block.timestamp > agreement.endTime, "Contract not yet expired");

        agreement.status = RentalStatus.ENDED;
        isRented[propertyId] = false;
        properties[propertyId].details.isForRent = false;
        rentalHistory[propertyId].push(agreement);

        payable(agreement.tenant).transfer(agreement.faithDeposit);
        emit FaithDepositReturned(propertyId, agreement.tenant, agreement.faithDeposit);
        emit RentalExpired(propertyId, agreement.tenant);
    }

    // ── RENTAL VIEW FUNCTIONS ──

    function getRentalAgreement(uint256 propertyId) external view returns (RentalAgreement memory) {
        return rentalAgreements[propertyId];
    }

    function getRentalHistory(uint256 propertyId) external view returns (RentalAgreement[] memory) {
        return rentalHistory[propertyId];
    }

    function getRentDue(uint256 propertyId) external view returns (uint256) {
        RentalAgreement memory a = rentalAgreements[propertyId];
        if (a.status != RentalStatus.ACTIVE) return 0;
        if (block.timestamp <= a.nextPaymentDue) return a.monthlyRent;
        uint256 daysLate = (block.timestamp - a.nextPaymentDue) / 1 days;
        if (daysLate <= 7) return a.monthlyRent;
        return a.monthlyRent + (a.monthlyRent * LATE_PENALTY_BPS / 10000);
    }

    function isInDefaultPeriod(uint256 propertyId) external view returns (bool) {
        RentalAgreement memory a = rentalAgreements[propertyId];
        if (a.status != RentalStatus.ACTIVE) return false;
        if (block.timestamp <= a.nextPaymentDue) return false;
        return (block.timestamp - a.nextPaymentDue) / 1 days >= 15;
    }

    function isInTerminationWindow(uint256 propertyId) external view returns (bool) {
        RentalAgreement memory a = rentalAgreements[propertyId];
        if (a.status != RentalStatus.ACTIVE) return false;
        uint256 totalDuration = a.endTime - a.startTime;
        uint256 tenPercent = totalDuration * TERMINATION_WINDOW_BPS / 10000;
        uint256 remaining = a.endTime > block.timestamp ? a.endTime - block.timestamp : 0;
        return remaining <= tenPercent;
    }

    function getRentalListing(uint256 propertyId) external view returns (RentalListing memory) {
        return rentalListings[propertyId];
    }

    // ============ PLATFORM RESTRICTION ============

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && platformRestricted) {
            require(
                msg.sender == address(this),
                "Transfers only allowed through official platform"
            );
        }
        return super._update(to, tokenId, auth);
    }

    function setPlatformRestricted(bool restricted) public onlyRole(DEFAULT_ADMIN_ROLE) {
        platformRestricted = restricted;
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
