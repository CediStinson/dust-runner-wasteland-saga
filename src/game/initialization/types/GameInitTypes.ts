
import Player from '../../../entities/Player';
import Hoverbike from '../../../entities/Hoverbike';
import WorldGenerator from '../../../world/WorldGenerator';
import GameRenderer from '../../../rendering/GameRenderer';
import { QuestSystem } from '../../quests/QuestSystem';
import { TimeManager } from '../../world/TimeManager';
import { GameStateManager } from '../../state/GameStateManager';
import { WorldInteractionManager } from '../../world/WorldInteractionManager';
import { PlayerInteractionManager } from '../../player/PlayerInteractionManager';

export interface GameInitializationState {
  p: any;
  player: Player;
  hoverbike: Hoverbike;
  worldGenerator: WorldGenerator;
  renderer: GameRenderer;
  worldX: number;
  worldY: number;
  riding: boolean;
  gameStarted: boolean;
  exploredAreas: Set<string>;
  tarpColor: { r: number; g: number; b: number; };
  questSystem: QuestSystem;
  militaryCrateLocation: { worldX: number, worldY: number };
  timeManager: TimeManager;
  stateManager: GameStateManager;
  worldInteractionManager: WorldInteractionManager;
  playerInteractionManager: PlayerInteractionManager;
}
