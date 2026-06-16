import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Star,
  Medal,
  TrendingUp,
  Shield,
  Award,
  MapPin,
  Home,
  Key,
  DollarSign,
  Calendar,
  ChevronRight,
  Filter,
  Download,
  Eye,
  MessageSquare,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';

const ClientsDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReputation, setFilterReputation] = useState('all');

  // Sample approved verified users
  const verifiedClients = [
    {
      id: 'CLT-001',
      userId: 'USR-12345',
      name: 'John Anderson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
      email: 'john.anderson@email.com',
      phone: '+1 (555) 111-2222',
      location: 'Austin, Texas',
      verificationLevel: 'Level 3 - Premium',
      verificationDate: '2023-06-20',
      reputationScore: 98,
      reputationBadge: 'Platinum Investor',
      totalProperties: 4,
      propertiesOwned: 3,
      propertiesRented: 1,
      totalValue: '$1,245,000',
      totalTransactions: 12,
      successRate: 100,
      disputes: 0,
      joinDate: '2023-06-15',
      lastActive: '2024-01-15T15:30:00',
      kycComplete: true,
      verifiedDocuments: ['Passport', 'Tax Return', 'Bank Statement'],
      tags: ['Verified Investor', 'Low Risk', 'Frequent Buyer']
    },
    {
      id: 'CLT-002',
      userId: 'USR-12346',
      name: 'Sarah Martinez',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
      email: 'sarah.martinez@email.com',
      phone: '+1 (555) 333-4444',
      location: 'Miami, Florida',
      verificationLevel: 'Level 2 - Standard',
      verificationDate: '2023-08-25',
      reputationScore: 87,
      reputationBadge: 'Trusted Renter',
      totalProperties: 3,
      propertiesOwned: 1,
      propertiesRented: 2,
      totalValue: '$425,000',
      totalTransactions: 8,
      successRate: 95,
      disputes: 1,
      joinDate: '2023-08-22',
      lastActive: '2024-01-14T10:15:00',
      kycComplete: true,
      verifiedDocuments: ['Driver License', 'Pay Stubs'],
      tags: ['First Time Buyer', 'Reliable Renter']
    },
    {
      id: 'CLT-003',
      userId: 'USR-12348',
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 777-8888',
      location: 'Denver, Colorado',
      verificationLevel: 'Level 1 - Basic',
      verificationDate: '2024-01-14',
      reputationScore: 75,
      reputationBadge: 'New Member',
      totalProperties: 1,
      propertiesOwned: 0,
      propertiesRented: 1,
      totalValue: '$0',
      totalTransactions: 1,
      successRate: 100,
      disputes: 0,
      joinDate: '2024-01-14',
      lastActive: '2024-01-14T09:00:00',
      kycComplete: true,
      verifiedDocuments: ['State ID'],
      tags: ['New User', 'Looking to Buy']
    },
    {
      id: 'CLT-004',
      userId: 'USR-12349',
      name: 'Robert Williams',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
      email: 'robert.w@email.com',
      phone: '+1 (555) 999-0000',
      location: 'Seattle, Washington',
      verificationLevel: 'Level 3 - Premium',
      verificationDate: '2023-05-10',
      reputationScore: 94,
      reputationBadge: 'Gold Investor',
      totalProperties: 6,
      propertiesOwned: 5,
      propertiesRented: 1,
      totalValue: '$2,890,000',
      totalTransactions: 24,
      successRate: 98,
      disputes: 2,
      joinDate: '2023-05-05',
      lastActive: '2024-01-13T16:20:00',
      kycComplete: true,
      verifiedDocuments: ['Passport', 'Tax Return', 'Bank Statement', 'Investment Portfolio'],
      tags: ['High Net Worth', 'Multiple Properties', 'Long-term Investor']
    }
  ];

  const getReputationColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getBadgeIcon = (badge) => {
    if (badge.includes('Platinum')) return <Medal size={16} className="text-purple-500" />;
    if (badge.includes('Gold')) return <Award size={16} className="text-yellow-500" />;
    if (badge.includes('Trusted')) return <Shield size={16} className="text-emerald-500" />;
    return <Star size={16} className="text-blue-500" />;
  };

  const getFilteredClients = () => {
    let filtered = verifiedClients;
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterReputation !== 'all') {
      const [min, max] = filterReputation.split('-').map(Number);
      filtered = filtered.filter(c => c.reputationScore >= min && c.reputationScore <= max);
    }
    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Clients Dashboard</h2>
        <p className="text-gray-500 mt-1">Manage verified users and their reputation scores</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Verified Users</p>
              <p className="text-3xl font-bold mt-1">2,847</p>
              <p className="text-blue-100 text-xs mt-2">↑ 12% this month</p>
            </div>
            <UserCheck size={40} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Premium Verified</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">892</p>
              <p className="text-emerald-600 text-xs mt-2">Level 3 users</p>
            </div>
            <Medal size={32} className="text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg. Reputation</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">86.4</p>
              <p className="text-emerald-600 text-xs mt-2">↑ 3.2 points</p>
            </div>
            <TrendingUp size={32} className="text-emerald-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Property Value</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">$124.5M</p>
              <p className="text-blue-600 text-xs mt-2">Managed by users</p>
            </div>
            <DollarSign size={32} className="text-green-400" />
          </div>
        </div>
      </div>

      {/* Reputation Distribution */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Reputation Score Distribution</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Excellent (90-100)</span>
              <span className="font-semibold">842 users</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '29.6%' }}></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Good (70-89)</span>
              <span className="font-semibold">1,245 users</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '43.7%' }}></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Fair (50-69)</span>
              <span className="font-semibold">532 users</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '18.7%' }}></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Needs Review (0-49)</span>
              <span className="font-semibold">228 users</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '8.0%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterReputation}
            onChange={(e) => setFilterReputation(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reputation</option>
            <option value="90-100">Excellent (90-100)</option>
            <option value="70-89">Good (70-89)</option>
            <option value="50-69">Fair (50-69)</option>
            <option value="0-49">Needs Review (0-49)</option>
          </select>
          <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getFilteredClients().map((client) => (
          <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <img src={client.avatar} alt={client.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{client.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getReputationColor(client.reputationScore)}`}>
                          Score: {client.reputationScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getBadgeIcon(client.reputationBadge)}
                      <span>{client.reputationBadge}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{client.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Verified: {client.verificationDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield size={14} />
                      <span>{client.verificationLevel}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <Home size={14} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-800">{client.propertiesOwned}</p>
                      <p className="text-xs text-gray-500">Owned</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <Key size={14} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-800">{client.propertiesRented}</p>
                      <p className="text-xs text-gray-500">Rented</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <DollarSign size={14} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-800">{client.totalValue}</p>
                      <p className="text-xs text-gray-500">Total Value</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {client.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 text-sm">
                      <Eye size={14} />
                      View Profile
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm">
                      <MessageSquare size={14} />
                      Contact
                    </button>
                    <button className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition">
                      <ThumbsUp size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsDashboard;