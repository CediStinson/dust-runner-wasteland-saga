import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import WorldGenerator from '../world/WorldGenerator';
import GameRenderer from '../rendering/GameRenderer';
import { emitGameStateUpdate } from '../utils/gameUtils';

// Import core modules
import { initializeQuestSystem, QuestSystem } from './quests/QuestSystem';
import { updateQuestSystem } from './quests/QuestUpdater';
import { placeMilitaryCrate } from './quests/MilitaryCrateQuest';
import { renderQuestUI } from './rendering/QuestRenderer';
import { isPlayerUnderTarpWrapper } from './world/HomeBaseHelper';
import { checkHoverbikeCanisterCollisions } from './world/WorldInteraction';
import { isNightTime, updateTimeOfDay } from './world/TimeSystem';
import { startSleeping, updateSleeping, endSleeping, renderSleepAnimation } from './player/SleepSystem';
import { renderMainMenu } from './ui/MainMenu';
import { checkBorder } from './world/WorldBorder';

// Import new modules
import { 
  handleKeyPress, 
  handleMouseClick,
  handleHutInteraction 
} from './player/PlayerInteractionHandler';
import { 
  generateTarpColor,
  initializeEnvironment 
} from './world/EnvironmentalEffects';
import { 
  getWorldData,
  loadWorldData,
  resetGameState 
} from './state/SaveLoadManager';
import { WorldData } from '../types/GameTypes';

export default class Game {
  p: any;
  player: Player;
  hoverbike: Hoverbike;
  worldGenerator: WorldGenerator;
  renderer: GameRenderer;
  worldX: number;
  worldY: number;
  riding: boolean;
  timeOfDay: number;
  dayLength: number; // In frames
  nightLength: number; // In frames
  gameStarted: boolean;
  dayTimeIcon: string; // "sun" or "moon"
  dayTimeAngle: number; // Position on the circle
  exploredAreas: Set<string>; // Track explored areas
  dayTint: { r: number; g: number; b: number; a: number };
  sleepingInHut: boolean;
  sleepStartTime: number;
  sleepAnimationTimer: number;
  sleepParticles: Array<{x: number, y: number, z: number, opacity: number, yOffset: number, size: number}>;
  tarpColor: { r: number; g: number; b: number; };
  questSystem: QuestSystem;
  militaryCrateLocation: { worldX: number, worldY: number };

  constructor(p: any) {
    this.p = p;
    this.worldX = 0;
    this.worldY = 0;
    this.riding = false;
    this.timeOfDay = 0.25; // Start at sunrise
    this.dayLength = 60 * 60 * 5; // 5 minutes in frames (at 60fps)
    this.nightLength = 60 * 60 * 5; // 5 minutes in frames
    this.gameStarted = false;
    this.dayTimeIcon = "sun"; // Start with the sun
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2; // Calculate initial angle
    this.exploredAreas = new Set<string>(); // Initialize empty set of explored areas
    this.dayTint = { r: 255, g: 255, b: 255, a: 0 }; // Default tint (no tint)
    this.sleepingInHut = false;
    this.sleepStartTime = 0;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
    
    // Initialize quest system
    this.questSystem = initializeQuestSystem();
    
    // Generate random tarp color
    this.tarpColor = generateTarpColor();
    
    this.worldGenerator = new WorldGenerator(p);
    // Adjust WorldGenerator's canister spawn rate
    this.worldGenerator.FUEL_CANISTER_CHANCE = 0.15; // Increase chance of fuel canisters
    
    // Initialize player and hoverbike with references to each other
    // We need to create placeholder objects first
    this.player = {} as Player;
    this.hoverbike = {} as Hoverbike;
    
    // Now fully initialize them with proper references
    this.player = new Player(
      p, 
      p.width / 2, 
      p.height / 2 - 50, 
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(), 
      this.worldGenerator.getResources(),
      this.hoverbike,
      this.riding,
      this  // Pass the game instance to the player
    );
    
    // Position the hoverbike under the tarp (slightly to the left of the hut)
    this.hoverbike = new Hoverbike(
      p, 
      p.width / 2 - 120, // Position under the tarp
      p.height / 2 - 50, // Align with the hut's y position
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(),
      this.player
    );
    
    // Update player to reference the proper hoverbike
    this.player.hoverbike = this.hoverbike;
    
    this.renderer = new GameRenderer(
      p,
      this.worldGenerator,
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.timeOfDay
    );
    
    // Mark initial area as explored
    this.exploredAreas.add('0,0');
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Initialize environment
    initializeEnvironment(this.p, this.worldGenerator, this.tarpColor);
    
    // Place military crate
    this.militaryCrateLocation = placeMilitaryCrate(this.p, this.worldGenerator);
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day
    const timeUpdate = updateTimeOfDay(this.p, this.timeOfDay, this.dayLength, this.nightLength);
    this.timeOfDay = timeUpdate.timeOfDay;
    this.dayTimeIcon = timeUpdate.dayTimeIcon;
    this.dayTimeAngle = timeUpdate.dayTimeAngle;
    this.dayTint = timeUpdate.dayTint;
    
    // Handle sleeping in hut logic
    if (this.sleepingInHut) {
      const sleepUpdate = updateSleeping(
        this.p, 
        this.timeOfDay, 
        this.sleepAnimationTimer, 
        this.sleepParticles
      );
      
      this.timeOfDay = sleepUpdate.timeOfDay;
      this.sleepAnimationTimer = sleepUpdate.sleepAnimationTimer;
      this.sleepParticles = sleepUpdate.sleepParticles;
      
      if (sleepUpdate.shouldEndSleep) {
        this.sleepingInHut = false;
        endSleeping(this.p, this.player, this.hoverbike);
      }
      
      return; // Skip other updates while sleeping
    }
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
      
      // Check for hoverbike-canister collisions
      checkHoverbikeCanisterCollisions(
        this.p,
        this.hoverbike,
        this.worldX,
        this.worldY,
        this.riding,
        this.worldGenerator,
        this.renderer
      );
    }
    
