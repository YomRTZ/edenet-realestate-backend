import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Hash,
  Shield,
  Flag,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const AuditCompliance = () => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample audit logs
  const auditLogs = [
    {
      id: 'AUD-001',
      action: 'PROPERTY_APPROVED',
      entityType: 'Property',
      entityId: 'PRP-12345',
      performedBy: 'Dr. Sarah Chen',
      performedById: 'ADM-001',
      timestamp: '2024-01-15T09:23:45',
      details: {
        propertyTitle: 'Oceanfront Luxury Villa',
        previousStatus: 'pending',
        newStatus: 'approved',
        reason: 'All documentation verified',
        blockchainTx: '0x7a8f...3d2e'
      },
      severity: 'info',
      ipAddress: '192.168.1.45'
    },
    {
      id: 'AUD-002',
      action: 'PROPERTY_REJECTED',
      entityType: 'Property',
      entityId: 'PRP-12346',
      performedBy: 'Michael Rodriguez',
      performedById: 'ADM-003',
      timestamp: '2024-01-14T16:12:30',
      details: {
        propertyTitle: 'Downtown Loft',
        previousStatus: 'pending',
        newStatus: 'rejected',
        reason: 'Incomplete documentation - missing survey report',
        feedback: 'Please resubmit with complete documents'
      },
      severity: 'warning',
      ipAddress: '192.168.1.78'
    },
    {
      id: 'AUD-003',
      action: 'USER_SUSPENDED',
      entityType: 'User',
      entityId: 'USR-12347',
      performedBy: 'Dr. Sarah Chen',
      performedById: 'ADM-001',
      timestamp: '2024-01-14T11:05:22',
      details: {
        userName: 'Michael Chang',
        reason: 'Multiple dispute violations',
        suspensionPeriod: '30 days',
        previousStatus: 'active',
        newStatus: 'suspended'
      },
      severity: 'critical',
      ipAddress: '192.168.1.45'
    },
    {
      id: 'AUD-004',
      action: 'PROPERTY_UPDATED',
      entityType: 'Property',
      entityId: 'PRP-45678',
      performedBy: 'Emily Watson',
      performedById: 'ADM-002',
      timestamp: '2024-01-13T14:45:12',
      details: {
        propertyTitle: 'Sunset Heights Villa',
        changes: {
          price: { from: '$450,000', to: '$495,000' },
          lastValuation: { from: '2023-12-01', to: '2024-01-13' }
        },
        reason: 'Market value adjustment'
      },
      severity: 'info',
      ipAddress: '192.168.1.92'
    },
    {
      id: 'AUD-005',
      action: 'USER_VERIFIED',
      entityType: 'User',
      entityId: 'USR-12349',
      performedBy: 'System Auto',
      performedById: 'SYS-001',
      timestamp: '2024-01-13T09:30:00',
      details: {
        userName: 'Robert Williams',
        verificationLevel: 'Level 3',
        documentsVerified: ['Passport', 'Tax Return', 'Bank Statement'],
        kycScore: 98
      },
      severity: 'info',
      ipAddress: 'system'
    },
    {
      id: 'AUD-006',
      action: 'FLAG_SUSPICIOUS',
      entityType: 'Transaction',
      entityId: 'TXN-78901',
      performedBy: 'System Auto',
      performedById: 'SYS-001',
      timestamp: '2024-01-12T22:15:33',
      details: {
        description: 'Unusual transaction pattern detected',
        riskScore: 85,
        flags: ['Multiple rapid transactions', 'Unusual location'],
        action: 'Flagged for review'
      },
      severity: 'critical',
      ipAddress: 'system'
    }
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('APPROVED')) return <CheckCircle size={14} className="text-emerald-500" />;
    if (action.includes('REJECTED')) return <XCircle size={14} className="text-red-500" />;
    if (action.includes('SUSPENDED')) return <AlertTriangle size={14} className="text-red-500" />;
    if (action.includes('FLAG')) return <Flag size={14} className="text-red-500" />;
    return <FileText size={14} className="text-blue-500" />;
  };

  const getFilteredLogs = () => {
    let filtered = auditLogs;
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.severity === filterType);
    }
    return filtered;
  };

  // Sample amendment history
  const amendmentHistory = [
    { id: 'AM-001', propertyId: 'PRP-12345', field: 'price', oldValue: '$425,000', newValue: '$450,000', date: '2024-01-10', approvedBy: 'Sarah Chen' },
    { id: 'AM-002', propertyId: 'PRP-12345', field: 'status', oldValue: 'pending', newValue: 'approved', date: '2024-01-15', approvedBy: 'Sarah Chen' },
    { id: 'AM-003', propertyId: 'PRP-45678', field: 'price', oldValue: '$450,000', newValue: '$495,000', date: '2024-01-13', approvedBy: 'Emily Watson' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Audit & Compliance</h2>
        <p className="text-gray-500 mt-1">Complete history of all government actions and compliance monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Actions</p>
          <p className="text-2xl font-bold text-gray-800">2,847</p>
          <p className="text-xs text-green-600 mt-1">+124 this week</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Critical Alerts</p>
          <p className="text-2xl font-bold text-red-600">3</p>
          <p className="text-xs text-gray-500 mt-1">Requires attention</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Suspicious Flags</p>
          <p className="text-2xl font-bold text-yellow-600">8</p>
          <p className="text-xs text-gray-500 mt-1">Under review</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Compliance Rate</p>
          <p className="text-2xl font-bold text-emerald-600">98.3%</p>
          <p className="text-xs text-green-600 mt-1">↑ 0.5%</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, entity ID, or admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
            <Download size={18} />
            Export Logs
          </button>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Performed By</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredLogs().map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium text-gray-800">{log.action.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{log.entityType}</p>
                      <p className="text-xs text-gray-400">{log.entityId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{log.performedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetailModal(true);
                      }}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Amendment History Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-gray-600" />
            Amendment History
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">View all amendments →</button>
        </div>
        <div className="space-y-3">
          {amendmentHistory.map((amendment) => (
            <div key={amendment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 text-sm">Property {amendment.propertyId}</p>
                <p className="text-xs text-gray-500 mt-1">Field: {amendment.field}</p>
              </div>
              <div className="text-sm">
                <span className="text-red-500 line-through">{amendment.oldValue}</span>
                <span className="mx-2">→</span>
                <span className="text-green-600">{amendment.newValue}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{amendment.date}</p>
                <p className="text-xs text-gray-400">By: {amendment.approvedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getSeverityColor(selectedLog.severity)}`}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Audit Log Details</h3>
                  <p className="text-sm text-gray-500">{selectedLog.id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Action</label>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Timestamp</label>
                  <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Entity</label>
                  <p>{selectedLog.entityType} - {selectedLog.entityId}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Performed By</label>
                  <p>{selectedLog.performedBy} ({selectedLog.performedById})</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">IP Address</label>
                  <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Blockchain Tx</label>
                  <p className="font-mono text-sm">{selectedLog.details.blockchainTx || 'N/A'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs text-gray-500 mb-2 block">Details</label>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditCompliance;