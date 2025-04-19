import React, { useState } from 'react';
import { Save, Settings, LogOut, BookText } from 'lucide-react';
import DayNightIndicator from './ui/game/DayNightIndicator';
import CompassIndicator from './ui/game/CompassIndicator';
import ResourcesDisplay from './ui/game/ResourcesDisplay';
import StatusBars from './ui/game/StatusBars';
import ControlsModal from './ui/game/ControlsModal';
import AmbienceLighting from './ui/game/AmbienceLighting';
import DiaryModal from './ui/game/DiaryModal';
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
  gameStarted?: boolean;
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
  onLogout,
  gameStarted = false
}) => {
  const [showControls, setShowControls] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <>
      <AmbienceLighting dayTimeIcon={dayTimeIcon} dayTimeAngle={dayTimeAngle} />
      
      <TopBar 
        showControls={showControls}
        setShowControls={setShowControls}
        showDiary={showDiary}
        setShowDiary={setShowDiary}
        handleSaveGame={onSaveGame || (() => toast({
          title: "Save function not available",
          description: "The save function is not currently available.",
          variant: "destructive",
        }))}
        handleLogout={onLogout || (() => {})}
        user={user}
        dayTimeIcon={dayTimeIcon}
        dayTimeAngle={dayTimeAngle}
        worldX={worldX}
        worldY={worldY}
        baseWorldX={baseWorldX}
        baseWorldY={baseWorldY}
      />
      
      <ControlsModal showControls={showControls} setShowControls={setShowControls} />
      <DiaryModal showDiary={showDiary} setShowDiary={setShowDiary} />
      
      {refueling && <RefuelingIndicator progress={refuelProgress} />}
      
      <BottomBar 
        resources={resources}
        copper={copper}
        playerHealth={playerHealth}
        maxPlayerHealth={maxPlayerHealth}
        health={health}
        maxHealth={maxHealth}
        fuel={fuel}
        maxFuel={maxFuel}
      />
    </>
  );
};

interface TopBarProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  showDiary: boolean;
  setShowDiary: (show: boolean) => void;
  handleSaveGame: () => void;
  handleLogout: () => void;
  user: any;
  dayTimeIcon: string;
  dayTimeAngle: number;
  worldX: number;
  worldY: number;
  baseWorldX: number;
  baseWorldY: number;
}

const TopBar: React.FC<TopBarProps> = ({
  showControls,
  setShowControls,
  showDiary,
  setShowDiary,
  handleSaveGame,
  handleLogout,
  user,
  dayTimeIcon,
  dayTimeAngle,
  worldX,
  worldY,
  baseWorldX,
  baseWorldY
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-2.5 pointer-events-none">
      <div className="container mx-auto flex justify-between">
        <div className="pointer-events-auto flex gap-2">
          <button 
            onClick={() => setShowControls(!showControls)}
            className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors w-10 h-10 flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
          
          <button 
            onClick={() => setShowDiary(!showDiary)}
            className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors w-10 h-10 flex items-center justify-center"
            aria-label="Diary"
          >
            <BookText size={18} />
          </button>
          
          <button 
            onClick={handleSaveGame}
            className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors w-10 h-10 flex items-center justify-center"
            aria-label="Save"
          >
            <Save size={18} />
          </button>
          
          {user && (
            <button 
              onClick={handleLogout}
              className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors w-10 h-10 flex items-center justify-center"
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
  );
};

interface RefuelingIndicatorProps {
  progress: number;
}

const RefuelingIndicator: React.FC<RefuelingIndicatorProps> = ({ progress }) => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="bg-black/70 p-2 rounded-lg backdrop-blur-md border border-white/20">
        <div className="text-white text-center mb-1 text-sm">Refueling...</div>
        <div className="w-48 h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400"
            style={{ width: `${progress * 100}%`, transition: 'width 0.3s ease-out' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

interface BottomBarProps {
  resources: number;
  copper: number;
  playerHealth: number;
  maxPlayerHealth: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
}

const BottomBar: React.FC<BottomBarProps> = ({
  resources,
  copper,
  playerHealth,
  maxPlayerHealth,
  health,
  maxHealth,
  fuel,
  maxFuel
}) => {
  return (
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
  );
};

const StatusBars: React.FC<StatusBarsProps> = ({
  playerHealth,
  maxPlayerHealth,
  health,
  maxHealth,
  fuel,
  maxFuel
}) => {
  return (
    <div className="flex flex-col gap-1 items-end scale-90 origin-bottom-right">
      <div className="bg-black/50 p-2 rounded-lg backdrop-blur-sm text-red-200 border border-red-500/30 w-32">
        <div className="w-full h-2 bg-red-900/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 rounded-full" 
            style={{ width: `${(playerHealth / maxPlayerHealth) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-center mt-1">PLAYER</div>
      </div>
      
      <div className="bg-black/50 p-2 rounded-lg backdrop-blur-sm text-gray-200 border border-gray-500/30 w-32">
        <div className="w-full h-2 bg-gray-900/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-400 rounded-full" 
            style={{ width: `${(health / maxHealth) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-mono text-center mt-1">HOVERBIKE</div>
      </div>
      
      <div className="bg-black/50 p-2 rounded-lg backdrop-blur-sm text-yellow-200 border border-yellow-500/30 w-32">
        <div className="w-full h-2 bg-yellow-900/70 rounded-full overflow-hidden">
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

export default GameUI;
