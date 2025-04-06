
import React, { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import DayNightIndicator from './ui/game/DayNightIndicator';
import CompassIndicator from './ui/game/CompassIndicator';
import ResourcesDisplay from './ui/game/ResourcesDisplay';
import StatusBars from './ui/game/StatusBars';
import ControlsModal from './ui/game/ControlsModal';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  refueling?: boolean;
  refuelProgress?: number;
  onSaveGame?: () => void;
  onResetGame?: () => void;
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
  dayTimeAngle = 0,
  refueling = false,
  refuelProgress = 0,
  onSaveGame,
  onResetGame
}) => {
  const [showControls, setShowControls] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveGame = () => {
    if (onSaveGame) {
      onSaveGame();
    } else {
      toast({
        title: "Save function not available",
        description: "The save function is not currently available.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-2.5 pointer-events-none">
        <div className="container mx-auto flex justify-between">
          {/* Settings and Save buttons */}
          <div className="pointer-events-auto flex gap-2">
            <button 
              onClick={() => setShowControls(!showControls)}
              className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
            >
              <Settings size={18} />
            </button>
            
            <button 
              onClick={handleSaveGame}
              className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
            >
              <Save size={18} />
            </button>
          </div>
          
          {/* Compass and Day/Night Indicator */}
          <div className="flex flex-col items-center scale-85 origin-top">
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
      <ControlsModal 
        showControls={showControls} 
        setShowControls={setShowControls} 
        onResetGame={onResetGame}
      />
      
      {/* Refueling indicator */}
      {refueling && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/70 p-2 rounded-lg backdrop-blur-md border border-white/20">
            <div className="text-white text-center mb-1 text-sm">Refueling...</div>
            <div className="w-48 h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400"
                style={{ width: `${refuelProgress * 100}%`, transition: 'width 0.3s ease-out' }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-2.5 pointer-events-none">
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
