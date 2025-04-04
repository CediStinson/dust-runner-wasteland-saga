
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FuelTipProps {
  visible: boolean;
  onDismiss: () => void;
}

const FuelTip: React.FC<FuelTipProps> = ({ visible, onDismiss }) => {
  if (!visible) return null;
  
  return (
    <div className="bg-black/70 rounded-lg p-3 border border-red-500 backdrop-blur-sm text-white w-48 relative">
      <button 
        onClick={onDismiss}
        className="absolute top-1 right-1 text-white hover:text-gray-300"
      >
        <X size={16} />
      </button>
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <span className="font-bold text-sm">FUEL STATION</span>
      </div>
      <p className="text-xs">Be careful not to run out of gas and refill your hoverbike at the fuel station whenever you run low</p>
    </div>
  );
};

export default FuelTip;
