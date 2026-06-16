import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Users,
  Ban,
  CheckCircle,
  AlertTriangle,
  Activity,
  Server,
  Cpu,
  Database,
  Wifi,
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  Download,
  ChevronDown,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';

const SystemAdministration = () => {
  const [selectedTab, setSelectedTab] = useState('bulk');
  const [bulkPropertyIds, setBulkPropertyIds] = useState('');
  const [blacklistAddress, setBlacklistAddress] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');

  const admins = [
    { id: 'ADM-001', name: 'Dr. Sarah Chen', email: 'sarah.chen@government.gov', role: 'Chief Administrator', status: 'Active', lastActive: '2024-01-15T09:30:00' },
    { id: 'ADM-002', name: 'Emily Watson', email: 'emily.watson@government.gov', role: 'Senior Approver', status: 'Active', lastActive: '2024-01-15T10:15:00' },
    { id: 'ADM-003', name: 'Michael Rodriguez', email: 'michael.r@government.gov', role: 'Verification Officer', status: 'Active', lastActive: '2024-01-14T16:45:00' },
    { id: 'ADM-004', name: 'Jessica Lee', email: 'jessica.lee@government.gov', role: 'Dispute Mediator', status: 'Inactive', lastActive: '2024-01-10T11:00:00' },
  ];

  const blacklistedAddresses = [
    { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f6b146', reason: 'Suspicious activity', date: '2024-01-10', by: 'Sarah Chen' },
    { address: '0x123AbCdefGHIJklmnOPqrstUVwxyz1234567890', reason: 'Fraudulent property listing', date: '2024-01-05', by: 'Emily Watson' },
  ];

  const whitelistedAddresses = [
    { address: '0x987FeDcBA9876543210ZYXWVUTSRQPONMLKJIH', reason: 'Verified government entity', date: '2024-01-01', by: 'System' },
  ];

  const systemHealth = {
    status: 'Healthy',
    uptime: '99.98%',
    apiResponse: '142ms',
    blockchainSync: 'Synced',
    databaseConnections: 24,
    activeUsers: 847,
    pendingJobs: 3,
    cpuUsage: 42,
    memoryUsage: 58
  };

  const apiMetrics = {
    totalRequests: '1.2M',
    avgLatency: '142ms',
    errorRate: '0.23%',
    requestsPerMinute: 245
  };

  const handleBulkApprove = () => {
    alert(`Bulk approving ${bulkPropertyIds.split(',').length} properties`);
    setBulkPropertyIds('');
  };

  const handleAddBlacklist = () => {
    alert(`Added ${blacklistAddress} to blacklist with reason: ${blacklistReason}`);
    setBlacklistAddress('');
    setBlacklistReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">System Administration</h2>
        <p className="text-gray-500 mt-1">Manage system settings, admins, and security controls</p>
      </div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Server size={20} className="text-blue-500" />
            <span className={`text-sm ${systemHealth.status === 'Healthy' ? 'text-emerald-600' : 'text-red-600'}`}>
              {systemHealth.status}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{systemHealth.uptime}</p>
          <p className="text-sm text-gray-500">System Uptime</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Cpu size={20} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{systemHealth.apiResponse}</p>
          <p className="text-sm text-gray-500">API Response Time</p>
          <div className="mt-2 w-full h-1 bg-gray-100 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Database size={20} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{systemHealth.databaseConnections}</p>
          <p className="text-sm text-gray-500">Active DB Connections</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{systemHealth.activeUsers}</p>
          <p className="text-sm text-gray-500">Active Users Online</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setSelectedTab('bulk')}
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${selectedTab === 'bulk' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Bulk Operations
        </button>
        <button
          onClick={() => setSelectedTab('admins')}
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${selectedTab === 'admins' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Admin Management
        </button>
        <button
          onClick={() => setSelectedTab('blacklist')}
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${selectedTab === 'blacklist' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Blacklist/Whitelist
        </button>
        <button
          onClick={() => setSelectedTab('health')}
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${selectedTab === 'health' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          System Health
        </button>
        <button
          onClick={() => setSelectedTab('api')}
          className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${selectedTab === 'api' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          API Performance
        </button>
      </div>

      {/* Bulk Operations Tab */}
      {selectedTab === 'bulk' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Play size={18} className="text-emerald-500" />
              Batch Approve Properties
            </h3>
            <textarea
              placeholder="Enter property IDs (comma-separated)&#10;Example: PRP-12345, PRP-12346, PRP-12347"
              value={bulkPropertyIds}
              onChange={(e) => setBulkPropertyIds(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleBulkApprove} className="px-4 py-2 bg-emerald-500 text-white rounded-lg">
                Approve All Selected
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg">
                Reject All Selected
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <RefreshCw size={18} className="text-blue-500" />
              Batch Operations History
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">Bulk Approval - Jan 15, 2024</p>
                  <p className="text-xs text-gray-500">12 properties approved</p>
                </div>
                <span className="text-emerald-600 text-sm">Completed</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">Bulk Update - Jan 14, 2024</p>
                  <p className="text-xs text-gray-500">8 properties updated</p>
                </div>
                <span className="text-emerald-600 text-sm">Completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Management Tab */}
      {selectedTab === 'admins' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Admin Users</h3>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
              <Plus size={14} />
              Add Admin
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Admin ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{admin.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(admin.lastActive).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} /></button>
                        <button className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blacklist/Whitelist Tab */}
      {selectedTab === 'blacklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add to Blacklist */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Ban size={18} className="text-red-500" />
              Add to Blacklist
            </h3>
            <input
              type="text"
              placeholder="Wallet Address"
              value={blacklistAddress}
              onChange={(e) => setBlacklistAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <textarea
              placeholder="Reason for blacklisting"
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={2}
            />
            <button onClick={handleAddBlacklist} className="w-full px-4 py-2 bg-red-500 text-white rounded-lg">
              Add to Blacklist
            </button>
          </div>

          {/* Current Blacklist */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Current Blacklist
            </h3>
            <div className="space-y-3">
              {blacklistedAddresses.map((entry, idx) => (
                <div key={idx} className="p-3 bg-red-50 rounded-xl">
                  <p className="font-mono text-sm text-red-700 break-all">{entry.address}</p>
                  <p className="text-xs text-red-600 mt-1">Reason: {entry.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">Added: {entry.date} by {entry.by}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Whitelist */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-500" />
              Whitelisted Addresses
            </h3>
            <div className="space-y-3">
              {whitelistedAddresses.map((entry, idx) => (
                <div key={idx} className="p-3 bg-emerald-50 rounded-xl">
                  <p className="font-mono text-sm text-emerald-700 break-all">{entry.address}</p>
                  <p className="text-xs text-emerald-600 mt-1">Reason: {entry.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {selectedTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">System Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{systemHealth.cpuUsage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${systemHealth.cpuUsage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{systemHealth.memoryUsage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${systemHealth.memoryUsage}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Wifi size={20} className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-lg font-bold">{systemHealth.blockchainSync}</p>
                  <p className="text-xs text-gray-500">Blockchain Sync</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Clock size={20} className="mx-auto text-blue-500 mb-1" />
                  <p className="text-lg font-bold">{systemHealth.pendingJobs}</p>
                  <p className="text-xs text-gray-500">Pending Jobs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Service Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span>API Gateway</span>
                <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Operational</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span>Database Cluster</span>
                <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Operational</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span>Blockchain Node</span>
                <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Synced</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span>Storage Service</span>
                <span className="text-yellow-600 flex items-center gap-1"><AlertCircle size={14} /> Degraded</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Performance Tab */}
      {selectedTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Requests</p>
            <p className="text-3xl font-bold text-gray-800">{apiMetrics.totalRequests}</p>
            <p className="text-xs text-green-600 mt-1">↑ +8.5% from last month</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Avg. Latency</p>
            <p className="text-3xl font-bold text-gray-800">{apiMetrics.avgLatency}</p>
            <p className="text-xs text-green-600 mt-1">↓ -12ms improvement</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-3xl font-bold text-gray-800">{apiMetrics.errorRate}</p>
            <p className="text-xs text-green-600 mt-1">↓ -0.07% decrease</p>
          </div>
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Endpoint Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-mono">/api/properties/mint</span>
                  <span>142ms</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-mono">/api/verification/kyc</span>
                  <span>203ms</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-mono">/api/market/listings</span>
                  <span>98ms</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdministration;