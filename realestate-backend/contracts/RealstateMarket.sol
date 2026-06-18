// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RealEstateMarket is ERC721 {
    address public governmentAdmin;
    uint256 public propertyCount;

    struct Property {
        uint256 id;
        address payable currentOwner;
        address originalRegistrant;
        uint256 buyPrice;      
        uint256 rentPriceRate; 
        address currentTenant;
        uint256 rentExpires;   
        bool isForSale;
        bool isForRent;
        bytes32 metadataHash;
        bytes32 imagesRootHash;
        bytes32 documentsRootHash;
    }

    mapping(uint256 => Property) public properties;

    // ─── DECLARE ALL EVENTS HERE ───
    event PropertyApproved(uint256 indexed id, address indexed owner, bytes32 indexed metadataHash);
    event PropertyBought(uint256 indexed id, address indexed buyer, address indexed seller, uint256 price);
    event PropertyRented(uint256 indexed id, address indexed tenant, uint256 duration, uint256 cost); // Fixed declaration placeholder

    modifier onlyGovernment() {
        require(msg.sender == governmentAdmin, "Unauthorized: Only Government Admin can authorize listings");
        _;
    }

    constructor() ERC721("Real Estate Property Deed", "DEED") {
        governmentAdmin = msg.sender;
    }

    function approveAndMintProperty(
        address payable _ownerAddress,
        uint256 _buyPrice, 
        uint256 _rentPriceRate, 
        bool _isForSale, 
        bool _isForRent,
        bytes32 _metadataHash,
        bytes32 _imagesRootHash,
        bytes32 _documentsRootHash
    ) external onlyGovernment returns (uint256) {
        propertyCount++;
        _mint(_ownerAddress, propertyCount);

        properties[propertyCount] = Property({
            id: propertyCount,
            currentOwner: _ownerAddress,
            originalRegistrant: _ownerAddress,
            buyPrice: _buyPrice,
            rentPriceRate: _rentPriceRate,
            currentTenant: address(0),
            rentExpires: 0,
            isForSale: _isForSale,
            isForRent: _isForRent,
            metadataHash: _metadataHash,
            imagesRootHash: _imagesRootHash,
            documentsRootHash: _documentsRootHash
        });

        emit PropertyApproved(propertyCount, _ownerAddress, _metadataHash);
        return propertyCount;
    }

    function buyProperty(uint256 _id) external payable {
        Property storage property = properties[_id];
        require(property.isForSale, "Property not for sale");
        require(msg.value >= property.buyPrice, "Insufficient funds sent");
        require(block.timestamp > property.rentExpires, "Property is currently occupied by a tenant");

        address payable seller = property.currentOwner;
        property.currentOwner = payable(msg.sender);
        property.isForSale = false; 

        seller.transfer(msg.value);
        _transfer(seller, msg.sender, _id);

        emit PropertyBought(_id, msg.sender, seller, msg.value);
    }

    function rentProperty(uint256 _id, uint256 _days) external payable {
        Property storage property = properties[_id];
        require(property.isForRent, "Property not for rent");
        require(block.timestamp > property.rentExpires, "Property is already active in a lease");
        
        uint256 totalCost = property.rentPriceRate * _days;
        require(msg.value >= totalCost, "Insufficient rent funds sent");

        property.currentTenant = msg.sender;
        property.rentExpires = block.timestamp + (_days * 1 days);
        property.currentOwner.transfer(msg.value);

        // This line will compile cleanly now that the event is declared above
        emit PropertyRented(_id, msg.sender, _days, msg.value);
    }

    function isCurrentlyRented(uint256 _id) external view returns (bool) {
        return (properties[_id].currentTenant != address(0) && block.timestamp <= properties[_id].rentExpires);
    }
}
