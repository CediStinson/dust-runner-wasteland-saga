
import { TimeManager } from '../../world/TimeManager';
import { GameStateManager } from '../../state/GameStateManager';
import { WorldInteractionManager } from '../../world/WorldInteractionManager';
import { PlayerInteractionManager } from '../../player/PlayerInteractionManager';
import type { GameInitializationState } from '../types/GameInitTypes';
import Player from '../../../entities/Player';
import Hoverbike from '../../../entities/Hoverbike';
import WorldGenerator from '../../../world/WorldGenerator';

export class ManagerInitializer {
  constructor(private p: any) {}

  initializeManagers(
    player: Player,
    hoverbike: Hoverbike,
    worldGenerator: WorldGenerator,
    exploredAreas: Set<string>
  ): {
    timeManager: TimeManager;
    stateManager: GameStateManager;
    worldInteractionManager: WorldInteractionManager;
    playerInteractionManager: PlayerInteractionManager;
  } {
    const timeManager = new TimeManager(this.p);
    const stateManager = new GameStateManager(null);
    const worldInteractionManager = new WorldInteractionManager(
      this.p, worldGenerator, exploredAreas
    );
    const playerInteractionManager = new PlayerInteractionManager(
      this.p, player, hoverbike, worldGenerator
    );

    return {
      timeManager,
      stateManager,
      worldInteractionManager,
      playerInteractionManager
    };
  }
}
