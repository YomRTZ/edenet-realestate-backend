import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Home,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  Award,
  Zap
} from 'lucide-react';

const DashboardAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  // Sample analytics data
  const analytics = {
    totalProperties: {
      minted: 1247,
      pending: 23,
      rejected: 12,
      growth: '+8.5%'
    },
    approvalRate: {
      rate: 94.2,
      trend: '+2.3%',
      total: 1282,
      approved: 1207
    },
    avgApprovalTime: {
      hours: 18.4,
      trend: '-2.1 hours',
      minting: 16.2,
      updates: 22.1
    },
    verificationRate: {
      success: 87.3,
      total: 342,
      approved: 298,
      rejected: 44
    },
    revenue: {
      total: '$187,450',
      minting: '$124,800',
      updates: '$32,650',
      verification: '$30,000',
      trend: '+15.3%'
    },
    peakTimes: {
      monday: 145,
      tuesday: 162,
      wednesday: 178,
      thursday: 189,
      friday: 201,
      saturday: 98,
      sunday: 67
    }
  };

  // Sample chart data for approval trends
  const approvalTrends = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    approved: [82, 88, 91, 89, 94, 96],
    rejected: [12, 10, 8, 9, 6, 4]
  };

  // Sample recent requests
  const recentRequests = [
    { id: 'REQ-001', type: 'Mint', property: 'Oceanfront Villa', submitted: '2 hours ago', status: 'pending', timeInQueue: 2 },
    { id: 'REQ-002', type: 'Update', property: 'Downtown Loft', submitted: '5 hours ago', status: 'pending', timeInQueue: 5 },
    { id: 'REQ-003', type: 'Mint', property: 'Mountain Cabin', submitted: '1 day ago', status: 'approved', timeInQueue: 14.5 },
    { id: 'REQ-004', type: 'Mint', property: 'City Apartment', submitted: '2 days ago', status: 'rejected', timeInQueue: 32 },
    { id: 'REQ-005', type: 'Update', property: 'Suburban House', submitted: '3 days ago', status: 'approved', timeInQueue: 28 },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Analytics</h2>
          <p className="text-gray-500 mt-1">Real-time metrics and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw size={18} />
          </button>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Home size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {analytics.totalProperties.growth}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.totalProperties.minted}</p>
          <p className="text-sm text-gray-500">Properties Minted</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-yellow-600">{analytics.totalProperties.pending} pending</span>
            <span className="text-red-600">{analytics.totalProperties.rejected} rejected</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {analytics.approvalRate.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.approvalRate.rate}%</p>
          <p className="text-sm text-gray-500">Approval Rate</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analytics.approvalRate.rate}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{analytics.approvalRate.approved}/{analytics.approvalRate.total} approved</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingDown size={14} />
              {analytics.avgApprovalTime.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.avgApprovalTime.hours}h</p>
          <p className="text-sm text-gray-500">Avg. Approval Time</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-gray-500">Mint: {analytics.avgApprovalTime.minting}h</span>
            <span className="text-gray-500">Update: {analytics.avgApprovalTime.updates}h</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-yellow-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {analytics.revenue.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{analytics.revenue.total}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-gray-500">Minting: {analytics.revenue.minting}</span>
            <span className="text-gray-500">Updates: {analytics.revenue.updates}</span>
          </div>
        </div>
      </div>

      {/* Approval Trends Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Approval Rate Trends</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-gray-600">Rejected</span>
            </div>
          </div>
        </div>
        <div className="relative h-64">
          <div className="absolute bottom-0 left-0 right-0 top-8 flex items-end gap-2">
            {approvalTrends.labels.map((label, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative w-full flex flex-col items-center">
                  <div className="w-full flex justify-center gap-1">
                    <div 
                      className="w-8 bg-emerald-500 rounded-t-lg transition-all duration-500 hover:bg-emerald-600"
                      style={{ height: `${approvalTrends.approved[idx] * 2}px` }}
                    >
                      <div className="text-center text-xs text-emerald-600 font-medium mt-1">
                        {approvalTrends.approved[idx]}%
                      </div>
                    </div>
                    <div 
                      className="w-8 bg-red-400 rounded-t-lg transition-all duration-500 hover:bg-red-500"
                      style={{ height: `${approvalTrends.rejected[idx] * 2}px` }}
                    >
                      <div className="text-center text-xs text-red-600 font-medium mt-1">
                        {approvalTrends.rejected[idx]}%
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Request Times */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            Peak Request Times
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.peakTimes).map(([day, count]) => (
              <div key={day}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{day}</span>
                  <span className="font-medium text-gray-800">{count} requests</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${(count / Math.max(...Object.values(analytics.peakTimes))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <AlertCircle size={14} />
              Peak hours: Friday 2-4 PM (average 45 requests/hour)
            </p>
          </div>
        </div>

        {/* Recent Requests Queue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Requests</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View all →</button>
          </div>
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${request.status === 'pending' ? 'bg-yellow-500 animate-pulse' : request.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{request.property}</p>
                    <p className="text-xs text-gray-500">{request.type} • {request.submitted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <span className="text-xs text-gray-400">{request.timeInQueue}h in queue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Verification Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">User Verification Success Rate</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#10b981" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${(analytics.verificationRate.success / 100) * 351.86} 351.86`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{analytics.verificationRate.success}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Approved</span>
                <span className="font-semibold text-emerald-600">{analytics.verificationRate.approved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">{analytics.verificationRate.rejected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold text-gray-800">{analytics.verificationRate.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Award size={24} />
            <h3 className="font-semibold">Efficiency Score</h3>
          </div>
          <p className="text-3xl font-bold mt-2">92<span className="text-xl">/100</span></p>
          <p className="text-blue-100 text-sm mt-1">Processing efficiency rating</p>
          <div className="mt-4 pt-4 border-t border-blue-400">
            <div className="flex justify-between text-sm">
              <span>Response time</span>
              <span className="font-medium">A+</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Accuracy</span>
              <span className="font-medium">96.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;