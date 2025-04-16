
import Game from '../GameCore';
import { renderMainMenu } from '../ui/MainMenu';
import { renderQuestUI } from '../rendering/QuestRenderer';
import { QuestSystem } from '../quests/QuestSystem';
import { resetGameState } from './SaveLoadManager';
import { GameState } from '../../types/GameTypes';

/**
 * Cleanup any active actions, timers, or events in the game
 */
export function cleanupActiveActions(game: Game | null): void {
  if (!game) return;
  
  // Clean up player actions
  if (game.player) {
    game.player.isCollectingCanister = false;
    game.player.isRefuelingHoverbike = false;
    game.player.isRepairingHoverbike = false;
  }
  
  // Clean up game state
  game.sleepingInHut = false;
}

/**
 * Apply a saved game state to the current game instance
 */
export function applyGameState(game: Game, state: GameState): void {
  if (!game) return;
  
  // Apply player state
  if (game.player) {
    game.player.worldX = state.worldX || 0;
    game.player.worldY = state.worldY || 0;
    game.player.x = state.playerX || 0;
    game.player.y = state.playerY || 0;
    game.player.angle = state.playerAngle || 0;
    game.player.carryingFuelCanister = state.carryingFuelCanister || false;
    game.player.health = state.playerHealth || 0;
    game.player.maxHealth = state.maxPlayerHealth || 100;
    
    if (game.player.inventory) {
      game.player.inventory.metal = state.resources || 0;
      game.player.inventory.copper = state.copper || 0;
    }
  }
  
  // Apply hoverbike state
  if (game.hoverbike) {
    game.hoverbike.x = state.hoverbikeX || 0;
    game.hoverbike.y = state.hoverbikeY || 0;
    game.hoverbike.angle = state.hoverbikeAngle || 0;
    game.hoverbike.worldX = state.hoverbikeWorldX || 0;
    game.hoverbike.worldY = state.hoverbikeWorldY || 0;
    game.hoverbike.health = state.health || 0;
    game.hoverbike.fuel = state.fuel || 0;
  }
  
  // Apply world data
  if (state.worldData) {
    game.loadWorldData(state.worldData, state.worldX, state.worldY);
  }
  
  // Apply quest system data
  if (state.questSystem && game.questSystem) {
    game.questSystem = state.questSystem;
  }
  
  // Apply game state
  game.gameStarted = state.gameStarted || false;
  game.sleepingInHut = state.sleepingInHut || false;
  game.dayTimeIcon = state.dayTimeIcon || "sun";
  game.dayTimeAngle = state.dayTimeAngle || 0;
}

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
