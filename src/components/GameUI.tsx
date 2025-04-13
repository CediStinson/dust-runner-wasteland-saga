
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, LogOut } from 'lucide-react';
import StatusBars from '@/components/ui/game/StatusBars';
import ResourcesDisplay from '@/components/ui/game/ResourcesDisplay';
import CompassIndicator from '@/components/ui/game/CompassIndicator';
import DayNightIndicator from '@/components/ui/game/DayNightIndicator';
import DiaryButton from './DiaryButton';
import DiaryModal from '@/components/ui/game/DiaryModal';

interface GameUIProps {
  resources: number;
  copper: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
  playerHealth: number;
  maxPlayerHealth: number;
  worldX: number;
  worldY: number;
  baseWorldX: number;
  baseWorldY: number;
  dayTimeIcon: string;
  dayTimeAngle: number;
  onSaveGame: () => void;
  onLogout: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  resources,
  copper,
  health,
  maxHealth,
  fuel,
  maxFuel,
  playerHealth,
  maxPlayerHealth,
  worldX,
  worldY,
  baseWorldX,
  baseWorldY,
  dayTimeIcon,
  dayTimeAngle,
  onSaveGame,
  onLogout,
}) => {
  const [showDiary, setShowDiary] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top right UI */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 pointer-events-auto">
        <Button variant="outline" size="sm" onClick={onSaveGame}>
          <Save className="w-4 h-4 mr-2" />
          Save Game
        </Button>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Status bars */}
      <div className="absolute bottom-2 left-2 pointer-events-none">
        <StatusBars 
          health={health} 
          maxHealth={maxHealth} 
          fuel={fuel} 
          maxFuel={maxFuel} 
          playerHealth={playerHealth}
          maxPlayerHealth={maxPlayerHealth}
        />
      </div>

      {/* Resources display */}
      <div className="absolute top-2 left-2 pointer-events-none">
        <ResourcesDisplay resources={resources} copper={copper} />
      </div>

      {/* Compass indicator */}
      <div className="absolute top-12 right-2 pointer-events-none">
        <CompassIndicator 
          worldX={worldX} 
          worldY={worldY} 
          baseWorldX={baseWorldX} 
          baseWorldY={baseWorldY} 
        />
      </div>

      {/* Day/Night indicator */}
      <div className="absolute top-12 left-2 pointer-events-none">
        <DayNightIndicator 
          icon={dayTimeIcon} 
          angle={dayTimeAngle} 
        />
      </div>
      
      {/* Diary Button */}
      <div className="absolute bottom-32 right-2 pointer-events-auto">
        <DiaryButton onClick={() => setShowDiary(true)} />
      </div>
      
      {/* Diary Modal */}
      <DiaryModal showDiary={showDiary} setShowDiary={setShowDiary} />
    </div>
  );
};

export default GameUI;
