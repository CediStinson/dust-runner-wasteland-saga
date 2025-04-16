
import { GameState } from '../types/GameTypes';

/**
 * Dispatch a game state update event with the current game state
 */
export function dispatchGameStateUpdate(gameState: GameState): void {
  const event = new CustomEvent('gameStateUpdate', {
    detail: gameState
  });
  window.dispatchEvent(event);
}

/**
 * Dispatch a load game state event
 */
export function dispatchLoadGameState(gameState: GameState): void {
  const event = new CustomEvent('loadGameState', {
    detail: gameState
  });
  window.dispatchEvent(event);
}

/**
 * Dispatch a reset game state event
 */
export function dispatchResetGameState(): void {
  const event = new CustomEvent('resetGameState');
  window.dispatchEvent(event);
}

/**
 * Dispatch a logout user event
 */
export function dispatchLogoutUser(): void {
  const event = new CustomEvent('logoutUser');
  window.dispatchEvent(event);
}

/**
 * Helper function to create event listeners for game state updates
 */
export function createGameStateEventHandler(handler: (state: GameState) => void): EventListener {
  return ((event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      handler(customEvent.detail as GameState);
    }
  }) as EventListener;
}

/**
 * Register all game event listeners
 */
export function registerGameEventListeners(
  onGameStateUpdate: (state: GameState) => void,
  onLoadGameState: (state: GameState) => void,
  onResetGameState: () => void,
  onLogoutUser: () => void
): () => void {
  const gameStateUpdateHandler = createGameStateEventHandler(onGameStateUpdate);
  const loadGameStateHandler = createGameStateEventHandler(onLoadGameState);
  
  window.addEventListener('gameStateUpdate', gameStateUpdateHandler);
  window.addEventListener('loadGameState', loadGameStateHandler);
  window.addEventListener('resetGameState', onResetGameState);
  window.addEventListener('logoutUser', onLogoutUser);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('gameStateUpdate', gameStateUpdateHandler);
    window.removeEventListener('loadGameState', loadGameStateHandler);
    window.removeEventListener('resetGameState', onResetGameState);
    window.removeEventListener('logoutUser', onLogoutUser);
  };
}
