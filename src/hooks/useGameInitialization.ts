
import { useRef } from 'react';
import p5 from 'p5';
import Game from '../game/Game';
import { cleanupActiveActions } from '../game/state/GameStateManager';
import { GameState, GameStateUpdateEvent } from '../types/GameTypes';
import { dispatchGameStateUpdate } from '../utils/eventUtils';

export const useGameInitialization = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  const setupEventListeners = (gameInstance: Game | null) => {
    const handleLoadGameState = (event: Event) => {
      if (gameRef.current && (event as GameStateUpdateEvent).detail) {
        const savedState = (event as GameStateUpdateEvent).detail;
        
        if (savedState.diaryEntries && Array.isArray(savedState.diaryEntries)) {
          if (gameRef.current.questSystem) {
            gameRef.current.questSystem.diaryEntries = savedState.diaryEntries;
          }
        }
      }
    };

    const handleResetGameState = () => {
      if (!gameRef.current) return;
      
      console.log("Completely resetting game state");
      cleanupActiveActions(gameRef.current);
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    const handleLogout = () => {
      if (!gameRef.current) return;
      
      cleanupActiveActions(gameRef.current);
      gameRef.current.resetToStartScreen();
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    window.addEventListener('loadGameState', handleLoadGameState as EventListener);
    window.addEventListener('resetGameState', handleResetGameState as EventListener);
    window.addEventListener('logoutUser', handleLogout as EventListener);
    window.addEventListener('beforeunload', () => cleanupActiveActions(gameRef.current));

    return () => {
      cleanupActiveActions(gameRef.current);
      window.removeEventListener('loadGameState', handleLoadGameState as EventListener);
      window.removeEventListener('resetGameState', handleResetGameState as EventListener);
      window.removeEventListener('logoutUser', handleLogout as EventListener);
      window.removeEventListener('beforeunload', () => cleanupActiveActions(gameRef.current));
    };
  };

  return { sketchRef, gameRef, setupEventListeners };
};
