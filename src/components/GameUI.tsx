
import React from 'react';

interface GameUIProps {
  resources?: number;
  health?: number;
  maxHealth?: number;
}

const GameUI: React.FC<GameUIProps> = ({ 
  resources = 0, 
  health = 100,
  maxHealth = 100
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
      <div className="container mx-auto flex justify-between items-end">
        <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30">
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 bg-gray-400 rounded-full border border-gray-300"></div>
            <span className="font-mono">{resources}</span>
          </div>
        </div>
        
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
  );
};

export default GameUI;
