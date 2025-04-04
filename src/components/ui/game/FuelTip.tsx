
import React, { useState } from 'react';

interface FuelTipProps {
  onDismiss: () => void;
}

const FuelTip: React.FC<FuelTipProps> = ({ onDismiss }) => {
  return (
    <div className="absolute right-32 bottom-24 pointer-events-auto animate-fade-in">
      <div className="relative bg-black/70 border border-red-500 p-3 rounded-lg max-w-xs text-white">
        {/* Red circle pointing to fuel station */}
        <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
          <div className="w-12 h-12 border-2 border-red-500 rounded-full animate-pulse opacity-70"></div>
          <div className="absolute left-full top-1/2 w-10 h-0 border-t-2 border-red-500 border-dashed"></div>
        </div>
        
        <div className="flex justify-between items-start">
          <p className="text-sm">Be careful not to run out of gas and refill your hoverbike at the fuel station whenever you run low.</p>
          <button 
            onClick={onDismiss}
            className="ml-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuelTip;
