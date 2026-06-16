import React from 'react';
import { Home, Key, DollarSign, MapPin, Settings, LogOut } from 'lucide-react';

const iconMap = {
  Home: Home,
  Key: Key,
  DollarSign: DollarSign
};

const Sidebar = ({ user, tabs, activeTab, onTabChange, isMobileMenuOpen, onClose }) => {
  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-white shadow-2xl z-40 transition-all duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } w-72 flex flex-col`}>
        {/* Profile Section - Fixed */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="relative mb-4">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-100 shadow-lg" />
            <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
            <MapPin size={14} />
            <span>{user.location}</span>
          </div>
          <div className="mt-4 flex gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-800">{user.totalProperties}</p>
              <p className="text-xs text-gray-500">Properties</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{user.totalValue}</p>
              <p className="text-xs text-gray-500">Total Value</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{user.memberSince}</p>
              <p className="text-xs text-gray-500">Member Since</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = iconMap[tab.icon];
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
                  }`}
                >
                  <Icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions - Fixed */}
        <div className="p-4 border-t border-gray-100 space-y-2 flex-shrink-0">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;