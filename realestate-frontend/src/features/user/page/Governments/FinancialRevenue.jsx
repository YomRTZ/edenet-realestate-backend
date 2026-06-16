import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';

const FinancialRevenue = () => {
  const [timeRange, setTimeRange] = useState('month');

  const financialData = {
    totalRevenue: {
      amount: '$187,450',
      trend: '+15.3%',
      change: '+$24,850'
    },
    platformFees: {
      amount: '$62,480',
      percentage: 33.4,
      trend: '+12.1%'
    },
    mintingFees: {
      amount: '$89,200',
      percentage: 47.6,
      trend: '+18.5%'
    },
    updateFees: {
      amount: '$35,770',
      percentage: 19.1,
      trend: '+8.2%'
    },
    paymentSuccessRate: {
      rate: 98.7,
      trend: '+0.5%'
    },
    refundsChargebacks: {
      amount: '$4,250',
      percentage: 2.27,
      trend: '-0.8%'
    }
  };

  const monthlyRevenue = [
    { month: 'Jul', revenue: 12450, fees: 4150, minting: 6200 },
    { month: 'Aug', revenue: 13890, fees: 4630, minting: 6800 },
    { month: 'Sep', revenue: 15240, fees: 5080, minting: 7500 },
    { month: 'Oct', revenue: 16820, fees: 5600, minting: 8200 },
    { month: 'Nov', revenue: 17950, fees: 5980, minting: 8700 },
    { month: 'Dec', revenue: 18745, fees: 6250, minting: 9100 },
  ];

  const recentTransactions = [
    { id: 'TXN-001', type: 'Mint', property: 'Oceanfront Villa', amount: '$2,500', status: 'completed', date: '2024-01-15', user: 'John Anderson' },
    { id: 'TXN-002', type: 'Update', property: 'Sunset Heights', amount: '$350', status: 'completed', date: '2024-01-14', user: 'Alex Morgan' },
    { id: 'TXN-003', type: 'Mint', property: 'Downtown Loft', amount: '$2,500', status: 'pending', date: '2024-01-13', user: 'Sarah Martinez' },
    { id: 'TXN-004', type: 'Verification', property: 'KYC Check', amount: '$150', status: 'completed', date: '2024-01-12', user: 'Emily Davis' },
    { id: 'TXN-005', type: 'Update', property: 'Mountain Cabin', amount: '$350', status: 'refunded', date: '2024-01-10', user: 'Michael Chang' },
  ];

  const revenueForecast = {
    nextMonth: '$205,000',
    nextQuarter: '$620,000',
    nextYear: '$2,450,000',
    growth: '+12%'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Financial & Revenue Dashboard</h2>
          <p className="text-gray-500 mt-1">Track platform revenue, fees, and transaction metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Revenue Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet size={24} className="text-emerald-200" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded-lg">{financialData.totalRevenue.trend}</span>
          </div>
          <p className="text-2xl font-bold">{financialData.totalRevenue.amount}</p>
          <p className="text-emerald-100 text-sm">Total Revenue</p>
          <p className="text-xs text-emerald-200 mt-2">{financialData.totalRevenue.change} vs last month</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Percent size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingUp size={14} />
              {financialData.paymentSuccessRate.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{financialData.paymentSuccessRate.rate}%</p>
          <p className="text-sm text-gray-500">Payment Success Rate</p>
          <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${financialData.paymentSuccessRate.rate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-purple-600" />
            </div>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingDown size={14} />
              {financialData.refundsChargebacks.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{financialData.refundsChargebacks.amount}</p>
          <p className="text-sm text-gray-500">Refunds & Chargebacks</p>
          <p className="text-xs text-gray-400 mt-1">{financialData.refundsChargebacks.percentage}% of total</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{revenueForecast.nextMonth}</p>
          <p className="text-sm text-gray-500">Forecasted Next Month</p>
          <p className="text-xs text-emerald-600 mt-1">{revenueForecast.growth} projected growth</p>
        </div>
      </div>

      {/* Revenue Breakdown Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="20" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="#3b82f6" strokeWidth="20" fill="none" 
                  strokeDasharray={`${(financialData.mintingFees.percentage / 100) * 439.82} 439.82`} />
                <circle cx="80" cy="80" r="50" stroke="#8b5cf6" strokeWidth="20" fill="none"
                  strokeDasharray={`${(financialData.platformFees.percentage / 100) * 314.16} 314.16`}
                  strokeDashoffset="-0" />
                <circle cx="80" cy="80" r="30" stroke="#f59e0b" strokeWidth="20" fill="none"
                  strokeDasharray={`${(financialData.updateFees.percentage / 100) * 188.5} 188.5`}
                  strokeDashoffset="-0" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-800">100%</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Minting Fees</span>
                </div>
                <span className="font-semibold">{financialData.mintingFees.amount}</span>
                <span className="text-sm text-gray-500">({financialData.mintingFees.percentage}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Platform Fees</span>
                </div>
                <span className="font-semibold">{financialData.platformFees.amount}</span>
                <span className="text-sm text-gray-500">({financialData.platformFees.percentage}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Update Fees</span>
                </div>
                <span className="font-semibold">{financialData.updateFees.amount}</span>
                <span className="text-sm text-gray-500">({financialData.updateFees.percentage}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
          <div className="relative h-48">
            <div className="absolute bottom-0 left-0 right-0 top-8 flex items-end gap-2">
              {monthlyRevenue.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="w-full flex justify-center gap-1">
                      <div className="w-6 bg-blue-500 rounded-t-lg" style={{ height: `${(data.revenue / 20000) * 100}px` }}>
                        <div className="text-center text-xs text-blue-600 font-medium mt-1">{data.revenue}</div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded"></div><span>Revenue</span></div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Property/Service</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{tx.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'Mint' ? 'bg-blue-100 text-blue-700' :
                      tx.type === 'Update' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.property}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.user}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{tx.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-xs ${
                      tx.status === 'completed' ? 'text-emerald-600' :
                      tx.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {tx.status === 'completed' && <CheckCircle size={12} />}
                      {tx.status === 'pending' && <Clock size={12} />}
                      {tx.status === 'refunded' && <AlertCircle size={12} />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Forecasting */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
          <p className="text-sm text-blue-600">Next Month Forecast</p>
          <p className="text-2xl font-bold text-blue-700">{revenueForecast.nextMonth}</p>
          <p className="text-xs text-blue-500 mt-1">↑ 12% vs current</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4">
          <p className="text-sm text-purple-600">Next Quarter Forecast</p>
          <p className="text-2xl font-bold text-purple-700">{revenueForecast.nextQuarter}</p>
          <p className="text-xs text-purple-500 mt-1">Based on current growth rate</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4">
          <p className="text-sm text-emerald-600">Annual Forecast</p>
          <p className="text-2xl font-bold text-emerald-700">{revenueForecast.nextYear}</p>
          <p className="text-xs text-emerald-500 mt-1">Estimated total</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialRevenue;