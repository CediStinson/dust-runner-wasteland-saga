import React, { useState } from 'react';
import { Save, Settings, LogOut } from 'lucide-react';
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
  onLogout?: () => void;
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
  onLogout
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
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-2.5 pointer-events-none">
        <div className="container mx-auto flex justify-between">
          <div className="pointer-events-auto flex gap-2">
            <button 
              onClick={() => setShowControls(!showControls)}
              className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
            
            <button 
              onClick={handleSaveGame}
              className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
              aria-label="Save"
            >
              <Save size={18} />
            </button>
            
            {user && (
              <button 
                onClick={handleLogout}
                className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center scale-85 origin-top">
            <DayNightIndicator dayTimeIcon={dayTimeIcon} dayTimeAngle={dayTimeAngle} />
            
            <CompassIndicator 
              worldX={worldX} 
              worldY={worldY} 
              baseWorldX={baseWorldX} 
              baseWorldY={baseWorldY} 
            />
          </div>
        </div>
      </div>
      
      <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="bg-gray-800/90 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-4">Game Controls</h2>
            
            <div className="text-gray-300 space-y-3">
              <div className="flex justify-between">
                <span>Move Player:</span>
                <span>W, A, S, D</span>
              </div>
              <div className="flex justify-between">
                <span>Interact / Collect:</span>
                <span>E</span>
              </div>
              <div className="flex justify-between">
                <span>Mount / Dismount Hoverbike:</span>
                <span>F</span>
              </div>
              <div className="flex justify-between">
                <span>Repair Hoverbike (under tarp):</span>
                <span>R</span>
              </div>
              <div className="flex justify-between">
                <span>Drive Hoverbike:</span>
                <span>↑, ↓, ←, →</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowControls(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
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
          <ResourcesDisplay resources={resources} copper={copper} />
          
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
