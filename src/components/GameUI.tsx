
import React from 'react';

interface GameUIProps {
  resources?: number;
  copper?: number;
  health?: number;
  maxHealth?: number;
  fuel?: number;
  maxFuel?: number;
}

const GameUI: React.FC<GameUIProps> = ({ 
  resources = 0, 
  copper = 0,
  health = 100,
  maxHealth = 100,
  fuel = 100,
  maxFuel = 100
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
      <div className="container mx-auto flex justify-between items-end">
        <div className="flex gap-4">
          {/* Metal resources */}
          <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30">
            <div className="flex gap-2 items-center">
              <div className="w-6 h-6 bg-gray-400 rounded-sm border border-gray-300 flex items-center justify-center">
                <div className="w-4 h-1 bg-gray-300"></div>
              </div>
              <span className="font-mono">{resources}</span>
            </div>
          </div>
          
          {/* Copper resources */}
          <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-orange-200 border border-orange-500/30">
            <div className="flex gap-2 items-center">
              <div className="w-6 h-6 bg-orange-600 rounded-full border border-orange-400 flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
              </div>
              <span className="font-mono">{copper}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Fuel bar */}
          <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30">
            <div className="w-32 h-3 bg-yellow-900/70 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full" 
                style={{ width: `${(fuel / maxFuel) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs font-mono text-center mt-1">FUEL</div>
          </div>
          
          {/* Health bar */}
          <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-red-200 border border-red-500/30">
            <div className="w-32 h-3 bg-red-900/70 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${(health / maxHealth) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs font-mono text-center mt-1">HOVERBIKE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
