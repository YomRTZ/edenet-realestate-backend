import React from 'react';
import { Menu, X } from 'lucide-react';

const MobileMenuButton = ({ isOpen, onClick }) => {
  return (
    <div className="lg:hidden fixed top-4 right-4 z-50">
      <button 
        onClick={onClick} 
        className="bg-white p-2 rounded-xl shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};

export default MobileMenuButton;