    this.player.update();
    
    // Update quest system
    updateQuestSystem(
      this.questSystem, 
      this.player, 
      this.hoverbike, 
      this.p, 
      this.worldX, 
      this.worldY,
      this.militaryCrateLocation
    );
    
    // Check for hut interactions
    if (!this.riding && this.worldX === 0 && this.worldY === 0) {
      const hutInteraction = handleHutInteraction(this.player, this.timeOfDay, isNightTime);
      
      if (hutInteraction.shouldStartSleeping) {
        const sleepState = startSleeping(this.p, this.timeOfDay);
        this.sleepingInHut = sleepState.sleepingInHut;
        this.sleepStartTime = sleepState.sleepStartTime;
        this.sleepAnimationTimer = sleepState.sleepAnimationTimer;
        this.sleepParticles = sleepState.sleepParticles;
      }
    }
    
    // Check if player crosses a border
    const borderUpdate = checkBorder(
      this.p,
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.riding,
      this.renderer,
      this.worldGenerator,
      this.exploredAreas
    );
    
    this.worldX = borderUpdate.worldX;
    this.worldY = borderUpdate.worldY;
    
    this.worldGenerator.updateWindmillAngle();
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeOfDay);
  }

  render() {
    if (!this.gameStarted) {
      const startClicked = renderMainMenu(this.p);
      if (startClicked) {
        this.gameStarted = true;
      }
    } else {
      // Render the world first
      this.renderer.render();
      
      // Render quest UI
      renderQuestUI(this.p, this.questSystem);
      
      // Render sleep animation if sleeping
      if (this.sleepingInHut) {
        renderSleepAnimation(this.p, this.sleepParticles);
      }
      
      // Apply the day/night tint as an overlay
      this.p.push();
      this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a);
      this.p.noStroke();
      this.p.rect(0, 0, this.p.width, this.p.height);
      this.p.pop();
    }
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      if (key === ' ' || key === 'Enter') {
        this.gameStarted = true;
      }
      return;
    }
    
    const interactionResult = handleKeyPress(
      key,
      this.player,
      this.hoverbike,
      this.riding,
      this.worldX,
      this.worldY,
      this.p,
      this.worldGenerator,
      () => this.isPlayerUnderTarp()
    );
    
    this.riding = interactionResult.riding;
  }

  isPlayerUnderTarp(): boolean {
    return isPlayerUnderTarpWrapper(this.p, this.player, this.worldX, this.worldY, this.worldGenerator);
  }

  showMessage(message: string, duration: number = 3000) {
    console.log(`Game message: ${message}`);
  }

  resize() {
    this.worldGenerator.clearTextures();
    this.worldGenerator.generateNewArea(this.worldX, this.worldY);
  }
  
  handleClick(mouseX: number, mouseY: number) {
    const clickResult = handleMouseClick(
      mouseX,
      mouseY,
      this.gameStarted,
      this.p
    );
    
    this.gameStarted = clickResult.gameStarted;
  }

  getWorldData(): WorldData {
    return getWorldData(this.exploredAreas, this.worldGenerator);
  }
  
  loadWorldData(worldData: WorldData | null): void {
    loadWorldData(worldData, this.worldGenerator, this.exploredAreas, this.worldX, this.worldY);
  }
  
  resetToStartScreen(): void {
    // Clean up any active events or intervals
    resetGameState(this);
  }
}
