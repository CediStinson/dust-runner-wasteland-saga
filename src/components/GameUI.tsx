
import React, { useState } from 'react';
import { Settings, Compass, Sun, Moon } from 'lucide-react';
import { Progress } from './ui/progress';

interface GameUIProps {
  resources?: number;
  copper?: number;
  health?: number;
  maxHealth?: number;
  fuel?: number;
  maxFuel?: number;
  playerHealth?: number;
  maxPlayerHealth?: number;
  worldX?: number;
  worldY?: number;
  baseWorldX?: number;
  baseWorldY?: number;
  dayTimeIcon?: string;
  dayTimeAngle?: number;
}

const GameUI: React.FC<GameUIProps> = ({ 
  resources = 0,
  copper = 0,
  health = 100,
  maxHealth = 100,
  fuel = 100,
  maxFuel = 100,
  playerHealth = 100,
  maxPlayerHealth = 100,
  worldX = 0,
  worldY = 0,
  baseWorldX = 0,
  baseWorldY = 0,
  dayTimeIcon = "sun",
  dayTimeAngle = 0
}) => {
  const [showControls, setShowControls] = useState(false);

  const calculateCompassAngle = () => {
    // Calculate the angle from current position to home base
    if (worldX === baseWorldX && worldY === baseWorldY) return 0;
    
    const dx = baseWorldX - worldX;
    const dy = baseWorldY - worldY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex justify-between">
          {/* Settings button */}
          <div className="pointer-events-auto">
            <button 
              onClick={() => setShowControls(!showControls)}
              className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
            >
              <Settings size={24} />
            </button>
          </div>
          
          {/* Compass and Day/Night Indicator */}
          <div className="flex flex-col items-center">
            {/* Day/Night Indicator */}
            <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm text-white border border-white/30 w-16 h-16 flex items-center justify-center relative mb-2">
              <div className="absolute w-full h-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute w-14 h-0.5 bg-white/30 rounded-full"></div>
              </div>
              
              {/* Sun or Moon icon that rotates around the circle */}
              <div 
                className="absolute w-full h-full flex items-center justify-center"
                style={{ transform: `rotate(${dayTimeAngle}rad)` }}
              >
                <div className="w-0.5 h-14 flex flex-col items-center">
                  <div className="flex-1"></div>
                  {dayTimeIcon === "sun" ? (
                    <Sun className="text-yellow-400" size={16} />
                  ) : (
                    <Moon className="text-blue-200" size={16} />
                  )}
                </div>
              </div>
              
              {/* Horizontal line */}
              <div className="w-14 h-0.5 bg-white/30"></div>
            </div>
            
            {/* Compass */}
            <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm text-white border border-white/30 w-16 h-16 flex items-center justify-center relative">
              <div className="absolute w-full h-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute w-14 h-0.5 bg-white/30 rounded-full"></div>
              </div>
              <div 
                className="absolute w-full h-full flex items-center justify-center"
                style={{ transform: `rotate(${calculateCompassAngle()}deg)` }}
              >
                <div className="w-0.5 h-14 flex flex-col">
                  <div className="flex-1"></div>
                  <div className="h-7 w-0.5 bg-red-500"></div>
                </div>
              </div>
              <Compass 
                className="text-white/70" 
                size={46}
              />
            </div>
            <div className="bg-black/50 mt-2 px-3 py-1 rounded-md backdrop-blur-sm text-white/80 border border-white/20 text-sm">
              Zone: {worldX},{worldY}
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls modal */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/80 rounded-lg p-6 border border-white/20 backdrop-blur-md pointer-events-auto max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
            <ul className="space-y-2 text-left">
              <li className="text-gray-300">Arrow keys - Move character/control hoverbike</li>
              <li className="text-gray-300">F - Enter/exit hoverbike</li>
              <li className="text-gray-300">E - Collect metal/mine copper</li>
              <li className="text-gray-300">S - Upgrade hoverbike speed with metal</li>
            </ul>
            <button 
              onClick={() => setShowControls(false)}
              className="mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
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
          
          <div className="flex flex-col gap-2 items-end">
            {/* Player health bar */}
            <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-red-200 border border-red-500/30 w-40">
              <div className="w-full h-3 bg-red-900/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${(playerHealth / maxPlayerHealth) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs font-mono text-center mt-1">PLAYER</div>
            </div>
            
            {/* Hoverbike health bar - changed to gray */}
            <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-gray-200 border border-gray-500/30 w-40">
              <div className="w-full h-3 bg-gray-900/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full" 
                  style={{ width: `${(health / maxHealth) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs font-mono text-center mt-1">HOVERBIKE</div>
            </div>
            
            {/* Fuel bar */}
            <div className="bg-black/50 p-3 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30 w-40">
              <div className="w-full h-3 bg-yellow-900/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${(fuel / maxFuel) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs font-mono text-center mt-1">FUEL</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameUI;
