const propertyRepository = require('../repositories/property.repository');
const { hashBuffer } = require('../crypto/hash.service');
const { computeRootHash } = require('../crypto/merkle.service');
const { hashMetadata } = require('../crypto/metadataHash.service');

class PropertyService {
  async processAndRegisterProperty(fields, files) {
    // 1. Core Cryptographic hashing computation over uploaded images arrays
    const imageFiles = files['images'] || [];
    const imageHashes = imageFiles.map(img => hashBuffer(img.buffer));
    const imagesRootHash = computeRootHash(imageHashes);

    // 2. Core Cryptographic hashing computation over uploaded documents arrays
    const docFiles = files['documents'] || [];
    const docHashes = docFiles.map(doc => hashBuffer(doc.buffer));
    const documentsRootHash = computeRootHash(docHashes);

    // 3. Map Canonical structural schema blueprint object
    const canonicalMetadata = {
      title: fields.title,
      description: fields.description || '',
      propertyType: fields.property_type,
      listingType: fields.listing_type,
      price: fields.price, // Handled as string representation for Web3 Wei parameters
      bedrooms: parseInt(fields.bedrooms) || 0,
      bathrooms: parseInt(fields.bathrooms) || 0,
      areaSize: parseInt(fields.area_size) || 0,
      lotSize: parseInt(fields.lot_size) || 0,
      parkingSpots: parseInt(fields.parking_spots) || 0,
      yearBuilt: parseInt(fields.year_built) || 0,
      propertyTax: parseFloat(fields.property_tax) || 0,
      hoaFees: parseFloat(fields.hoa_fees) || 0,
      city: fields.city,
      state: fields.state,
      zipCode: fields.zip_code,
      country: fields.country,
      petPolicy: fields.pet_policy || '',
      isFurnished: fields.is_furnished === 'true',
      imagesRootHash,
      documentsRootHash
    };

    // 4. Resolve global target unique identifying tracking code hash signature
    const metadataHash = hashMetadata(canonicalMetadata);

    // 5. Structure storage file inputs
    const filePayloads = [
      ...imageFiles.map((file, i) => ({
        type: 'IMAGE',
        fileName: file.originalname,
        fileUrl: `/uploads/images/${Date.now()}_${file.originalname}`,
        sha256Hash: imageHashes[i]
      })),
      ...docFiles.map((file, i) => ({
        type: 'DOCUMENT',
        fileName: file.originalname,
        fileUrl: `/uploads/docs/${Date.now()}_${file.originalname}`,
        sha256Hash: docHashes[i]
      }))
    ];

    // 6. Build persistent entry payload structure
    const dbPayload = {
      ...canonicalMetadata,
      tokenId: `PENDING-${Date.now()}`,
      ownerWallet: fields.ownerWallet || '0x0000000000000000000000000000000000000000',
      status: 'PENDING',
      metadataHash
    };

    const savedProperty = await propertyRepository.createWithFilesTx(dbPayload, filePayloads);

    return {
      propertyId: savedProperty.id,
      metadataHash,
      imagesRootHash,
      documentsRootHash
    };
  }
}

module.exports = new PropertyService();
