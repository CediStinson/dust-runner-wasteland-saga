
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import DayNightIndicator from './ui/game/DayNightIndicator';
import CompassIndicator from './ui/game/CompassIndicator';
import ResourcesDisplay from './ui/game/ResourcesDisplay';
import StatusBars from './ui/game/StatusBars';
import ControlsModal from './ui/game/ControlsModal';

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
            <DayNightIndicator dayTimeIcon={dayTimeIcon} dayTimeAngle={dayTimeAngle} />
            
            {/* Compass */}
            <CompassIndicator 
              worldX={worldX} 
              worldY={worldY} 
              baseWorldX={baseWorldX} 
              baseWorldY={baseWorldY} 
            />
          </div>
        </div>
      </div>
      
      {/* Controls modal */}
      <ControlsModal showControls={showControls} setShowControls={setShowControls} />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex justify-between items-end">
          {/* Resources */}
          <ResourcesDisplay resources={resources} copper={copper} />
          
          {/* Status Bars */}
          <StatusBars 
            playerHealth={playerHealth}
            maxPlayerHealth={maxPlayerHealth}
            health={health}
            maxHealth={maxHealth}
            fuel={fuel}
            maxFuel={maxFuel}
          />
        </div>
      </div>
    </>
  );
};

export default GameUI;
