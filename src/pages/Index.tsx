import { useEffect, useRef, useState } from 'react';
import GameSketch from '../components/GameSketch';
import GameUI from '../components/GameUI';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/game.css';
import { saveGameState, loadGameState } from '@/lib/supabase';
import { GameState, GameStateUpdateEvent } from '../types/GameTypes';
import { createGameStateEventListener } from '../utils/eventUtils';

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    resources: 0,
    copper: 0,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    maxFuel: 100,
    playerHealth: 100,
    maxPlayerHealth: 100,
    worldX: 0,
    worldY: 0,
    playerX: 0,
    playerY: 0,
    playerAngle: 0,
    carryingFuelCanister: false,
    hoverbikeX: 0,
    hoverbikeY: 0,
    hoverbikeAngle: 0,
    hoverbikeWorldX: 0,
    hoverbikeWorldY: 0,
    dayTimeIcon: "sun",
    dayTimeAngle: 0,
    worldData: null,
    gameStarted: false
  });
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSaveGame = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your game progress.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    const result = await saveGameState(user.id, gameState);
    
    if (result.success) {
      toast({
        title: "Game saved",
        description: result.message,
      });
    } else {
      toast({
        title: "Save failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };
  
  const handleLoadGameState = (savedState: GameState) => {
    if (!savedState) return;
    setGameState(savedState);
    
    const loadEvent = new CustomEvent('loadGameState', {
      detail: savedState
    });
    window.dispatchEvent(loadEvent);
  };
  
  const handleLogout = async () => {
    if (user) {
      try {
        const event = new CustomEvent('logoutUser');
        window.dispatchEvent(event);
        
        await signOut();
        
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
      } catch (error) {
        toast({
          title: "Logout failed",
          description: "There was a problem logging you out.",
          variant: "destructive",
        });
      }
    }
  };
  
  useEffect(() => {
    const loadSavedGame = async () => {
      if (user) {
        const result = await loadGameState(user.id);
        if (result.success && result.data) {
          handleLoadGameState(result.data);
          toast({
            title: "Game loaded",
            description: "Your saved game has been loaded successfully.",
          });
        }
      }
    };
    
    loadSavedGame();
  }, [user]);
  
  useEffect(() => {
    const handleGameStateUpdate = createGameStateEventListener((state: GameState) => {
      setGameState(prev => ({...prev, ...state}));
    });
    
    window.addEventListener('gameStateUpdate', handleGameStateUpdate as EventListener);
    
    return () => {
      window.removeEventListener('gameStateUpdate', handleGameStateUpdate as EventListener);
    };
  }, []);
  
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
        onSaveGame={handleSaveGame}
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
