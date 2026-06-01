import sequelize from '../config/database.js';
import { DOCUMENT_TYPES } from '../constants/seeds.js';

export const seedDocumentTypes = async () => {
  try {
    const documentTypes = [
      { name: DOCUMENT_TYPES.DEED, description: 'Property deed' },
      { name: DOCUMENT_TYPES.TITLE, description: 'Title document' },
      { name: DOCUMENT_TYPES.SURVEY, description: 'Land survey' },
      { name: DOCUMENT_TYPES.INSPECTION, description: 'Property inspection report' },
      { name: DOCUMENT_TYPES.TAX_RECORD, description: 'Tax record document' },
      { name: DOCUMENT_TYPES.INSURANCE, description: 'Insurance document' },
      { name: DOCUMENT_TYPES.CONTRACT, description: 'Purchase/Rental contract' },
      { name: DOCUMENT_TYPES.LEASE, description: 'Lease agreement' }
    ];

    console.log('✓ Document Types seeded');
    return documentTypes;
  } catch (error) {
    console.error('Error seeding document types:', error);
    throw error;
  }
};
