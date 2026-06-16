const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PropertyRepository {
  async createWithFilesTx(propertyData, filePayloads) {
    return await prisma.$transaction(async (tx) => {
      // 1. Save core property record
      const property = await tx.property.create({
        data: propertyData
      });

      // 2. Attach IDs to file payloads and bulk insert
      if (filePayloads.length > 0) {
        const structuralFiles = filePayloads.map(file => ({
          ...file,
          propertyId: property.id
        }));
        await tx.propertyFile.createMany({ data: structuralFiles });
      }

      // 3. Log original historical version snapshot
      await tx.metadataVersion.create({
        data: {
          propertyId: property.id,
          version: 1,
          metadataHash: propertyData.metadataHash,
          snapshot: propertyData
        }
      });

      return property;
    });
  }
}

module.exports = new PropertyRepository();
