import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Home,
  Key,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Flame,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const MarketMonitoring = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [propertyType, setPropertyType] = useState('all');

  // Sample market data
  const marketStats = {
    totalListings: 342,
    forSale: 187,
    forRent: 155,
    avgPrice: '$487,000',
    avgRent: '$2,350/month',
    priceTrend: '+3.2%',
    rentTrend: '+1.8%',
    supplyDemandRatio: 1.24,
    avgDaysOnMarket: 28
  };

  // Sample location price trends
  const locationTrends = [
    { location: 'Austin, TX', avgPrice: '$525,000', priceChange: '+5.2%', avgRent: '$2,400', rentChange: '+2.1%', inventory: 45, demand: 'High' },
    { location: 'Miami, FL', avgPrice: '$589,000', priceChange: '+4.8%', avgRent: '$2,800', rentChange: '+3.2%', inventory: 38, demand: 'Very High' },
    { location: 'Denver, CO', avgPrice: '$498,000', priceChange: '+2.5%', avgRent: '$2,200', rentChange: '+1.5%', inventory: 52, demand: 'Medium' },
    { location: 'Seattle, WA', avgPrice: '$675,000', priceChange: '+1.2%', avgRent: '$2,600', rentChange: '+0.8%', inventory: 31, demand: 'Medium' },
    { location: 'Portland, OR', avgPrice: '$445,000', priceChange: '+3.1%', avgRent: '$2,100', rentChange: '+1.9%', inventory: 28, demand: 'High' },
  ];

  // Sample owner-tenant health metrics
  const healthMetrics = [
    { pair: 'John Anderson → Oceanfront Villa', type: 'owner-tenant', disputes: 0, complaints: 0, rating: 98, status: 'Excellent' },
    { pair: 'Sarah Martinez → Harbor View', type: 'tenant-owner', disputes: 1, complaints: 2, rating: 72, status: 'Fair' },
    { pair: 'Michael Chang → Downtown Loft', type: 'tenant-owner', disputes: 2, complaints: 3, rating: 45, status: 'Poor' },
    { pair: 'Emily Wilson → Mountain Cabin', type: 'owner-tenant', disputes: 0, complaints: 0, rating: 95, status: 'Excellent' },
  ];

  // Sample active listings by type
  const listingsByType = {
    residential: 187,
    commercial: 89,
    industrial: 42,
    land: 24
  };

  const getDemandColor = (demand) => {
    switch(demand) {
      case 'Very High': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthColor = (status) => {
    switch(status) {
      case 'Excellent': return 'text-emerald-600 bg-emerald-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      case 'Poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Market Monitoring</h2>
        <p className="text-gray-500 mt-1">Real-time market insights and trend analysis</p>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Home size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {marketStats.priceTrend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{marketStats.avgPrice}</p>
          <p className="text-sm text-gray-500">Average Listing Price</p>
          <div className="flex justify-between mt-2 text-xs">
            <span>For Sale: {marketStats.forSale}</span>
            <span>For Rent: {marketStats.forRent}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Key size={20} className="text-emerald-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {marketStats.rentTrend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{marketStats.avgRent}</p>
          <p className="text-sm text-gray-500">Average Rent Price</p>
          <p className="text-xs text-gray-400 mt-2">Based on {marketStats.forRent} active listings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{marketStats.supplyDemandRatio}</p>
          <p className="text-sm text-gray-500">Supply/Demand Ratio</p>
          <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(marketStats.supplyDemandRatio / 2) * 100}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">1 indicates buyer's market</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{marketStats.avgDaysOnMarket}</p>
          <p className="text-sm text-gray-500">Avg. Days on Market</p>
          <p className="text-xs text-green-600 mt-1">↓ 4 days from last month</p>
        </div>
      </div>

      {/* Location Price Trends */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <MapPin size={18} />
            Location Price Trends
          </h3>
          <div className="flex gap-2">
            <select className="px-3 py-1 text-sm border border-gray-200 rounded-lg">
              <option>All Locations</option>
              <option>Texas</option>
              <option>Florida</option>
              <option>California</option>
            </select>
            <button className="p-1 hover:bg-gray-100 rounded-lg"><Download size={16} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Location</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Avg. Price</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Price Trend</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Avg. Rent</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Inventory</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {locationTrends.map((loc, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{loc.location}</td>
                  <td className="py-3 text-gray-600">{loc.avgPrice}</td>
                  <td className="py-3">
                    <span className="text-emerald-600 text-sm flex items-center gap-1">
                      <TrendingUp size={12} />
                      {loc.priceChange}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{loc.avgRent}</td>
                  <td className="py-3 text-gray-600">{loc.inventory} listings</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(loc.demand)}`}>
                      {loc.demand}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart size={18} />
            Listings by Property Type
          </h3>
          <div className="space-y-3">
            {Object.entries(listingsByType).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-medium text-gray-800">{count} listings</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${(count / marketStats.totalListings) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Active Listings</span>
              <span className="font-bold text-gray-800">{marketStats.totalListings}</span>
            </div>
          </div>
        </div>

        {/* Owner-Tenant Pair Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ThumbsUp size={18} />
            Owner/Tenant Pair Health
          </h3>
          <div className="space-y-3">
            {healthMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{metric.pair}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-500">Disputes: {metric.disputes}</span>
                    <span className="text-xs text-gray-500">Complaints: {metric.complaints}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{metric.rating}</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <AlertCircle size={14} />
              {healthMetrics.filter(m => m.status === 'Poor').length} pairs require attention
            </p>
          </div>
        </div>
      </div>

      {/* Geographic Heat Map Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={18} />
          Geographic Activity Heat Map
        </h3>
        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">Interactive heat map visualization</p>
              <p className="text-xs text-gray-300">High activity areas: Austin, Miami, Seattle</p>
            </div>
          </div>
          {/* Heat spots simulation */}
          <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-red-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-yellow-200 rounded-full blur-3xl opacity-30"></div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-full"></div><span className="text-xs">Very High Activity</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-400 rounded-full"></div><span className="text-xs">High Activity</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div><span className="text-xs">Medium Activity</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded-full"></div><span className="text-xs">Low Activity</span></div>
        </div>
      </div>
    </div>
  );
};

export default MarketMonitoring;