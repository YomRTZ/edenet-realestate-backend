import React from 'react';
import { Home, Key, TrendingUp } from 'lucide-react';

const StatsCards = ({ properties }) => {
  // `CitizenPage` passes the active properties array from `useProperties()`.
  // The previous implementation expected `{ owned, rented, listed }` and crashed.
  const activeProperties = Array.isArray(properties) ? properties : [];

  const ownedCount = activeProperties.length;
  const rentedCount = activeProperties.filter(
    (p) => (p?.listingType || '').toUpperCase() === 'RENT'
  ).length;
  const listedCount = activeProperties.filter((p) => {
    const t = (p?.listingType || '').toUpperCase();
    return t === 'SALE' || t === 'BOTH';
  }).length;

  const stats = [
    {
      title: 'Owned Properties',
      count: ownedCount,
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      valueColor: 'text-blue-800',
      icon: Home,
      iconColor: 'text-blue-400'
    },
    {
      title: 'Rented Properties',
      count: rentedCount,
      color: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      valueColor: 'text-emerald-800',
      icon: Key,
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Active Listings',
      count: listedCount,
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      valueColor: 'text-purple-800',
      icon: TrendingUp,
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
      {stats.map((stat, index) => (
        <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${stat.textColor} text-sm font-medium`}>{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.valueColor}`}>{stat.count}</p>
            </div>
            <stat.icon size={32} className={stat.iconColor} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;