
import React from 'react';

interface StatusBarsProps {
  playerHealth: number;
  maxPlayerHealth: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
}

const StatusBars: React.FC<StatusBarsProps> = ({
  health,
  maxHealth,
  fuel,
  maxFuel
}) => {
  return (
    <div className="flex flex-col gap-2 items-end">
      {/* Hoverbike health bar - changed to gray */}
      <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-gray-200 border border-gray-500/30 w-40">
        <div className="w-full h-3 bg-gray-900/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-400 rounded-full transition-all duration-500"
            style={{ width: `${(health / maxHealth) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-center mt-1">HOVERBIKE</div>
      </div>
      
      {/* Fuel bar */}
      <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30 w-40">
        <div className="w-full h-3 bg-yellow-900/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500 rounded-full transition-all duration-500"
            style={{ width: `${(fuel / maxFuel) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-center mt-1">FUEL</div>
      </div>
    </div>
  );
};

export default StatusBars;
