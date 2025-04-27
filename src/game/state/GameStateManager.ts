
import { QuestSystem } from '../quests/QuestSystem';
import { renderMainMenu } from '../ui/MainMenu';
import { renderQuestUI } from '../../game/rendering/QuestRenderer';

export interface GameInitializationState {
  p: any;
  player: any;
  hoverbike: any;
  worldGenerator: any;
  renderer: any;
  worldX: number;
  worldY: number;
  riding: boolean;
  gameStarted: boolean;
  exploredAreas: Set<string>;
  tarpColor: { r: number; g: number; b: number; };
  questSystem: QuestSystem;
  militaryCrateLocation: { worldX: number, worldY: number };
  timeManager: any;
  stateManager: GameStateManager;
  worldInteractionManager: any;
  playerInteractionManager: any;
}

export class GameStateManager {
  game: GameInitializationState | null;
  
  constructor(game: GameInitializationState | null) {
    this.game = game;
  }
  
  renderMainMenu(): boolean {
    if (!this.game) return false;
    return renderMainMenu(this.game.p);
  }
  
  renderQuestUI(questSystem: QuestSystem): void {
    if (!this.game || !questSystem) return;
    renderQuestUI(this.game.p, questSystem);
  }
  
  resetGameState(): void {
    if (!this.game) return;
    this.game.gameStarted = false;
  }
}

// Add the missing cleanupActiveActions function
export function cleanupActiveActions(game: any): void {
  if (!game) return;
  
  // Clean up any active timeouts or intervals
  // This is a basic implementation - expand as needed
  console.log("Cleaning up active actions...");
  
  // Reset game state if needed
  if (game.stateManager) {
    game.stateManager.resetGameState();
  }
}
