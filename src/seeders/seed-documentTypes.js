import sequelize from '../config/database.js';

export const seedDocumentTypes = async () => {
  try {
    const documentTypes = [
      { name: 'DEED', description: 'Property deed' },
      { name: 'TITLE', description: 'Title document' },
      { name: 'SURVEY', description: 'Land survey' },
      { name: 'INSPECTION', description: 'Property inspection report' },
      { name: 'TAX_RECORD', description: 'Tax record document' },
      { name: 'INSURANCE', description: 'Insurance document' },
      { name: 'CONTRACT', description: 'Purchase/Rental contract' },
      { name: 'LEASE', description: 'Lease agreement' }
    ];

    console.log('✓ Document Types seeded');
    return documentTypes;
  } catch (error) {
    console.error('Error seeding document types:', error);
    throw error;
  }
};
