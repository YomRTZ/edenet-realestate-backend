class PropertyRepository {
  async submitToWeb2Backend(formData) {
    const response = await fetch('/api/properties', {
      method: 'POST',
      body: formData, // Browser sets the multi-part boundaries automatically
    });

    if (!response.ok) {
      const errResponse = await response.json().catch(() => ({}));
      throw new Error(errResponse.error || 'Backend pipeline processing error.');
    }

    const result = await response.json();
    return result.data; // Returns: { propertyId, metadataHash, imagesRootHash, documentsRootHash }
  }
}

export default new PropertyRepository();
