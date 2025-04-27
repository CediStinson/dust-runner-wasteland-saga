
import { QuestSystem } from '../quests/QuestSystem';
import { renderMainMenu } from '../ui/MainMenu';
import { renderQuestInfo } from '../rendering/QuestRenderer';
import { GameInitializationState } from '../initialization/GameInitializer';

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
    renderQuestInfo(this.game.p, questSystem);
  }
  
  resetGameState(): void {
    if (!this.game) return;
    this.game.gameStarted = false;
  }
}
