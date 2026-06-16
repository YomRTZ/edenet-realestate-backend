import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Mail,
  Send,
  Clock,
  Calendar,
  Settings,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Flag,
  TrendingUp,
  AlertCircle,
  Users,
  Home,
  DollarSign,
  Zap
} from 'lucide-react';

const NotificationsAlerts = () => {
  const [selectedTab, setSelectedTab] = useState('active');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [reportType, setReportType] = useState('daily');

  const activeAlerts = [
    {
      id: 'ALT-001',
      type: 'threshold',
      severity: 'warning',
      title: 'Pending Review Queue Exceeds Threshold',
      message: '50+ property approvals pending review (Current: 53)',
      timestamp: '2024-01-15T08:30:00',
      threshold: 50,
      current: 53,
      actionRequired: true
    },
    {
      id: 'ALT-002',
      type: 'suspicious',
      severity: 'critical',
      title: 'Suspicious Activity Detected',
      message: 'Unusual transaction pattern from address 0x742d...',
      timestamp: '2024-01-15T02:15:00',
      actionRequired: true,
      details: 'Multiple rapid property transfers detected'
    },
    {
      id: 'ALT-003',
      type: 'system',
      severity: 'error',
      title: 'System Error: Database Connection',
      message: 'Database connection timeout on replica node',
      timestamp: '2024-01-14T23:45:00',
      actionRequired: true,
      resolved: false
    }
  ];

  const scheduledReports = [
    { id: 'RPT-001', name: 'Daily Approval Summary', frequency: 'Daily', time: '09:00 AM', recipients: ['sarah.chen@government.gov', 'admin@government.gov'], lastSent: '2024-01-15' },
    { id: 'RPT-002', name: 'Weekly Market Analysis', frequency: 'Weekly (Monday)', time: '08:00 AM', recipients: ['analytics@government.gov'], lastSent: '2024-01-08' },
    { id: 'RPT-003', name: 'Monthly Revenue Report', frequency: 'Monthly (1st)', time: '10:00 AM', recipients: ['finance@government.gov', 'sarah.chen@government.gov'], lastSent: '2024-01-01' },
  ];

  const recentNotifications = [
    { id: 'NOT-001', title: 'Property Approved', message: 'Oceanfront Villa (PRP-12345) has been approved', timestamp: '2024-01-15T10:30:00', read: false, type: 'success' },
    { id: 'NOT-002', title: 'New User Verification', message: '3 new users pending KYC verification', timestamp: '2024-01-15T09:15:00', read: false, type: 'info' },
    { id: 'NOT-003', title: 'Dispute Resolved', message: 'Dispute DSP-003 has been resolved', timestamp: '2024-01-14T16:20:00', read: true, type: 'success' },
  ];

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertTriangle size={16} className="text-red-500" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const handleSendReport = () => {
    alert(`Sending ${reportType} report to ${emailRecipient}`);
    setEmailRecipient('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Notifications & Alerts</h2>
        <p className="text-gray-500 mt-1">Monitor system alerts and manage scheduled reports</p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-500">Critical Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">8</p>
              <p className="text-sm text-gray-500">Warning Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-500">Unread</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">4</p>
              <p className="text-sm text-gray-500">Scheduled Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('active')}
          className={`px-6 py-3 font-medium transition-all ${selectedTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Active Alerts
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">3</span>
        </button>
        <button
          onClick={() => setSelectedTab('reports')}
          className={`px-6 py-3 font-medium transition-all ${selectedTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Scheduled Reports
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`px-6 py-3 font-medium transition-all ${selectedTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Notification History
        </button>
      </div>

      {/* Active Alerts Tab */}
      {selectedTab === 'active' && (
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className={`rounded-2xl border p-5 ${getSeverityColor(alert.severity)}`}>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityIcon(alert.severity)}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-200 text-red-700' :
                      alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-700' :
                      'bg-red-200 text-red-700'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{alert.id}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                  {alert.type === 'threshold' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Queue Size: {alert.current}</span>
                        <span>Threshold: {alert.threshold}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(alert.current / alert.threshold) * 100}%` }}></div>
                      </div>
                    </div>
                  )}
                  {alert.details && (
                    <p className="text-xs text-gray-500 mt-2">Details: {alert.details}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Investigate</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="space-y-6">
          {/* Send Report Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Send size={18} className="text-blue-500" />
              Send Ad-hoc Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="custom">Custom Range</option>
              </select>
              <input
                type="email"
                placeholder="Recipient Email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg"
              />
              <button onClick={handleSendReport} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
                <Send size={16} />
                Send Report
              </button>
            </div>
          </div>

          {/* Scheduled Reports List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Scheduled Reports</h3>
              <button className="text-sm text-blue-600 flex items-center gap-1"><Plus size={14} /> New Schedule</button>
            </div>
            <div className="divide-y divide-gray-100">
              {scheduledReports.map((report) => (
                <div key={report.id} className="p-5 flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800">{report.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Frequency: {report.frequency} at {report.time}</p>
                    <p className="text-xs text-gray-400 mt-1">Recipients: {report.recipients.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Last sent: {report.lastSent}</span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit size={16} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg"><Trash2 size={16} /></button>
                    <button className="px-3 py-1 bg-gray-100 rounded-lg text-sm">Run Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification History Tab */}
      {selectedTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Recent Notifications</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Filter size={16} /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Download size={16} /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw size={16} /></button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notif) => (
              <div key={notif.id} className={`p-4 hover:bg-gray-50 transition ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  {notif.type === 'success' ? <CheckCircle size={18} className="text-emerald-500 mt-0.5" /> : <Info size={18} className="text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800">{notif.title}</h4>
                      {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600"><Eye size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 text-center">
            <button className="text-sm text-blue-600">Load More</button>
          </div>
        </div>
      )}

      {/* Threshold Alert Configuration */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings size={18} className="text-gray-600" />
          Alert Thresholds Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Pending Approvals Threshold</label>
            <input type="number" defaultValue="50" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Suspicious Activity Score</label>
            <input type="number" defaultValue="75" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">API Error Rate (%)</label>
            <input type="number" defaultValue="1" step="0.1" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Dispute Escalation Days</label>
            <input type="number" defaultValue="7" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Thresholds</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsAlerts;