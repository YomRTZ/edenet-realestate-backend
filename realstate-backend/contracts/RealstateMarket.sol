// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RealEstateMarket is ERC721 {
    uint256 public propertyCount;

    struct Property {
        uint256 id;
        address payable currentOwner;
        uint256 buyPrice;      // Price to buy (0 if not for sale)
        uint256 rentPriceRate; // Price per day to rent (0 if not for rent)
        address currentTenant;
        uint256 rentExpires;   // Timestamp when rent ends
        bool isForSale;
        bool isForRent;
    }

    mapping(uint256 => Property) public properties;

    event PropertyListed(uint256 indexed id, uint256 buyPrice, uint256 rentPriceRate);
    event PropertyBought(uint256 indexed id, address indexed buyer, address indexed seller, uint256 price);
    event PropertyRented(uint256 indexed id, address indexed tenant, uint256 duration, uint256 cost);

    constructor() ERC721("Real Estate Property Deed", "DEED") {}

    // List a property on the marketplace
    function listProperty(uint256 _buyPrice, uint256 _rentPriceRate, bool _isForSale, bool _isForRent) external {
        propertyCount++;
        _mint(msg.sender, propertyCount);

        properties[propertyCount] = Property({
            id: propertyCount,
            currentOwner: payable(msg.sender),
            buyPrice: _buyPrice,
            rentPriceRate: _rentPriceRate,
            currentTenant: address(0),
            rentExpires: 0,
            isForSale: _isForSale,
            isForRent: _isForRent
        });

        emit PropertyListed(propertyCount, _buyPrice, _rentPriceRate);
    }

    // Purchase permanent ownership of a property
    function buyProperty(uint256 _id) external payable {
        Property storage property = properties[_id];
        require(property.isForSale, "Property not for sale");
        require(msg.value >= property.buyPrice, "Insufficient funds sent");
        require(block.timestamp > property.rentExpires, "Property is currently occupied by a tenant");

        address payable seller = property.currentOwner;
        
        // Update ownership state
        property.currentOwner = payable(msg.sender);
        property.isForSale = false; // Delist after purchase

        // Transfer funds and NFT deed
        seller.transfer(msg.value);
        _transfer(seller, msg.sender, _id);

        emit PropertyBought(_id, msg.sender, seller, msg.value);
    }

    // Rent a property for a specific number of days
    function rentProperty(uint256 _id, uint256 _days) external payable {
        Property storage property = properties[_id];
        require(property.isForRent, "Property not for rent");
        require(block.timestamp > property.rentExpires, "Property is already active in a lease");
        
        uint256 totalCost = property.rentPriceRate * _days;
        require(msg.value >= totalCost, "Insufficient rent funds sent");

        // Assign tenancy rules
        property.currentTenant = msg.sender;
        property.rentExpires = block.timestamp + (_days * 1 days);

        // Send rent payment immediately to the property owner
        property.currentOwner.transfer(msg.value);

        emit PropertyRented(_id, msg.sender, _days, msg.value);
    }

    // Helper helper to check if a property is currently rented out
    function isCurrentlyRented(uint256 _id) external view returns (bool) {
        return (properties[_id].currentTenant != address(0) && block.timestamp <= properties[_id].rentExpires);
    }
}
