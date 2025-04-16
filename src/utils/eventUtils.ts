
import { GameState, GameStateUpdateEvent } from '../types/GameTypes';

export function dispatchGameStateUpdate(state: GameState): void {
  const event = new CustomEvent('gameStateUpdate', {
    detail: state
  });
  window.dispatchEvent(event);
}

export function createGameStateEventListener(
  callback: (state: GameState) => void
): (event: Event) => void {
  return (event: Event) => {
    const gameStateEvent = event as GameStateUpdateEvent;
    if (gameStateEvent.detail) {
      callback(gameStateEvent.detail);
    }
  };
}
