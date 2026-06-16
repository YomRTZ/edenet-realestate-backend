import React, { useState } from 'react';
import { Home } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import PropertyCard from './PropertyCard.jsx';
import StatsCards from './StatsCards.jsx';
import MobileMenuButton from './MobileMenuButton.jsx';
import { useNavigate } from "react-router-dom";
import { userData, tabs, propertiesData } from './data/userData';
import { useProperties } from './useProperties.js';

const CitizenPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab, currentProperties, properties } = useProperties();
const navigate = useNavigate();
  const getCurrentTabLabel = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.label : 'Properties';
  };

  return (
    <div className="min-h-screen w-full m-0 overflow-hidden flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />



      <Sidebar 
        user={userData}

        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-72">
        {/* Constant Header (Add New stays visible; content below scrolls) */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex-shrink-0 w-full">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {getCurrentTabLabel()}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {currentProperties.length} {currentProperties.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>

            <button   onClick={() => navigate("/addproperties")} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all hover:scale-105">
             
              <span className="hidden sm:inline">Add New
               
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content (everything under header scrolls; sidebar remains fixed) */}
        <div className="flex-1 overflow-y-auto">
          <StatsCards properties={properties} />

          <div className="p-6 pt-0">
            {currentProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {currentProperties.map(property => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    type={activeTab}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <Home size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
                <p className="text-gray-400">Start by adding a new property to your portfolio</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenPage;