
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, LogOut } from 'lucide-react';

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
  onLogout
}) => {
  return (
    <div className="game-overlay absolute top-0 left-0 w-full pointer-events-none z-10 p-4">
      <div className="flex justify-between items-center">
        {/* Save Game Button */}
        <Button 
          variant="secondary" 
          size="sm" 
          className="pointer-events-auto"
          onClick={onSaveGame}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Game
        </Button>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          size="sm" 
          className="pointer-events-auto"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* You can add more UI components here, like resource displays, etc. */}
    </div>
  );
};

export default GameUI;
