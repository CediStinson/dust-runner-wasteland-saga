
import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import WorldGenerator from '../world/WorldGenerator';
import { GameRenderer } from '../rendering/GameRenderer';
import { WorldData } from '../types/GameTypes';
import { QuestSystem } from './quests/QuestSystem';
import { GameStateManager } from './state/GameStateManager';
import { TimeManager } from './world/TimeManager';
import { WorldInteractionManager } from './world/WorldInteractionManager';
import { PlayerInteractionManager } from './player/PlayerInteractionManager';
import { GameInitializer } from './initialization/GameInitializer';

export default class Game {
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
  
  // Managers
  timeManager: TimeManager;
  stateManager: GameStateManager;
  worldInteractionManager: WorldInteractionManager;
  playerInteractionManager: PlayerInteractionManager;

  constructor(p: any) {
    this.p = p;
    
    // Initialize the game using the GameInitializer
    const initialState = new GameInitializer(p).initialize();
    
    // Set up properties from the initialization
    Object.assign(this, initialState);
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day using TimeManager
    this.timeManager.update(this.player, this.hoverbike);
    
    // Skip other updates if sleeping
    if (this.timeManager.sleepingInHut) {
      return;
    }
    
    // Update hoverbike if in the same area
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
      
      // Check for hoverbike-canister collisions
      this.worldInteractionManager.checkHoverbikeCanisterCollisions(
        this.hoverbike,
        this.worldX,
        this.worldY,
        this.riding,
        this.renderer
      );
    }
    
    this.player.update();
    
    // Handle world interactions through the WorldInteractionManager
    this.playerInteractionManager.handleHomeBaseInteractions(
      this.worldX,
      this.worldY,
      this.riding,
      this.timeManager
    );
    
    // Check if player crosses a border
    const borderUpdate = this.worldInteractionManager.checkBorder(
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.riding,
      this.renderer
    );
    
    this.worldX = borderUpdate.worldX;
    this.worldY = borderUpdate.worldY;
    
    this.worldGenerator.updateWindmillAngle();
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeManager.timeOfDay);
  }

  render() {
    if (!this.gameStarted) {
      const startClicked = this.stateManager.renderMainMenu();
      if (startClicked) {
        this.gameStarted = true;
      }
    } else {
      // Render the world first
      this.renderer.render();
      
      // Render quest UI
      this.stateManager.renderQuestUI(this.questSystem);
      
      // Render sleep animation if sleeping
      if (this.timeManager.sleepingInHut) {
        this.timeManager.renderSleepAnimation();
      }
      
      // Apply the day/night tint as an overlay
      this.timeManager.renderDayNightTint();
    }
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      if (key === ' ' || key === 'Enter') {
        this.gameStarted = true;
      }
      return;
    }
    
    const interactionResult = this.playerInteractionManager.handleKeyPress(
      key,
      this.riding,
      this.worldX,
      this.worldY,
      () => this.isPlayerUnderTarp()
    );
    
    this.riding = interactionResult.riding;
  }

  isPlayerUnderTarp(): boolean {
    return this.worldInteractionManager.isPlayerUnderTarp(
      this.player,
      this.worldX,
      this.worldY
    );
  }

  showMessage(message: string, duration: number = 3000) {
    console.log(`Game message: ${message}`);
  }

  resize() {
    this.worldGenerator.clearTextures();
    this.worldGenerator.generateNewArea(this.worldX, this.worldY);
  }
  
  handleClick(mouseX: number, mouseY: number) {
    const clickResult = this.playerInteractionManager.handleMouseClick(
      mouseX,
      mouseY,
      this.gameStarted
    );
    
    this.gameStarted = clickResult.gameStarted;
  }

  getWorldData(): WorldData {
    return this.worldInteractionManager.getWorldData();
  }
  
  loadWorldData(worldData: WorldData | null): void {
    this.worldInteractionManager.loadWorldData(worldData, this.worldX, this.worldY);
  }
  
  resetToStartScreen(): void {
    this.stateManager.resetGameState();
  }
}
