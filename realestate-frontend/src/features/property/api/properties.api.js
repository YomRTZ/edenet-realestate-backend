import { api } from '../../../lib/axios';

export const propertiesApi = {
  /**
   * 1. Citizen submits raw property data fields and files.
   * Sends a multipart/form-data payload.
   * @param {FormData} formData 
   * @returns {Promise<Object>} Cryptographic hashes and assigned propertyId
   */
  createProperty: async (formData) => {
    // Log request summary to debug POST /properties 500s
    try {
      const entries = Array.from(formData.entries());
      const summary = entries.reduce((acc, [k, v]) => {
        acc[k] = acc[k] || [];
        acc[k].push(v);
        return acc;
      }, {});
      console.log('[Frontend propertiesApi.createProperty] payload summary', {
        keys: Object.keys(summary),
        title: summary.title && summary.title[0],
        property_type: summary.property_type && summary.property_type[0],
        listing_type: summary.listing_type && summary.listing_type[0],
        price: summary.price && summary.price[0],
        city: summary.city && summary.city[0],
        country: summary.country && summary.country[0],
        imagesCount: summary.images ? summary.images.length : 0,
        documentsCount: summary.documents ? summary.documents.length : 0,
      });
    } catch (e) {
      console.log('[Frontend propertiesApi.createProperty] payload summary failed:', e && e.message ? e.message : e);
    }

    const { data } = await api.post('/properties', formData, {

      headers: {
        'Content-Type': 'multipart/form-data', // Instructs Axios to append proper stream boundaries
      },
    });
    return data;
  },

  /**
   * 2. Government Admin fetches properties with PENDING status awaiting review.
   * @returns {Promise<Array>} Array of pending property objects
   */
  getPendingProperties: async () => {
    const { data } = await api.get('/properties/pending');
    return data.properties || [];
  },

  /**
   * 3. Government Admin updates backend database after on-chain minting clears.
   * Synchronizes the database status to ACTIVE.
   * @param {string} propertyId - UUID string from database record
   * @param {string} tokenId - Sequential ID parsed from Hardhat transaction logs
   * @param {string} chainHash - Ethereum transaction block receipt hash
   */
  confirmMint: async (propertyId, tokenId, chainHash) => {
    const { data } = await api.post('/properties/confirm', {
      propertyId,
      tokenId,
      chainHash,
    });
    return data;
  },

  /**
   * Fetch all minted/active properties (status=ACTIVE)
   */
  getActiveProperties: async () => {
    const { data } = await api.get('/properties/active');
    return data;
  },
};

