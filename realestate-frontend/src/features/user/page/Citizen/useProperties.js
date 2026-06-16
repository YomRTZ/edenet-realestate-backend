import { useEffect, useMemo, useState } from 'react';
import { propertiesApi } from '../../../property/api/properties.api.js';

export const useProperties = () => {
  const [activeTab, setActiveTab] = useState('owned');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await propertiesApi.getActiveProperties();
        if (!cancelled) setProperties(res.properties || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load properties');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentProperties = useMemo(() => {
    // Your tabs are UX-only right now; map them to listingType.
    // ACTIVE DB properties should be mapped from listingType.
    if (!properties || properties.length === 0) return [];

    switch (activeTab) {
      case 'owned':
        // If you later implement ownership filtering by ownerWallet, do it here.
        return properties;
      case 'rented':
        return properties.filter((p) => (p.listingType || '').toUpperCase() === 'RENT');
      case 'listed':
        return properties.filter((p) => (p.listingType || '').toUpperCase() === 'SALE' || (p.listingType || '').toUpperCase() === 'BOTH');
      default:
        return properties;
    }
  }, [activeTab, properties]);

  const getPropertyType = () => activeTab;

  return {
    activeTab,
    setActiveTab,
    currentProperties,
    properties,
    propertyType: getPropertyType(),
    loading,
    error
  };
};
