import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckCircle, 
  Users, 
  UserCheck, 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Scale, 
  Wallet, 
  Settings, 
  Bell,
  Menu,
  X,
  LogOut,
  Search,
  ChevronDown,
  Home,
  Sparkles,
  Activity,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

// Import all dashboard components
import PropertyApprovals from './PropertyApprovals';
import VerificationUsers from './VerificationUsers';
import ClientsDashboard from './ClientsDashboard';
import DashboardAnalytics from './DashboardAnalytics';
import AuditCompliance from './AuditCompliance';
import MarketMonitoring from './MarketMonitoring';
import DisputeResolution from './DisputeResolution';
import FinancialRevenue from './FinancialRevenue';
import SystemAdministration from './SystemAdministration';
import NotificationsAlerts from './NotificationsAlerts';

const GovernmentDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New property approval request', time: '5 min ago', read: false },
    { id: 2, title: 'System update completed', time: '1 hour ago', read: false },
    { id: 3, title: 'Daily report ready', time: '3 hours ago', read: true },
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'analytics', label: 'Dashboard Analytics', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600', description: 'Overview & metrics' },
    { id: 'approvals', label: 'Property Approvals', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', description: 'Review & mint' },
    { id: 'verification', label: 'Verification & Users', icon: Users, color: 'from-purple-500 to-purple-600', description: 'KYC management' },
    { id: 'clients', label: 'Clients Dashboard', icon: UserCheck, color: 'from-cyan-500 to-cyan-600', description: 'User insights' },
    { id: 'audit', label: 'Audit & Compliance', icon: FileText, color: 'from-orange-500 to-orange-600', description: 'Track actions' },
    { id: 'market', label: 'Market Monitoring', icon: TrendingUp, color: 'from-green-500 to-green-600', description: 'Real-time trends' },
    { id: 'disputes', label: 'Dispute Resolution', icon: Scale, color: 'from-red-500 to-red-600', description: 'Conflict mgmt' },
    { id: 'financial', label: 'Financial Revenue', icon: Wallet, color: 'from-yellow-500 to-yellow-600', description: 'Revenue tracking' },
    { id: 'system', label: 'System Administration', icon: Settings, color: 'from-gray-500 to-gray-600', description: 'Configure system' },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell, color: 'from-pink-500 to-pink-600', description: 'Alerts & reports' },
  ];

  const renderComponent = () => {
    switch(activeTab) {
      case 'approvals': return <PropertyApprovals />;
      case 'verification': return <VerificationUsers />;
      case 'clients': return <ClientsDashboard />;
      case 'analytics': return <DashboardAnalytics />;
      case 'audit': return <AuditCompliance />;
      case 'market': return <MarketMonitoring />;
      case 'disputes': return <DisputeResolution />;
      case 'financial': return <FinancialRevenue />;
      case 'system': return <SystemAdministration />;
      case 'notifications': return <NotificationsAlerts />;
      default: return <DashboardAnalytics />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`h-screen w-screen overflow-hidden fixed inset-0 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200'}`}>
      {/* Fixed Sidebar */}
      <aside className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } w-72 flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl flex flex-col`}>
        
        {/* Sidebar Header - Fixed */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex-shrink-0`}>
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 mb-6 w-full hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-60"></div>
              <div className="relative w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Scale size={24} className="text-white" />
              </div>
            </div>
            <div className="text-left">
              <h2 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>GovChain</h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Land Registry Admin</p>
            </div>
          </button>
          
          {/* Welcome Message */}
          <div className={`p-3 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-blue-500" />
              <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>Welcome back!</p>
            </div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dr. Sarah Chen</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>You have 24 pending actions</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>Pending</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-700'}`}>24</p>
            </div>
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-emerald-50'}`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-emerald-600'}`}>Today's Revenue</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-emerald-700'}`}>$4,250</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-1">
            <p className={`text-xs uppercase tracking-wider px-3 mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Main Menu</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                {activeTab === item.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer - Fixed */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex-shrink-0`}>
          <div className={`p-3 rounded-xl mb-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>System Health</span>
              </div>
              <span className="text-xs text-emerald-500">98.5%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '98.5%' }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-gray-400" />
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Uptime 99.98%</span>
              </div>
            </div>
          </div>
          
          <button className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDarkMode 
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
              : 'text-red-600 hover:bg-red-50'
          }`}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="h-full flex flex-col lg:ml-72">
        {/* Fixed Top Navbar */}
        <header className={`sticky top-0 z-30 transition-all duration-300 flex-shrink-0 ${
          isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        } backdrop-blur-sm border-b shadow-sm`}>
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-xl transition-all ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'
                }`}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <button 
                onClick={handleLogoClick}
                className="flex items-center gap-2 lg:hidden"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Scale size={16} className="text-white" />
                </div>
                <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>GovChain</span>
              </button>
              
              <div className="hidden lg:block">
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Government Dashboard
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Land Registry Admin Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative hidden lg:block">
                <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search across platform..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border border-gray-200 focus:bg-white'
                  }`}
                />
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-all ${
                  isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-all relative ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Bell size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                  }`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Notifications</h3>
                        <button className="text-xs text-blue-500">Mark all read</button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b transition cursor-pointer ${
                          !notif.read ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                        } ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <div className="flex-1">
                              <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{notif.title}</p>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=40&h=40&fit=crop"
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all"
                      alt="Admin"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></div>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dr. Sarah Chen</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chief Administrator</p>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </button>
                
                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden z-50 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                  }`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-3">
                        <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=40&h=40&fit=crop" className="w-10 h-10 rounded-xl object-cover" alt="Admin" />
                        <div>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dr. Sarah Chen</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>sarah.chen@gov.org</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'
                      }`}>
                        Profile Settings
                      </button>
                      <button className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'
                      }`}>
                        Security
                      </button>
                      <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`} />
                      <button className={`w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 transition-all ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'
                      }`}>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                {menuItems.find(m => m.id === activeTab)?.icon && (
                  <div className={`p-2 rounded-xl ${
                    activeTab === 'analytics' ? 'bg-blue-100 text-blue-600' :
                    activeTab === 'approvals' ? 'bg-emerald-100 text-emerald-600' :
                    activeTab === 'verification' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {React.createElement(menuItems.find(m => m.id === activeTab)?.icon, { size: 18 })}
                  </div>
                )}
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {menuItems.find(m => m.id === activeTab)?.label}
                </h1>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {menuItems.find(m => m.id === activeTab)?.description}
              </p>
            </div>
            
            {renderComponent()}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default GovernmentDashboard;