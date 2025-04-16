
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GameState, GameStateUpdateEvent } from '../types/GameTypes';
import { createGameStateEventListener } from '../utils/eventUtils';
import { handleSaveGame, handleLoadGame, handleResetGame } from '../utils/saveLoadUtils';
import { useNavigate } from 'react-router-dom';

const defaultGameState: GameState = {
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
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Load saved game on initial mount if user is logged in
  useEffect(() => {
    const loadSavedGame = async () => {
      if (user) {
        const result = await handleLoadGame(user, true);
        if (result.success && result.data) {
          setGameState(result.data);
          
          // Dispatch event to notify the game sketch component
          const loadEvent = new CustomEvent('loadGameState', {
            detail: result.data
          });
          window.dispatchEvent(loadEvent);
        }
      }
    };
    
    loadSavedGame();
  }, [user]);
  
  // Listen for game state updates from the game engine
  useEffect(() => {
    const handleGameStateUpdate = createGameStateEventListener((state: GameState) => {
      setGameState(prev => ({...prev, ...state}));
    });
    
    window.addEventListener('gameStateUpdate', handleGameStateUpdate as EventListener);
    
    return () => {
      window.removeEventListener('gameStateUpdate', handleGameStateUpdate as EventListener);
    };
  }, []);
  
  // Handle saving game state
  const saveGame = useCallback(async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your game progress.",
        variant: "destructive",
      });
      navigate('/login');
      return { success: false };
    }

    return await handleSaveGame(user, gameState);
  }, [user, gameState, navigate, toast]);
  
  // Handle resetting game state
  const resetGame = useCallback(async () => {
    if (!user) return { success: false };
    
    const result = await handleResetGame(user);
    
    if (result.success) {
      // Dispatch reset event
      const event = new CustomEvent('resetGameState');
      window.dispatchEvent(event);
      
      // Reset local state
      setGameState(defaultGameState);
    }
    
    return result;
  }, [user]);
  
  // Handle logging out
  const handleLogout = useCallback(async () => {
    const event = new CustomEvent('logoutUser');
    window.dispatchEvent(event);
  }, []);
  
  return {
    gameState,
    setGameState,
    saveGame,
    resetGame,
    handleLogout
  };
}
