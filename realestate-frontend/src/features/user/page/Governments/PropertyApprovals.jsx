import React, { useEffect, useMemo, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { propertiesApi } from '../../../property/api/properties.api';

const PropertyApprovals = () => {

  const [selectedTab, setSelectedTab] = useState('mint'); // mint or update
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const list = await propertiesApi.getPendingProperties();
        if (!mounted) return;
        // Backend returns: { id, tokenId, status, title, city, state, price, bedrooms, bathrooms, propertyType, listingType, ownerWallet, ... }
        setPendingProperties(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load pending properties');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pendingRequestsForUI = useMemo(() => {
    // This page is currently wired to show “mint pending” only.
    // For the update tab, keep empty list for now.
    const mapped = pendingProperties.map((p) => ({
      id: p.id,
      propertyTitle: p.title,
      location: `${p.city ?? ''}${p.city && p.state ? ', ' : ''}${p.state ?? ''}`.trim() || 'N/A',
      owner: p.ownerWallet,
      price: p.price,
      propertyType: p.propertyType,
      area: p.areaSize ? `${p.areaSize} sqft` : 'N/A',
      landSize: p.lotSize ? `${p.lotSize}` : 'N/A',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      yearBuilt: p.yearBuilt,
      documents: [],
      submittedAt: p.createdAt || new Date().toISOString(),
      blockchainTx: p.chainHash,
      priority: 'Medium',
      // update tab compatibility placeholders
      requestedValue: p.price,
      currentValue: p.price,
      reason: '',
    }));

    return selectedTab === 'mint' ? mapped : [];
  }, [pendingProperties, selectedTab]);

  const currentRequests = pendingRequestsForUI;


  const handleApprove = (requestId) => {
    console.log(`Approve clicked for pending property ${requestId}. Backend approve/reject endpoint not implemented in this repo UI.`);
    alert(`Approve for ${requestId} is not implemented yet.`);
  };

  const handleReject = (requestId) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const submitRejection = () => {
    console.log(`Rejecting ${selectedRequestId} with reason: ${rejectionReason}`);
    alert(`Request ${selectedRequestId} rejected with reason: ${rejectionReason}`);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const viewPropertyDetails = (property) => {
    setSelectedProperty(property);
    setShowDetailModal(true);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Property Approvals</h2>
          <p className="text-gray-500 mt-1">Review and approve property minting and update requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Filter size={18} />
          </button>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('mint')}
          className={`px-6 py-3 font-medium transition-all relative ${
            selectedTab === 'mint'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Mint Requests
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
            {pendingProperties.length}
          </span>
        </button>
        <button
          onClick={() => setSelectedTab('update')}
          className={`px-6 py-3 font-medium transition-all relative ${
            selectedTab === 'update'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          disabled
          title="Update requests not implemented yet"
          style={{ opacity: 0.6, cursor: 'not-allowed' }}
        >
          Pending Update Requests
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
            0
          </span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading && (
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600">Loading pending properties...</div>
        )}
        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">{error}</div>
        )}
        {!loading && !error && currentRequests.length === 0 && (
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600">No pending properties.</div>
        )}
        {currentRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                      <FileText size={22} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800">{request.propertyTitle}</h3>
                        {request.priority && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority} Priority
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          {request.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>Owner: {request.owner || request.submittedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            Waiting: {Math.max(0, Math.floor((Date.now() - new Date(request.submittedAt)) / (1000 * 60 * 60)))} hours
                          </span>

                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Price/Value</p>
                          <p className="font-semibold text-gray-800">
                            {selectedTab === 'mint' ? request.price : request.requestedValue}
                          </p>
                          {selectedTab === 'update' && (
                            <p className="text-xs text-gray-400 line-through">Was: {request.currentValue}</p>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-semibold text-gray-800">{request.propertyType || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Area</p>
                          <p className="font-semibold text-gray-800">{request.area || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Beds/Baths</p>
                          <p className="font-semibold text-gray-800">
                            {request.bedrooms ? `${request.bedrooms} / ${request.bathrooms}` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {selectedTab === 'update' && request.reason && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-700 font-medium">Update Reason:</p>
                          <p className="text-sm text-yellow-800">{request.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewPropertyDetails(request)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-1"
                  >
                    <Eye size={16} />
                    <span className="text-sm">Preview</span>
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Property Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Property Title</label>
                  <p className="font-semibold">{selectedProperty.propertyTitle}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="font-semibold">{selectedProperty.location}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Owner</label>
                  <p className="font-semibold">{selectedProperty.owner || selectedProperty.submittedBy}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Blockchain Transaction</label>
                  <p className="font-mono text-sm">{selectedProperty.blockchainTx || 'Pending'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Documents</label>
                  <div className="space-y-1 mt-1">
                    {selectedProperty.documents?.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                        <FileText size={14} />
                        <a href="#" className="hover:underline">{doc}</a>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Additional Info</label>
                  <p className="text-sm">Year Built: {selectedProperty.yearBuilt || 'N/A'}</p>
                  <p className="text-sm">Land Size: {selectedProperty.landSize || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border rounded-lg">
                Close
              </button>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg" onClick={() => {
                handleApprove(selectedProperty.id);
                setShowDetailModal(false);
              }}>
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Reject Request</h3>
              <p className="text-gray-500 text-sm mt-1">Please provide a reason for rejection</p>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter detailed reason for rejection..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button onClick={submitRejection} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyApprovals;