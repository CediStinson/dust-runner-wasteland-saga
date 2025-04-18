
import React from 'react';
import { Heart, Shield, Fuel } from 'lucide-react';

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
    <div className="flex flex-col gap-3 items-end w-48">
      {/* Player health bar */}
      <div className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-xs font-mono text-white/80">PILOT</span>
        </div>
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300" 
            style={{ width: `${(playerHealth / maxPlayerHealth) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Hoverbike health bar */}
      <div className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono text-white/80">HOVERBIKE</span>
        </div>
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300" 
            style={{ width: `${(health / maxHealth) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Fuel bar */}
      <div className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Fuel className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-mono text-white/80">FUEL</span>
        </div>
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300" 
            style={{ width: `${(fuel / maxFuel) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatusBars;
