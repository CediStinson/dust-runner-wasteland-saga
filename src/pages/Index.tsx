
import { useRef } from 'react';
import GameSketch from '../components/GameSketch';
import GameUI from '../components/GameUI';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/game.css';
import { useGameState } from '../hooks/useGameState';

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { gameState, saveGame, handleLogout } = useGameState();
  
  return (
    <div className="game-container relative" ref={gameContainerRef}>
      <GameSketch />
      <GameUI 
        resources={gameState.resources}
        copper={gameState.copper}
        health={gameState.health}
        maxHealth={gameState.maxHealth}
        fuel={gameState.fuel}
        maxFuel={gameState.maxFuel}
        playerHealth={gameState.playerHealth}
        maxPlayerHealth={gameState.maxPlayerHealth}
        worldX={gameState.worldX}
        worldY={gameState.worldY}
        baseWorldX={0}
        baseWorldY={0}
        dayTimeIcon={gameState.dayTimeIcon}
        dayTimeAngle={gameState.dayTimeAngle}
        onSaveGame={saveGame}
        onLogout={handleLogout}
      />
      
      {!user && !gameState.gameStarted && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-center">
          <Link to="/login">
            <Button variant="default" size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              Login to Save Progress
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;

