import React, { useState } from 'react';
import {
  Scale,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  Home,
  Calendar,
  Flag,
  Search,
  Filter,
  Eye,
  Send,
  Award,
  TrendingUp,
  TrendingDown,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DisputeResolution = () => {
  const [selectedTab, setSelectedTab] = useState('open'); // open, escalated, resolved
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');

  // Sample disputes
  const disputes = [
    {
      id: 'DSP-001',
      type: 'Tenant Complaint',
      priority: 'High',
      status: 'Open',
      title: 'Property maintenance not completed',
      description: 'Tenant reports that requested repairs (leaking roof) have not been addressed for 3 weeks.',
      property: 'Harbor View Apartments, Unit 4B',
      propertyId: 'PRP-12346',
      complainant: {
        id: 'USR-78902',
        name: 'Lisa Thompson',
        role: 'Tenant'
      },
      respondent: {
        id: 'USR-12346',
        name: 'Sarah Martinez',
        role: 'Landlord'
      },
      submittedAt: '2024-01-10T14:30:00',
      lastUpdated: '2024-01-14T09:15:00',
      evidence: ['maintenance_request.pdf', 'photos_roof.jpg', 'email_chain.pdf'],
      messages: [
        { from: 'Lisa Thompson', message: 'The roof has been leaking for weeks', timestamp: '2024-01-10T14:30:00' },
        { from: 'Sarah Martinez', message: 'I have contacted a contractor', timestamp: '2024-01-11T10:20:00' },
        { from: 'Admin', message: 'Please provide repair timeline', timestamp: '2024-01-12T11:00:00' }
      ],
      proposedResolution: 'Complete repairs within 7 days and provide rent discount',
      escrowAmount: '$2,200'
    },
    {
      id: 'DSP-002',
      type: 'Buyer/Seller Dispute',
      priority: 'Critical',
      status: 'Escalated',
      title: 'Misrepresentation of property condition',
      description: 'Buyer claims seller failed to disclose major structural issues discovered during inspection.',
      property: 'Sunset Heights Villa',
      propertyId: 'PRP-45678',
      complainant: {
        id: 'USR-12349',
        name: 'Robert Williams',
        role: 'Buyer'
      },
      respondent: {
        id: 'USR-12345',
        name: 'John Anderson',
        role: 'Seller'
      },
      submittedAt: '2024-01-05T11:45:00',
      lastUpdated: '2024-01-13T16:20:00',
      evidence: ['inspection_report.pdf', 'photos_foundation.jpg', 'contract.pdf'],
      messages: [
        { from: 'Robert Williams', message: 'Foundation cracks were not disclosed', timestamp: '2024-01-05T11:45:00' },
        { from: 'John Anderson', message: 'I was not aware of these issues', timestamp: '2024-01-06T09:30:00' },
        { from: 'Admin', message: 'Requesting third-party inspection', timestamp: '2024-01-08T14:00:00' }
      ],
      proposedResolution: null,
      escrowAmount: '$45,000'
    },
    {
      id: 'DSP-003',
      type: 'Tenant Complaint',
      priority: 'Medium',
      status: 'Resolved',
      title: 'Security deposit not returned',
      description: 'Tenant moved out 30 days ago, landlord has not returned security deposit.',
      property: 'Downtown Loft',
      propertyId: 'PRP-12345',
      complainant: {
        id: 'USR-78903',
        name: 'Michael Chen',
        role: 'Tenant'
      },
      respondent: {
        id: 'USR-12347',
        name: 'Michael Chang',
        role: 'Landlord'
      },
      submittedAt: '2023-12-20T09:00:00',
      lastUpdated: '2024-01-05T10:30:00',
      evidence: ['lease_agreement.pdf', 'move_out_inspection.pdf', 'deposit_receipt.pdf'],
      messages: [
        { from: 'Michael Chen', message: 'Deposit of $2,500 not returned', timestamp: '2023-12-20T09:00:00' },
        { from: 'Admin', message: 'Contacted landlord', timestamp: '2023-12-21T11:00:00' },
        { from: 'Admin', message: 'Resolved - deposit returned with penalty', timestamp: '2024-01-05T10:30:00' }
      ],
      proposedResolution: 'Deposit returned + $500 penalty to tenant',
      resolution: 'Deposit returned with $500 penalty on 2024-01-05',
      resolvedAt: '2024-01-05T10:30:00',
      resolvedBy: 'Dr. Sarah Chen',
      penaltyApplied: '$500 to landlord'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-yellow-100 text-yellow-700';
      case 'Escalated': return 'bg-red-100 text-red-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (selectedTab === 'open') return d.status === 'Open';
    if (selectedTab === 'escalated') return d.status === 'Escalated';
    if (selectedTab === 'resolved') return d.status === 'Resolved';
    return true;
  });

  const handleResolve = () => {
    alert(`Dispute resolved with note: ${resolutionNote}\nPenalty: ${penaltyAmount || 'None'}`);
    setShowDetailModal(false);
    setResolutionNote('');
    setPenaltyAmount('');
  };

  const handleEscalate = () => {
    alert('Dispute has been escalated to senior admin for review');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dispute Resolution</h2>
        <p className="text-gray-500 mt-1">Manage buyer/seller/tenant complaints and escalations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Disputes</p>
              <p className="text-2xl font-bold text-yellow-600">8</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Escalated</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Flag size={20} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved (This Month)</p>
              <p className="text-2xl font-bold text-emerald-600">12</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Resolution Time</p>
              <p className="text-2xl font-bold text-purple-600">5.2</p>
              <p className="text-xs text-gray-400">days</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('open')}
          className={`px-6 py-3 font-medium transition-all relative ${
            selectedTab === 'open'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Open Disputes
          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">8</span>
        </button>
        <button
          onClick={() => setSelectedTab('escalated')}
          className={`px-6 py-3 font-medium transition-all relative ${
            selectedTab === 'escalated'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Escalation Queue
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">3</span>
        </button>
        <button
          onClick={() => setSelectedTab('resolved')}
          className={`px-6 py-3 font-medium transition-all relative ${
            selectedTab === 'resolved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Resolved History
        </button>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="p-5">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                      <Scale size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-600">{dispute.type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority} Priority
                    </span>
                    <span className="text-xs text-gray-400">{dispute.id}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{dispute.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dispute.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Home size={14} />
                      <span>{dispute.property}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>Complainant: {dispute.complainant.name} ({dispute.complainant.role})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Submitted: {new Date(dispute.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {dispute.proposedResolution && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm">
                      <span className="text-green-700 font-medium">Proposed Resolution:</span> {dispute.proposedResolution}
                    </div>
                  )}
                </div>
                <div className="flex flex-row lg:flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setShowDetailModal(true);
                    }}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  {dispute.status !== 'Resolved' && (
                    <>
                      <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center gap-2">
                        <CheckCircle size={16} />
                        Resolve
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2">
                        <Flag size={16} />
                        Escalate
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedDispute.title}</h3>
                <p className="text-sm text-gray-500">{selectedDispute.id} • {selectedDispute.type}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              {/* Dispute Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Complainant</p>
                  <p className="font-medium">{selectedDispute.complainant.name}</p>
                  <p className="text-sm text-gray-500">ID: {selectedDispute.complainant.id}</p>
                  <p className="text-sm text-gray-500">Role: {selectedDispute.complainant.role}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Respondent</p>
                  <p className="font-medium">{selectedDispute.respondent.name}</p>
                  <p className="text-sm text-gray-500">ID: {selectedDispute.respondent.id}</p>
                  <p className="text-sm text-gray-500">Role: {selectedDispute.respondent.role}</p>
                </div>
              </div>

              {/* Property and Escrow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Property</p>
                  <p className="font-medium">{selectedDispute.property}</p>
                  <p className="text-sm text-gray-500">ID: {selectedDispute.propertyId}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Escrow / Hold Amount</p>
                  <p className="font-bold text-lg text-blue-600">{selectedDispute.escrowAmount}</p>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Evidence Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDispute.evidence.map((doc, idx) => (
                    <button key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-200">
                      <FileText size={12} />
                      {doc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Thread */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Communication Thread
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedDispute.messages.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-xl ${msg.from === 'Admin' ? 'bg-blue-50 ml-8' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{msg.from}</span>
                        <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2">
                    <Send size={16} />
                    Send
                  </button>
                </div>
              </div>

              {/* Resolution Section for Admins */}
              {selectedDispute.status !== 'Resolved' && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Resolution & Penalty Management</h4>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Enter resolution notes..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Penalty amount (if any)"
                        value={penaltyAmount}
                        onChange={(e) => setPenaltyAmount(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={handleResolve} className="px-4 py-2 bg-emerald-500 text-white rounded-xl">
                        Apply Resolution
                      </button>
                      <button onClick={handleEscalate} className="px-4 py-2 border border-red-300 text-red-600 rounded-xl">
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedDispute.resolution && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-sm text-emerald-800">
                    <strong>Resolution:</strong> {selectedDispute.resolution}
                  </p>
                  {selectedDispute.penaltyApplied && (
                    <p className="text-sm text-red-600 mt-1">
                      <strong>Penalty:</strong> {selectedDispute.penaltyApplied}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeResolution;