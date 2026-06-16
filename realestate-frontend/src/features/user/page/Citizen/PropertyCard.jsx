import React from 'react';
import { MapPin, Bed, Bath, Square, Eye, Heart } from 'lucide-react';

const PropertyCard = ({ property, type }) => {
  const safeProperty = property ?? {};

  const getCardStyles = () => {
    switch(type) {
      case 'owned':
        return {
          badgeColor: 'bg-white/90 text-blue-600',
          priceColor: 'text-blue-600',
          buttonColor: 'text-blue-500 hover:text-blue-700'
        };
      case 'rented':
        return {
          badgeColor: 'bg-emerald-500/90 text-white',
          priceColor: 'text-emerald-600',
          buttonColor: 'text-emerald-500 hover:text-emerald-700'
        };
      case 'listed':
        return {
          badgeColor: 'bg-purple-500/90 text-white',
          priceColor: 'text-purple-600',
          buttonColor: 'text-purple-500 hover:text-purple-700'
        };
      default:
        return {
          badgeColor: 'bg-white/90 text-blue-600',
          priceColor: 'text-blue-600',
          buttonColor: 'text-blue-500 hover:text-blue-700'
        };
    }
  };

  const styles = getCardStyles();

  const renderBadge = () => {
    if (type === 'owned') return 'Owned';
    if (type === 'rented') return 'Rented';
    return property.status;
  };

  const renderPrice = () => {
    if (type === 'rented') return property.rent;
    return property.price;
  };

  const renderExtraInfo = () => {
    if (type === 'owned') {
      return <span className="text-sm text-gray-500">Purchased: {property.purchaseDate}</span>;
    }
    if (type === 'rented') {
      return (
        <>
          <span className="text-sm text-gray-500">Lease: {property.leaseStart} - {property.leaseEnd}</span>
          <p className="text-sm text-gray-500 mt-1">Landlord: {property.landlord}</p>
        </>
      );
    }
    return <span className="text-sm text-gray-500">Listed: {property.listedDate}</span>;
  };

  const renderStats = () => {
    if (type === 'listed') {
      return (
        <div className="flex gap-4 mb-4">
          <div className="flex items-center text-gray-600"><Eye size={14} className="mr-1" /> {property.views}</div>
          <div className="flex items-center text-gray-600"><Heart size={14} className="mr-1" /> {property.likes}</div>
        </div>
      );
    }
    return null;
  };

  const renderActions = () => {
    if (type === 'listed') {
      return (
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition">Edit</button>
          <button className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition">Promote</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        <img
          src={safeProperty?.image ?? ''}
          alt={safeProperty?.title ?? 'Property'}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        <div className={`absolute top-4 right-4 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold ${styles.badgeColor}`}>
          {renderBadge()}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{property.title}</h3>
        <div className="flex items-center text-gray-500 mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-2xl font-bold ${styles.priceColor}`}>{renderPrice()}</span>
          {renderExtraInfo()}
        </div>
        {renderStats()}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex gap-4">
            <div className="flex items-center text-gray-600"><Bed size={16} className="mr-1" /> {property.beds}</div>
            <div className="flex items-center text-gray-600"><Bath size={16} className="mr-1" /> {property.baths}</div>
            <div className="flex items-center text-gray-600"><Square size={16} className="mr-1" /> {property.sqft} sqft</div>
          </div>
          {renderActions() || (
            <button className={`font-medium text-sm ${styles.buttonColor}`}>
              {type === 'owned' ? 'View Details →' : type === 'rented' ? 'View Lease →' : 'View Listing →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;