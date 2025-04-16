
import Game from '../GameCore';
import { renderMainMenu } from '../ui/MainMenu';
import { renderQuestUI } from '../rendering/QuestRenderer';
import { QuestSystem } from '../quests/QuestSystem';
import { resetGameState } from './SaveLoadManager';
import { cleanupActiveActions } from './GameStateManager';

export class GameStateManager {
  game: Game;
  
  constructor(game: Game) {
    this.game = game;
  }
  
  renderMainMenu(): boolean {
    return renderMainMenu(this.game.p);
  }
  
  renderQuestUI(questSystem: QuestSystem): void {
    renderQuestUI(this.game.p, questSystem);
  }
  
  resetGameState(): void {
    // Clean up any active events or intervals
    cleanupActiveActions(this.game);
    resetGameState(this.game);
  }
}
