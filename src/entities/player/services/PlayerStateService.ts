
import { PlayerState, PlayerInventory } from '../../../types/PlayerTypes';
import { emitGameStateUpdate } from '../../../utils/gameUtils';

export class PlayerStateService {
  constructor(private p: any) {}

  initializePlayerState(x: number, y: number): PlayerState {
    return {
      x,
      y,
      velX: 0,
      velY: 0,
      worldX: 0,
      worldY: 0,
      angle: 0,
      lastAngle: 0,
      health: 100,
      carryingFuelCanister: false,
      canisterCollectCooldown: 0,
      digging: false,
      isDigging: true,
      digTimer: 0,
      digTarget: null,
      cactusDamageCooldown: 0
    };
  }

  initializePlayerInventory(): PlayerInventory {
    return {
      metal: 0,
      copper: 0
    };
  }

  updatePosition(state: PlayerState, x: number, y: number): void {
    state.x = x;
    state.y = y;
  }

  setWorldCoordinates(state: PlayerState, x: number, y: number): void {
    state.worldX = x;
    state.worldY = y;
  }
}
