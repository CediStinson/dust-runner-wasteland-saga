
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
  playerHealth,
  maxPlayerHealth,
  health,
  maxHealth,
  fuel,
  maxFuel
}) => {
  return (
    <div className="flex flex-col gap-1.5 items-end">
      {/* Player health bar */}
      <div className="bg-black/50 p-2.5 rounded-lg backdrop-blur-sm text-red-200 border border-red-500/30 w-36">
        <div className="w-full h-2.5 bg-red-900/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 rounded-full" 
            style={{ width: `${(playerHealth / maxPlayerHealth) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-center mt-1">PLAYER</div>
      </div>
      
      {/* Hoverbike health bar - changed to gray */}
      <div className="bg-black/50 p-2.5 rounded-lg backdrop-blur-sm text-gray-200 border border-gray-500/30 w-36">
        <div className="w-full h-2.5 bg-gray-900/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-400 rounded-full" 
            style={{ width: `${(health / maxHealth) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-center mt-1">HOVERBIKE</div>
      </div>
      
      {/* Fuel bar */}
      <div className="bg-black/50 p-2.5 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30 w-36">
        <div className="w-full h-2.5 bg-yellow-900/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500 rounded-full" 
            style={{ width: `${(fuel / maxFuel) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-center mt-1">FUEL</div>
      </div>
    </div>
  );
};

export default StatusBars;
