import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  FileText,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react';

const VerificationUsers = () => {
  const [selectedTab, setSelectedTab] = useState('verification'); // verification or users
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample verification queue
  const verificationQueue = [
    {
      id: 'VER-001',
      userId: 'USR-78901',
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Los Angeles, CA',
      documentType: 'Driver License',
      documentNumber: 'DL-12345678',
      kycStatus: 'PENDING',
      submittedAt: '2024-01-15T09:30:00',
      documents: ['id_front.jpg', 'id_back.jpg', 'selfie.jpg', 'proof_of_address.pdf'],
      riskScore: 82,
      notes: 'Address verification required'
    },
    {
      id: 'VER-002',
      userId: 'USR-78902',
      name: 'Lisa Thompson',
      email: 'lisa.t@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Chicago, IL',
      documentType: 'Passport',
      documentNumber: 'P-987654321',
      kycStatus: 'PENDING',
      submittedAt: '2024-01-14T14:20:00',
      documents: ['passport.jpg', 'selfie.jpg', 'utility_bill.pdf'],
      riskScore: 95,
      notes: 'All documents clear'
    },
    {
      id: 'VER-003',
      userId: 'USR-78903',
      name: 'Robert Chen',
      email: 'robert.chen@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine St, Seattle, WA',
      documentType: 'State ID',
      documentNumber: 'ID-87654321',
      kycStatus: 'PENDING',
      submittedAt: '2024-01-13T11:45:00',
      documents: ['id_front.jpg', 'id_back.jpg', 'selfie.jpg'],
      riskScore: 45,
      notes: 'Blurry document images, needs resubmission'
    }
  ];

  // Sample users list
  const usersList = [
    {
      id: 'USR-12345',
      name: 'John Anderson',
      email: 'john.anderson@email.com',
      phone: '+1 (555) 111-2222',
      status: 'ACTIVE',
      role: 'Citizen',
      verificationLevel: 'Level 3',
      reputationScore: 98,
      joinedAt: '2023-06-15',
      propertiesOwned: 3,
      propertiesRented: 1,
      totalTransactions: 12,
      complaints: 0,
      lastActive: '2024-01-15T15:30:00'
    },
    {
      id: 'USR-12346',
      name: 'Sarah Martinez',
      email: 'sarah.m@email.com',
      phone: '+1 (555) 333-4444',
      status: 'ACTIVE',
      role: 'Citizen',
      verificationLevel: 'Level 2',
      reputationScore: 87,
      joinedAt: '2023-08-22',
      propertiesOwned: 1,
      propertiesRented: 2,
      totalTransactions: 8,
      complaints: 1,
      lastActive: '2024-01-14T10:15:00'
    },
    {
      id: 'USR-12347',
      name: 'Michael Chang',
      email: 'michael.c@email.com',
      phone: '+1 (555) 555-6666',
      status: 'SUSPENDED',
      role: 'Citizen',
      verificationLevel: 'Level 1',
      reputationScore: 42,
      joinedAt: '2023-09-10',
      propertiesOwned: 0,
      propertiesRented: 1,
      totalTransactions: 3,
      complaints: 3,
      lastActive: '2024-01-10T08:45:00'
    },
    {
      id: 'USR-12348',
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      phone: '+1 (555) 777-8888',
      status: 'PENDING',
      role: 'Citizen',
      verificationLevel: 'Level 0',
      reputationScore: null,
      joinedAt: '2024-01-14',
      propertiesOwned: 0,
      propertiesRented: 0,
      totalTransactions: 0,
      complaints: 0,
      lastActive: '2024-01-14T09:00:00'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleApproveVerification = (userId) => {
    alert(`User ${userId} has been APPROVED and KYC is complete. Blockchain record updated.`);
  };

  const handleRejectVerification = (userId) => {
    alert(`User ${userId} has been REJECTED. Notification sent to user.`);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getFilteredUsers = () => {
    let filtered = usersList;
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => u.status === filterStatus);
    }
    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Verification & Users</h2>
        <p className="text-gray-500 mt-1">Manage user verification and oversee all platform users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold text-yellow-600">3</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-emerald-600">2,847</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <UserCheck size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suspended Users</p>
              <p className="text-2xl font-bold text-red-600">12</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <UserX size={20} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Reputation</p>
              <p className="text-2xl font-bold text-purple-600">86.4</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('verification')}
          className={`px-6 py-3 font-medium transition-all relative ${
            selectedTab === 'verification'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Verification Queue
          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">3</span>
        </button>
        <button
          onClick={() => setSelectedTab('users')}
          className={`px-6 py-3 font-medium transition-all relative ${
            selectedTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Users
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">2,847</span>
        </button>
      </div>

      {selectedTab === 'verification' ? (
        // Verification Queue
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search verification requests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>
          </div>

          {verificationQueue.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                        <Users size={22} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">{request.name}</h3>
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            {request.kycStatus}
                          </span>
                          <span className="text-xs text-gray-400">{request.id}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{request.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{request.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{request.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KYC Details */}
                    <div className="bg-gray-50 rounded-xl p-3 mt-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Document Type</p>
                          <p className="text-sm font-medium">{request.documentType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Document Number</p>
                          <p className="text-sm font-medium">{request.documentNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Risk Score</p>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${request.riskScore >= 70 ? 'bg-green-500' : request.riskScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <p className="text-sm font-medium">{request.riskScore}/100</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Documents</p>
                          <p className="text-sm font-medium">{request.documents.length} files</p>
                        </div>
                      </div>
                      {request.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-yellow-600 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Note: {request.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Documents Preview */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {request.documents.map((doc, idx) => (
                        <button key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-50">
                          <FileText size={12} />
                          {doc}
                          <Download size={10} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2">
                    <button
                      onClick={() => handleApproveVerification(request.userId)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2 justify-center"
                    >
                      <CheckCircle size={16} />
                      Approve KYC
                    </button>
                    <button
                      onClick={() => handleRejectVerification(request.userId)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2 justify-center"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 justify-center">
                      <Eye size={16} />
                      Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Users List
        <div className="space-y-4">
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
              <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reputation</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Properties</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getFilteredUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <Users size={14} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.reputationScore ? (
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${user.reputationScore}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{user.reputationScore}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not rated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">Own: {user.propertiesOwned}</p>
                        <p className="text-xs text-gray-400">Rent: {user.propertiesRented}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.id}</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Contact Information</p>
                  <p className="text-sm flex items-center gap-2 mt-2"><Mail size={14} /> {selectedUser.email}</p>
                  <p className="text-sm flex items-center gap-2"><Phone size={14} /> {selectedUser.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Verification Level</p>
                  <p className="text-2xl font-bold mt-2">{selectedUser.verificationLevel}</p>
                  <p className="text-xs text-gray-500">Member since {selectedUser.joinedAt}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Activity Summary</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-lg font-bold">{selectedUser.totalTransactions}</p>
                      <p className="text-xs text-gray-500">Transactions</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{selectedUser.complaints}</p>
                      <p className="text-xs text-gray-500">Complaints</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Last Active</p>
                  <p className="text-sm mt-2">{new Date(selectedUser.lastActive).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                  Suspend User
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationUsers;